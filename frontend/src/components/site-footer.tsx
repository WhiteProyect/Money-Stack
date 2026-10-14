import Link from 'next/link';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-[#00ff87]/20 bg-[#040507] font-mono relative overflow-hidden">
      {/* Resplandor verde fósforo inferior */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-24 bg-[#00ff87]/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Manifiesto callejero */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-black border border-[#00ff87]/50">
                <span className="text-xs font-black text-[#00ff87]">MS</span>
              </div>
              <span className="text-base font-black tracking-widest text-white">
                MONEY-STACK
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 font-sans">
              Sello discográfico independiente de Caucasia, Antioquia.
              Música callejera, producción de audio pesada y tarimas en vivo para la nueva escena urbana.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="rounded bg-black border border-[#00ff87]/40 px-2 py-0.5 text-[9px] text-[#00ff87]">
                [CALLE 20 HQ]
              </span>
              <span className="rounded bg-black border border-[#facc15]/40 px-2 py-0.5 text-[9px] text-[#facc15]">
                [100% RAW]
              </span>
            </div>
          </div>

          {/* Navegación táctica */}
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#00ff87] mb-3">
              // Directorio
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/artistas" className="hover:text-[#00ff87] transition-colors">
                  &gt; Cartel de Artistas
                </Link>
              </li>
              <li>
                <Link href="/eventos" className="hover:text-[#00ff87] transition-colors">
                  &gt; Agenda de Shows
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-[#00ff87] transition-colors">
                  &gt; Booking & Contrataciones
                </Link>
              </li>
              <li>
                <Link href="/el-sello" className="hover:text-[#00ff87] transition-colors">
                  &gt; Manifiesto del Sello
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#00ff87] transition-colors">
                  &gt; Consola de Administración
                </Link>
              </li>
            </ul>
          </div>

          {/* Coordenadas & Hub */}
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#00e5ff] mb-3">
              // Coordenadas
            </p>
            <div className="rounded border border-[#00ff87]/20 bg-black/80 p-3 text-[11px] text-slate-300 space-y-1">
              <p className="text-white font-bold">ESTUDIOS MONEY-STACK</p>
              <p className="text-slate-400">Caucasia, Antioquia — Colombia</p>
              <p className="text-[#00ff87] font-bold">LAT: 07°59&apos;N // LON: 75°12&apos;W</p>
            </div>
          </div>

          {/* Legal Ley 1581 */}
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#facc15] mb-3">
              // Cumplimiento Legal
            </p>
            <p className="text-xs leading-relaxed text-slate-400 font-sans mb-3">
              Tratamiento de datos personales de bookings y solicitudes bajo la Ley 1581 de 2012 de Colombia.
            </p>
            <Link
              href="/politica-de-datos"
              className="text-xs text-[#00ff87] hover:underline"
            >
              Leer política de datos →
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {year} MONEY-STACK // TODOS LOS DERECHOS RESERVADOS</p>
          <p className="text-[#00ff87]">BAJO CAUCA SOUND SYSTEM</p>
        </div>
      </div>
    </footer>
  );
}
