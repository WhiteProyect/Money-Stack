import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="hud hud-accent text-sm">Error 404</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--text-primary)]">
        Señal perdida
      </h1>
      <p className="mt-4 max-w-md text-[var(--text-secondary)]">
        La página que buscas no existe o fue movida. Vuelve al inicio o
        explora el catálogo y la agenda.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--depth-0)] shadow-[0_0_16px_var(--accent-glow)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[var(--depth-0)]"
        >
          Ir al inicio
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
        <Link
          href="/eventos"
          className="inline-flex items-center rounded-full border border-[var(--depth-4)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          Ver eventos
        </Link>
      </div>
    </main>
  );
}
