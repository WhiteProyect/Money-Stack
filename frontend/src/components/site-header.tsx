import Link from 'next/link';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/artistas', label: 'Artistas' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/el-sello', label: 'El Sello' },
  { href: '/booking', label: 'Booking' },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#00ff87]/20 bg-[#06080c]/95 backdrop-blur-xl transition-all font-mono">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand Logo táctico / callejero */}
        <Link
          href="/"
          className="group flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-[#00ff87]"
          aria-label="Money-Stack, ir al inicio"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded bg-black border border-[#00ff87]/60 p-0.5 shadow-[0_0_12px_rgba(0,255,135,0.4)] transition-transform group-hover:scale-105">
            <span className="font-mono text-sm font-black text-[#00ff87]">
              MS
            </span>
          </div>
          <div>
            <span className="block font-black text-sm tracking-widest text-white group-hover:text-[#00ff87] transition-colors">
              MONEY-STACK
            </span>
            <span className="block text-[8px] tracking-wider text-[#00ff87] uppercase">
              DISCOS // CAUCASIA STREET SECTOR
            </span>
          </div>
        </Link>

        {/* Links de navegación estilo terminal */}
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1 text-xs">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-1.5 font-bold uppercase tracking-wider text-slate-300 hover:text-[#00ff87] hover:bg-[#00ff87]/10 transition-all"
            >
              [{item.label}]
            </Link>
          ))}
        </nav>

        {/* CTAs callejeros */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/booking"
            className="hidden sm:inline-flex items-center gap-1.5 rounded bg-[#00ff87] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(0,255,135,0.4)] hover:bg-[#00e572] transition-all"
          >
            <span>Booking Directo</span>
          </Link>

          <Link
            href="/admin"
            className="rounded border border-white/10 bg-black/60 px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:border-[#00ff87] hover:text-[#00ff87] transition-all"
          >
            ADMIN
          </Link>
        </div>
      </div>
    </header>
  );
}
