// Cliente de la API (lado cliente).
//
// Contrato con la API (AGENTS.md):
// - Peticiones con credentials: 'include' (cookie httpOnly ms_refresh).
// - Access token SOLO en memoria (nunca localStorage/sessionStorage).
// - Un solo refresh a la vez (single-flight); ante REFRESH_RACE (409) se
//   reintenta una vez; ante 401 SESSION_EXPIRED se va a login (estado guest).
// - El refresh se programa con expiresIn (segundos) que devuelve el backend.

import type { SessionUser } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const AUTH_BASE = `${API_URL}/api/v1/auth`;

// Detalle de error de validación del backend: [{ field, message }].
export interface ApiErrorDetail {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: ApiErrorDetail[];

  constructor(
    status: number,
    code: string,
    message: string,
    details?: ApiErrorDetail[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export type SessionStatus = 'loading' | 'authed' | 'guest';

export interface SessionState {
  user: SessionUser | null;
  status: SessionStatus;
}

// ── Estado de sesión (solo memoria del módulo) ───────────────────────────────
let accessToken: string | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let refreshInFlight: Promise<boolean> | null = null;

let sessionState: SessionState = { user: null, status: 'loading' };
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

function setSession(partial: Partial<SessionState>) {
  sessionState = { ...sessionState, ...partial };
  notify();
}

export function getSessionState(): SessionState {
  return sessionState;
}

export function subscribeSession(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function applySession(data: {
  accessToken: string;
  expiresIn: number;
  user: SessionUser;
}) {
  accessToken = data.accessToken;
  scheduleRefresh(data.expiresIn);
  setSession({ user: data.user, status: 'authed' });
}

function clearSession() {
  accessToken = null;
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  setSession({ user: null, status: 'guest' });
}

// Programa el siguiente refresh 60 s antes de que venza el access token.
function scheduleRefresh(expiresInSeconds: number) {
  if (refreshTimer) clearTimeout(refreshTimer);
  const delay = Math.max((expiresInSeconds - 60) * 1000, 5_000);
  refreshTimer = setTimeout(() => {
    void doRefresh();
  }, delay);
}

async function readBody(res: Response): Promise<any | null> {
  if (res.status === 204) return null;
  return res.json().catch(() => null);
}

function toApiError(res: Response, body: any): ApiError {
  const err = body?.error;
  return new ApiError(
    res.status,
    err?.code ?? 'UNKNOWN',
    err?.message ?? `Error ${res.status}`,
    err?.details
  );
}

// ── Refresh (single-flight, reintento único ante REFRESH_RACE) ────────────────
async function performRefresh(): Promise<boolean> {
  try {
    const doFetch = () =>
      fetch(`${AUTH_BASE}/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

    let res = await doFetch();

    // REFRESH_RACE: otro refresh (otra pestaña) está en curso → reintentar una vez
    if (res.status === 409) {
      await new Promise((r) => setTimeout(r, 400));
      res = await doFetch();
      if (res.status === 409) {
        // Sigue en curso: no limpiar sesión, el otro refresh la renovará
        return false;
      }
    }

    const body = await readBody(res);
    if (res.ok && body?.data?.accessToken) {
      applySession(body.data);
      return true;
    }

    // 401 SESSION_EXPIRED u otro error de sesión → a login
    clearSession();
    return false;
  } catch {
    // Fallo de red: no destruir la sesión por un corte momentáneo
    return false;
  }
}

function doRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

// Restaura la sesión al cargar la app usando la cookie de refresh.
export async function restoreSession(): Promise<void> {
  if (sessionState.status !== 'loading') return;
  await doRefresh();
}

// ── Requests autenticados ─────────────────────────────────────────────────────
async function request<T>(
  path: string,
  init: RequestInit = {},
  allowRefresh = true
): Promise<T> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && allowRefresh) {
    const refreshed = await doRefresh();
    if (refreshed) return request<T>(path, init, false);
    throw new ApiError(401, 'SESSION_EXPIRED', 'Sesión inválida o expirada');
  }

  const body = await readBody(res);
  if (!res.ok) throw toApiError(res, body);
  return body as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const body = await request<{ data: T }>(path);
  return body.data;
}

export async function apiGetList<T>(
  path: string
): Promise<{ data: T[]; pagination: import('./types').Pagination }> {
  return request(path);
}

export async function apiPost<T>(path: string, data?: unknown): Promise<T> {
  const body = await request<{ data: T }>(path, {
    method: 'POST',
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  return body.data;
}

export async function apiPatch<T>(path: string, data: unknown): Promise<T> {
  const body = await request<{ data: T }>(path, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return body.data;
}

export async function apiPut<T>(path: string, data: unknown): Promise<T> {
  const body = await request<{ data: T }>(path, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return body.data;
}

// ── POST público (sin token): bookings y cualquier endpoint anónimo ─────────
// Reintenta una sola vez ante REFRESH_RACE (409) por si una pestaña admin
// está renovando tokens en paralelo; no lanza la sesión de admin por un 401.
export async function publicPost<T>(path: string, data?: unknown): Promise<T> {
  const doFetch = () =>
    fetch(`${API_URL}/api/v1${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data),
    });

  let res = await doFetch();
  if (res.status === 409) {
    await new Promise((r) => setTimeout(r, 400));
    res = await doFetch();
  }

  const body = await readBody(res);
  if (!res.ok) throw toApiError(res, body);
  return body as T;
}

// ── Sesión ────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<SessionUser> {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await readBody(res);
  if (!res.ok) throw toApiError(res, body);
  applySession(body.data);
  return body.data.user;
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${AUTH_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    clearSession();
  }
}

export async function logoutAll(): Promise<void> {
  try {
    await request('/auth/logout-all', { method: 'POST' });
  } finally {
    clearSession();
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
