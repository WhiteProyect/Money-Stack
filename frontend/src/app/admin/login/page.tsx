'use client';

// Login del panel admin (F5 / Dark & Street Aesthetic).
// - Access token queda SOLO en memoria (src/lib/api.ts).
// - Refresh token en cookie httpOnly del backend (ms_refresh).
// - Diseño: Dark, callejero, industrial con identidad underground de Caucasia.

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, ApiError, describeApiError } from '@/lib/api';
import { MotionFade } from '@/components/motion-wrapper';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
            ? 'Credenciales no autorizadas. Verifica email y contraseña.'
            : err.code === 'ACCOUNT_LOCKED'
              ? 'Terminal bloqueada por intentos fallidos. Contacta al super admin.'
              : describeApiError(err, 'No se pudo autorizar el acceso.')
        );
      } else {
        setError('Error de enlace con el servidor. Intenta de nuevo.');
      }
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05060a] px-4 py-12 selection:bg-[var(--accent)] selection:text-[#05060a]">
      {/* ── 1. Fondo atmosférico: Grid de puntos + Neón radial + Marca de agua callejera ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(125, 255, 179, 0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      {/* Brillo radial verde en el centro */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(125,255,179,0.06)] blur-3xl"
        aria-hidden="true"
      />

      {/* Marca de agua tipográfica callejera en fondo */}
      <div
        className="pointer-events-none absolute select-none font-mono text-[14vw] font-black uppercase tracking-tighter text-white/[0.015] leading-none"
        aria-hidden="true"
      >
        CAUCASIA
      </div>

      {/* ── 2. Contenedor central (Chassis callejero) ── */}
      <MotionFade className="relative z-10 w-full max-w-md">
        {/* Barra superior de cinta industrial / advertencia */}
        <div className="mb-2 flex items-center justify-between px-2 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)] animate-pulse" />
            <span className="text-[var(--accent)] font-semibold">GATE_01 // SECURE_SHELL</span>
          </div>
          <span className="opacity-70">07°59&apos;N · 75°12&apos;W</span>
        </div>

        {/* Chasis principal estilo consola táctica underground */}
        <div className="relative rounded-2xl border border-[var(--depth-4)] bg-[rgba(11,13,20,0.92)] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(125,255,179,0.05)] backdrop-blur-xl">
          {/* Corchetes esquineros de visor (┌ ┐ └ ┘) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-1 -left-1 h-3.5 w-3.5 border-t-2 border-l-2 border-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-1 -right-1 h-3.5 w-3.5 border-t-2 border-r-2 border-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-1 -left-1 h-3.5 w-3.5 border-b-2 border-l-2 border-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-1 -right-1 h-3.5 w-3.5 border-b-2 border-r-2 border-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]"
          />

          {/* Cabecera: Marca urbana, equalizador y código de barras */}
          <div className="border-b border-[var(--depth-4)] pb-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[var(--accent-soft)] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] border border-[var(--accent)]/30">
                    RECORDS HQ
                  </span>
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">
                    CAUCASIA SOUND
                  </span>
                </div>
                <h1 className="mt-2 font-mono text-2xl font-black uppercase tracking-tight text-[var(--text-primary)] sm:text-3xl">
                  MONEY<span className="text-[var(--accent)]">-STACK</span>
                </h1>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Terminal de control administrativo y gestión del catálogo.
                </p>
              </div>

              {/* Animación visual de ecualizador / audio VU-meter */}
              <div
                className="flex items-end gap-1 h-7 pt-1 px-2 rounded bg-[var(--depth-0)] border border-[var(--depth-4)]"
                title="Audio monitor online"
                aria-hidden="true"
              >
                <span className="w-1 bg-[var(--accent)] h-3 animate-pulse rounded-t-sm" />
                <span className="w-1 bg-[var(--accent)] h-5 animate-pulse rounded-t-sm [animation-delay:150ms]" />
                <span className="w-1 bg-[var(--accent)] h-2 animate-pulse rounded-t-sm [animation-delay:300ms]" />
                <span className="w-1 bg-[var(--accent)] h-6 animate-pulse rounded-t-sm [animation-delay:450ms]" />
                <span className="w-1 bg-[var(--accent)] h-4 animate-pulse rounded-t-sm [animation-delay:200ms]" />
              </div>
            </div>

            {/* Código de barras decorativo callejero */}
            <div className="mt-4 flex items-center justify-between border-t border-[var(--depth-4)]/60 pt-3 text-[10px] font-mono text-[var(--text-muted)]" aria-hidden="true">
              <span className="tracking-[0.25em]">||| | |||| | |||||||| ||||</span>
              <span>SYS_AUTH // 2026</span>
            </div>
          </div>

          {/* Formulario de acceso */}
          <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
            {error && (
              <div
                role="alert"
                className="relative overflow-hidden rounded-xl border border-[var(--color-error,#ff7d8b)] bg-[rgba(255,125,139,0.1)] p-3 text-xs text-[var(--text-primary)]"
              >
                <div className="flex items-start gap-2">
                  <span className="text-[var(--color-error,#ff7d8b)] font-bold text-sm leading-none" aria-hidden="true">
                    ⚠
                  </span>
                  <div>
                    <strong className="block font-mono uppercase text-[var(--color-error,#ff7d8b)]">
                      Acceso denegado
                    </strong>
                    <span className="mt-0.5 block text-[var(--text-secondary)]">{error}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Campo 01: Identificador / Correo */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)]"
              >
                <span>// 01 · Correo administrativo</span>
                <span className="text-[10px] text-[var(--accent)]">REQUERIDO</span>
              </label>
              <div className="relative">
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-muted)]"
                  aria-hidden="true"
                >
                  <svg className="h-4 w-4 text-[var(--accent)]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  enterKeyHint="next"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@moneystack.co"
                  className="w-full rounded-xl border border-[var(--depth-4)] bg-[#07080d] py-2.5 pr-4 pl-10 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 transition-all focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] shadow-inner"
                />
              </div>
            </div>

            {/* Campo 02: Clave secreta */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)]"
              >
                <span>// 02 · Clave de seguridad</span>
                <span className="text-[10px] text-[var(--text-muted)]">ENCRIPTADA</span>
              </label>
              <div className="relative">
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-muted)]"
                  aria-hidden="true"
                >
                  <svg className="h-4 w-4 text-[var(--accent)]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  enterKeyHint="done"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[var(--depth-4)] bg-[#07080d] py-2.5 pr-11 pl-10 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 transition-all focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botón de acción: Impacto urbano neón */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--accent)] px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider text-[#05060a] shadow-[0_0_20px_var(--accent-glow)] transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_var(--accent-glow)] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {/* Micro destello de fondo al pasar el cursor */}
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  aria-hidden="true"
                />

                {submitting ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-[#05060a] border-t-transparent animate-spin" />
                    <span>AUTORIZANDO ACCESO…</span>
                  </>
                ) : (
                  <>
                    <span>AUTORIZAR ACCESO</span>
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Pie del chasis: Salida a la calle */}
          <div className="mt-6 border-t border-[var(--depth-4)]/70 pt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Salir a la calle · Portal público</span>
            </Link>
          </div>
        </div>

        {/* Nota legal y técnica bajo el chasis */}
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] opacity-60">
          Uso restringido a personal del sello · Ley 1581 de 2012 (Colombia)
        </p>
      </MotionFade>
    </main>
  );
}
