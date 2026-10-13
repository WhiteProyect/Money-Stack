import Link from 'next/link';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[var(--depth-4)] bg-[var(--depth-0)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-[family-name:var(--font-display)] text-sm uppercase tracking-widest text-[var(--accent)]">
            Money-Stack
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Sello discográfico independiente desde Caucasia, Antioquia.
          </p>
        </div>

        <nav aria-label="Enlaces del pie de página">
          <p className="hud text-xs">Navegación</p>
          <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-secondary)]">
            <li>
              <Link href="/artistas" className="hover:text-[var(--accent)]">
                Artistas
              </Link>
            </li>
            <li>
              <Link href="/eventos" className="hover:text-[var(--accent)]">
                Eventos
              </Link>
            </li>
            <li>
              <Link href="/booking" className="hover:text-[var(--accent)]">
                Solicitar booking
              </Link>
            </li>
            <li>
              <Link href="/el-sello" className="hover:text-[var(--accent)]">
                El sello
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="hud text-xs">Legal</p>
          <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-secondary)]">
            <li>
              <Link href="/politica-de-datos" className="hover:text-[var(--accent)]">
                Política de datos
              </Link>
            </li>
          </ul>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Tratamos tus datos conforme a la Ley 1581 de 2012 (Colombia).
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--depth-4)] px-4 py-4 text-center text-xs text-[var(--text-muted)]">
        © {year} Money-Stack · Caucasia, Antioquia
      </div>
    </footer>
  );
}
