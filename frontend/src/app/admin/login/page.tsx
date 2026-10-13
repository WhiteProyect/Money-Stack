'use client';

// Login del panel admin (F5). El access token queda SOLO en memoria
// (src/lib/api.ts) y el refresh en la cookie httpOnly del backend.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, ApiError } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/admin');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401 || err.code === 'INVALID_CREDENTIALS'
            ? 'Correo o contraseña incorrectos.'
            : err.code === 'ACCOUNT_LOCKED'
              ? 'Cuenta bloqueada por intentos fallidos. Contacta al super admin.'
              : err.message
        );
      } else {
        setError('No se pudo iniciar sesión. Intenta de nuevo.');
      }
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--depth-0)] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--depth-4)] bg-[var(--depth-1)] p-8">
        <p className="hud hud-accent text-xs">Acceso restringido</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Panel admin</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Inicia sesión con tus credenciales de administrador.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-[var(--color-error,#ff7d8b)] bg-[rgba(255,125,139,0.08)] p-3 text-sm"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="hud text-xs">
              Correo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--depth-4)] bg-[var(--depth-2)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              placeholder="admin@ejemplo.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="hud text-xs">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--depth-4)] bg-[var(--depth-2)] px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--depth-0)] transition-transform hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-[var(--depth-0)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}
