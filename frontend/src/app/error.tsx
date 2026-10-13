'use client';

// Error boundary de las rutas: evita la pantalla de 500 genérica cuando una página
// falla (API caída, parámetros inválidos, etc.) y permite reintentar.

import Link from 'next/link';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="hud hud-accent text-sm">Error</p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
        Algo salió mal
      </h1>
      <p className="mt-3 text-[var(--text-secondary)]">
        No pudimos cargar esta página. Intenta de nuevo o vuelve al inicio.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--depth-0)]"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-full border border-[var(--depth-4)] px-5 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
