'use client';

import Link from 'next/link';
import Image from 'next/image';
import DepthHeroLazy from '@/components/depth-hero-lazy';
import AudioVisualizer from '@/components/audio-visualizer';
import Interactive3DCard from '@/components/interactive-3d-card';

export default function ElectricHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#07090e]/95 p-6 md:p-10 lg:p-14 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)]">
      {/* Esquinas tácticas en gris titanio */}
      <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-slate-300 z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-slate-300 z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-slate-300 z-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-slate-300 z-20 pointer-events-none" />

      {/* Topografía 3D de frecuencias y wireframe canvas */}
      <DepthHeroLazy />

      {/* Resplandores ambientales oscuros y titanio */}
      <div className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-slate-400/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      {/* Ticker callejero superior infinito */}
      <div className="relative z-10 -mx-6 md:-mx-10 lg:-mx-14 -mt-6 md:-mt-10 lg:-mt-14 mb-8 overflow-hidden border-b border-white/10 bg-black/70 py-1.5 font-mono text-[10px] text-slate-400">
        <div className="flex w-max animate-marquee space-x-8 uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            MONEY-STACK RECORDS // CAUCASIA STREET SECTOR
          </span>
          <span className="text-slate-500">//</span>
          <span className="text-slate-200">808 SUB-BASS ANALOG SYNTH ACTIVE</span>
          <span className="text-slate-500">//</span>
          <span>LAT 07°59&apos;N LON 75°12&apos;W</span>
          <span className="text-slate-500">//</span>
          <span className="text-slate-200">CATÁLOGO INDEPENDIENTE 2026</span>
          <span className="text-slate-500">//</span>
          <span>ROSTER CONFIRMADO &amp; BOOKING ABIERTO</span>
          <span className="text-slate-500">//</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            MONEY-STACK RECORDS // CAUCASIA STREET SECTOR
          </span>
          <span className="text-slate-500">//</span>
          <span className="text-slate-200">808 SUB-BASS ANALOG SYNTH ACTIVE</span>
          <span className="text-slate-500">//</span>
          <span>LAT 07°59&apos;N LON 75°12&apos;W</span>
        </div>
      </div>

      <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center">
        {/* Columna izquierda: Manifiesto callejero en grises titanio y cromo */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Badges superiores estilo consola de titanio */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 rounded bg-black/80 border border-white/20 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.08)]">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              STUDIO-CONSOLE // CAUCASIA SECTOR
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-black/80 border border-red-500/50 px-2.5 py-1 text-[11px] font-mono font-bold text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-rec" />
              REC ● 808 HARDWARE
            </span>
            <span className="inline-flex items-center rounded bg-black/80 border border-slate-700 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-300">
              STREET SERIES VOL. 01
            </span>
          </div>

          {/* Gran Título Callejero & Oscuro en Degradado Titanio Plateado */}
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl uppercase font-mono leading-[1.05]">
            El sonido callejero del{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]">
              Bajo Cauca
            </span>
          </h1>

          {/* Subtítulo crudo */}
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300 font-sans">
            Trap pesado, Drill crudo y Afrobeat ribereño grabado a 100 metros del río.
            Nacidos en Caucasia para retumbar en los parlantes de toda Colombia.
            Catálogo independiente, beats de calle y tarimas en vivo.
          </p>

          {/* Botones de acción tácticos con acabado cromo / titanio */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <Link
              href="/artistas"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-all hover:bg-slate-200 hover:scale-105 active:scale-95"
            >
              <span>Ver Cartel de Artistas</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/80 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-200 backdrop-blur-md transition-all hover:border-white/50 hover:bg-white/10"
            >
              <svg className="h-4 w-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>Agenda de Fechas</span>
            </Link>

            <Link
              href="/booking"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-200 hover:border-white/40 hover:bg-slate-800 transition-all"
            >
              <span>Booking Directo</span>
            </Link>
          </div>

          {/* Estadísticas de combate y calle en titanio */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 font-mono">
            <div className="rounded border border-white/10 bg-black/60 p-2.5">
              <p className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">+18M</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Streams Totales</p>
            </div>
            <div className="rounded border border-white/10 bg-black/60 p-2.5">
              <p className="text-2xl font-black text-slate-200">06</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Firmas en Cartel</p>
            </div>
            <div className="rounded border border-white/10 bg-black/60 p-2.5">
              <p className="text-2xl font-black text-slate-300">24+</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Shows en Vivo</p>
            </div>
            <div className="rounded border border-white/10 bg-black/60 p-2.5">
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Callejera &amp; Raw</p>
            </div>
          </div>
        </div>

        {/* Columna derecha: Drop Callejero con Tarjeta 3D interactiva */}
        <div className="lg:col-span-5 flex justify-center">
          <Interactive3DCard maxTilt={14} className="w-full max-w-sm">
            <div className="group relative w-full rounded-xl border border-white/20 bg-black/95 p-4 shadow-[0_25px_50px_rgba(0,0,0,0.95)] transition-all hover:border-white/50">
              {/* Esquinas tácticas internas en cromo */}
              <div className="absolute top-2 left-2 h-3 w-3 border-t-2 border-l-2 border-white/60 z-20 pointer-events-none" />
              <div className="absolute top-2 right-2 h-3 w-3 border-t-2 border-r-2 border-white/60 z-20 pointer-events-none" />

              <div className="relative aspect-square w-full overflow-hidden rounded bg-black">
                <Image
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop"
                  alt="Migg Flow en tarima nocturna"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125"
                />
                {/* Tinte oscuro plateado de alto contraste */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Retícula de mira en el centro */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="h-16 w-16 border border-white/40 rounded-full flex items-center justify-center">
                    <div className="h-1 w-1 bg-white rounded-full" />
                  </div>
                </div>

                {/* Badge REC callejero */}
                <div className="absolute top-3 left-3 flex items-center gap-2 rounded bg-black/80 border border-red-500/50 px-2.5 py-0.5 text-[10px] font-mono font-bold text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-rec" />
                  <span>REC // TARIMA EN VIVO</span>
                </div>

                {/* Frecuencias VU meter */}
                <div className="absolute bottom-3 right-3 bg-black/85 rounded px-2 py-1 border border-white/20">
                  <AudioVisualizer isPlaying={true} bars={10} className="h-4" />
                </div>
              </div>

              {/* Metadatos en tipografía stencil/monoespaciada */}
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    DROP #01 // MONEY-STACK
                  </span>
                  <h3 className="text-base font-black text-white">ORO Y CEMENTO</h3>
                  <p className="text-xs text-slate-400">Migg Flow ft. Yuri Beats</p>
                </div>
                <Link
                  href="/artistas/migg-flow"
                  className="flex h-9 w-9 items-center justify-center rounded bg-white text-black font-black shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform group-hover:scale-110"
                  aria-label="Ver artista"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </Interactive3DCard>
        </div>
      </div>
    </section>
  );
}
