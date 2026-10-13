// Fetch de la API desde Server Components (RSC). No lleva token: solo se usan
// en endpoints públicos. Si la API no responde se lanza un error tipado que
// las páginas traducen a un estado amigable.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ServerApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ServerApiError';
    this.status = status;
    this.code = code;
  }
}

export function isApiUnavailable(err: unknown): boolean {
  return err instanceof ServerApiError && err.status === 0;
}

export interface ServerFetchOptions {
  revalidate?: number | false;
  tags?: string[];
  cache?: RequestCache;
}

async function serverFetch(path: string, options: ServerFetchOptions = {}): Promise<any> {
  const fetchInit: RequestInit = {};

  if (options.cache) {
    fetchInit.cache = options.cache;
  } else if (options.revalidate !== undefined || options.tags !== undefined) {
    fetchInit.next = {
      ...(options.revalidate !== undefined ? { revalidate: options.revalidate } : {}),
      ...(options.tags ? { tags: options.tags } : {}),
    };
  } else {
    // Por defecto en endpoints públicos: revalidación cada 60s (ISR)
    fetchInit.next = { revalidate: 60 };
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, fetchInit);
  } catch {
    throw new ServerApiError(0, 'API_UNAVAILABLE', 'No se pudo conectar con la API');
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = body?.error;
    throw new ServerApiError(
      res.status,
      err?.code ?? 'UNKNOWN',
      err?.message ?? `Error ${res.status}`
    );
  }
  return body;
}

// GET que devuelve { data }
export async function serverGet<T>(path: string, options?: ServerFetchOptions): Promise<T> {
  const body = await serverFetch(path, options);
  return body.data as T;
}

// GET que devuelve { data, pagination }
export async function serverGetList<T>(
  path: string,
  options?: ServerFetchOptions
): Promise<{ data: T[]; pagination: import('./types').Pagination }> {
  return serverFetch(path, options);
}

// Construye una query string desde un objeto ignorando valores vacíos.
export function qs(params: Record<string, string | number | boolean | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '' || value === null) continue;
    sp.set(key, String(value));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}
