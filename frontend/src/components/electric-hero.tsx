'use client';

import Link from 'next/link';
import Image from 'next/image';
import DepthHeroLazy from '@/components/depth-hero-lazy';
import AudioVisualizer from '@/components/audio-visualizer';

export default function ElectricHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#00ff87]/25 bg-[#0a0d14]/90 p-6 md:p-10 lg:p-14 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
      {/* Esquinas tácticas Night Vision */}
      <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-[#00ff87] z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-[#00ff87] z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#00ff87] z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#00ff87] z-20 pointer-events-none" />

      {/* Osciloscopio interactivo y radar de visión nocturna */}
      <DepthHeroLazy />

      {/* Resplandores ambientales verdes fósforo y asfalto */}
      <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-[#00ff87]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-[#00e5ff]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center">
        {/* Columna izquierda: Manifiesto callejero y títulos oscuros */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Badges superiores estilo consola militar / callejera */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 rounded bg-black/80 border border-[#00ff87]/50 px-2.5 py-1 text-[11px] font-mono font-bold text-[#00ff87] shadow-[0_0_12px_rgba(0,255,135,0.3)]">
              <span className="h-2 w-2 rounded-full bg-[#00ff87] animate-pulse" />
              NVG-ONLINE // SECTOR CAUCASIA
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-black/80 border border-red-500/50 px-2.5 py-1 text-[11px] font-mono font-bold text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-rec" />
              REC ● 808 SUB-BASS
            </span>
            <span className="inline-flex items-center rounded bg-black/80 border border-[#facc15]/40 px-2.5 py-1 text-[11px] font-mono font-bold text-[#facc15]">
              CALLE 20 CARTEL
            </span>
          </div>

          {/* Gran Título Callejero & Oscuro */}
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl uppercase font-mono leading-[1.05]">
            El sonido callejero del{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff87] via-[#00e5ff] to-[#facc15] nv-glow">
              Bajo Cauca
            </span>
          </h1>

          {/* Subtítulo crudo */}
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300 font-sans">
            Trap pesado, Drill crudo y Afrobeat ribereño grabado a 100 metros del río.
            Nacidos en Caucasia para retumbar en los parlantes de toda Colombia.
            Catálogo independiente, beats de calle y tarimas en vivo.
          </p>

          {/* Botones de acción tácticos */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <Link
              href="/artistas"
              className="inline-flex items-center gap-2 rounded-lg bg-[#00ff87] px-6 py-3 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[0_0_24px_rgba(0,255,135,0.5)] transition-all hover:bg-[#00e572] hover:scale-105 active:scale-95"
            >
              <span>Ver Cartel de Artistas</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 rounded-lg border border-[#00ff87]/30 bg-black/80 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#00ff87] backdrop-blur-md transition-all hover:border-[#00ff87] hover:bg-[#00ff87]/10"
            >
              <svg className="h-4 w-4 text-[#00ff87]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>Agenda de Fechas</span>
            </Link>

            <Link
              href="/booking"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#facc15]/50 bg-[#facc15]/10 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#facc15] hover:bg-[#facc15]/20 transition-all"
            >
              <span>Booking Directo</span>
            </Link>
          </div>

          {/* Estadísticas de combate y calle */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 font-mono">
            <div className="rounded border border-white/5 bg-black/50 p-2.5">
              <p className="text-2xl font-black text-[#00ff87] nv-glow">+18M</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Streams Totales</p>
            </div>
            <div className="rounded border border-white/5 bg-black/50 p-2.5">
              <p className="text-2xl font-black text-[#00e5ff]">06</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Firmas en Cartel</p>
            </div>
            <div className="rounded border border-white/5 bg-black/50 p-2.5">
              <p className="text-2xl font-black text-[#facc15]">24+</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Shows en Vivo</p>
            </div>
            <div className="rounded border border-white/5 bg-black/50 p-2.5">
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Callejera & Raw</p>
            </div>
          </div>
        </div>

        {/* Columna derecha: Drop Callejero con estética Night Vision */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="group relative w-full max-w-sm rounded-xl border border-[#00ff87]/30 bg-black/90 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] transition-all hover:border-[#00ff87]">
            {/* Esquinas tácticas internas */}
            <div className="absolute top-2 left-2 h-3 w-3 border-t-2 border-l-2 border-[#00ff87] z-20 pointer-events-none" />
            <div className="absolute top-2 right-2 h-3 w-3 border-t-2 border-r-2 border-[#00ff87] z-20 pointer-events-none" />

            <div className="relative aspect-square w-full overflow-hidden rounded bg-black">
              <Image
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop"
                alt="Migg Flow en tarima nocturna"
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale contrast-125"
              />
              {/* Tinte de visión nocturna verde fosforescente */}
              <div className="absolute inset-0 bg-[#00ff87]/15 mix-blend-color" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Retícula de mira en el centro */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="h-16 w-16 border border-[#00ff87] rounded-full flex items-center justify-center">
                  <div className="h-1 w-1 bg-[#00ff87] rounded-full" />
                </div>
              </div>

              {/* Badge REC callejero */}
              <div className="absolute top-3 left-3 flex items-center gap-2 rounded bg-black/80 border border-red-500/50 px-2.5 py-0.5 text-[10px] font-mono font-bold text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-rec" />
                <span>REC // TARIMA EN VIVO</span>
              </div>

              {/* Frecuencias VU meter */}
              <div className="absolute bottom-3 right-3 bg-black/80 rounded px-2 py-1 border border-[#00ff87]/30">
                <AudioVisualizer isPlaying={true} bars={10} className="h-4" />
              </div>
            </div>

            {/* Metadatos en tipografía stencil/monoespaciada */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#00ff87]">
                  DROP #01 // MONEY-STACK
                </span>
                <h3 className="font-mono text-base font-black text-white">ORO Y CEMENTO</h3>
                <p className="font-mono text-xs text-slate-400">Migg Flow ft. Yuri Beats</p>
              </div>
              <Link
                href="/artistas/migg-flow"
                className="flex h-9 w-9 items-center justify-center rounded bg-[#00ff87] text-black font-bold shadow-[0_0_12px_rgba(0,255,135,0.4)] transition-transform group-hover:scale-110"
                aria-label="Ver artista"
              >
                <svg className="h-4 w-4 fill-current translate-x-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
