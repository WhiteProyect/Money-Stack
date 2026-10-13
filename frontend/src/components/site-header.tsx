import Link from 'next/link';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/artistas', label: 'Artistas' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/el-sello', label: 'El sello' },
  { href: '/booking', label: 'Booking' },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--depth-4)] bg-[var(--depth-1)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          aria-label="Money-Stack, ir al inicio"
        >
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]"
          />
          <span className="font-[family-name:var(--font-display)] text-sm uppercase tracking-widest">
            Money-Stack
          </span>
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/admin"
                className="rounded-full border border-[var(--depth-4)] px-3 py-1 text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                Admin
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
