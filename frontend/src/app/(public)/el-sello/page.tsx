import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'El Sello // Money-Stack Discos Caucasia',
  description:
    'Historia, visión y manifiesto callejero de Money-Stack, el sello discográfico independiente del Bajo Cauca antioqueño.',
};

const VALUES = [
  {
    icon: '🌊',
    title: 'Raíz Ribereña & Flow Callejero',
    body: 'Nacidos a la orilla del río Cauca. Sin poses ni artificios: música forjada en el calor, la resistencia y la cultura de la calle.',
  },
  {
    icon: '🎛️',
    title: 'Ingeniería Sonora Pesada',
    body: 'Beats con sub-bajos 808 calibrados para retumbar en cajas y sound systems. Mezcla analógica y masterización de alto impacto.',
  },
  {
    icon: '🎪',
    title: 'Tarimas & Festivales Reales',
    body: 'Llevamos la energía de la calle a los grandes escenarios. Producción técnica completa, montaje de luces y sonido profesional.',
  },
  {
    icon: '🤝',
    title: 'Trato Directo Sin Intermediarios',
    body: 'Contratos transparentes, riders técnicos claros y trato directo con los programadores de conciertos y festivales.',
  },
];

const MILESTONES = [
  {
    year: '2024',
    title: 'Fundación en Caucasia',
    desc: 'Primer laboratorio de grabación en el barrio El Pajonal con la meta de unir a los exponentes de la ribera.',
  },
  {
    year: '2025',
    title: '5M de Streams & Caucasia Fest',
    desc: 'Lanzamiento de singles clave y primer festival local autogestionado con tarima completa.',
  },
  {
    year: '2026',
    title: 'Consolidación & Roster Oficial',
    desc: '6 artistas firmados, giras departamentales y proyección hacia el mercado internacional.',
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12 font-mono">
      {/* Hero del sello */}
      <section className="relative overflow-hidden rounded-xl border border-[#00ff87]/30 bg-[#090c12] p-6 sm:p-12 shadow-2xl">
        <div className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-[#00ff87]" />
        <div className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-[#00ff87]" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-[#00ff87]" />
        <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#00ff87]" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded bg-black/80 border border-[#00ff87]/40 px-2.5 py-1 text-xs font-black text-[#00ff87]">
            <span className="h-2 w-2 rounded-full bg-[#00ff87] animate-pulse" />
            <span>// MANIFIESTO // INDEPENDIENTE DESDE 2024</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Nacidos en la{' '}
            <span className="text-[#00ff87] nv-glow">
              orilla del río
            </span>
          </h1>
          <p className="font-sans text-xs sm:text-base text-slate-300 leading-relaxed">
            Money-Stack es un sello discográfico independiente fundado en Caucasia, Antioquia.
            Conectamos el talento y la potencia sonora del Bajo Cauca con la industria musical global.
          </p>
        </div>
      </section>

      {/* Principios */}
      <section className="space-y-6" aria-labelledby="principios">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-[#facc15] font-black">
            // PILARES FUNDAMENTALES
          </p>
          <h2 id="principios" className="text-2xl font-black text-white uppercase">
            Nuestros Principios
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((v) => (
            <article
              key={v.title}
              className="rounded-xl border border-[#00ff87]/20 bg-[#0d1017] p-6 hover:border-[#00ff87] transition-all space-y-2"
            >
              <div className="text-2xl">{v.icon}</div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">{v.title}</h3>
              <p className="font-sans text-xs leading-relaxed text-slate-400">{v.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Línea de tiempo */}
      <section className="space-y-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-[#00e5ff] font-black">
            // HISTORIA CALLEJERA
          </p>
          <h2 className="text-2xl font-black text-white uppercase">
            Hitos del Movimiento
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {MILESTONES.map((m) => (
            <div
              key={m.year}
              className="rounded-xl border border-white/10 bg-[#090c12] p-5"
            >
              <span className="text-2xl font-black text-[#00ff87]">{m.year}</span>
              <h3 className="mt-1.5 text-sm font-black text-white uppercase">{m.title}</h3>
              <p className="mt-1 text-xs font-sans text-slate-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contacto & Booking */}
      <section className="rounded-xl border border-[#00ff87]/30 bg-black p-8 text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-white uppercase">
          ¿Interesado en una alianza o booking?
        </h2>
        <p className="font-sans text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Para contrataciones oficiales de artistas y cotización con rider técnico, usa el canal de booking oficial.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 rounded bg-[#00ff87] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-[#00e572] transition-all"
          >
            <span>Ir a Formulario de Booking</span>
            <span>→</span>
          </Link>
          <Link
            href="/politica-de-datos"
            className="inline-flex items-center rounded border border-[#00ff87]/30 bg-black px-5 py-2.5 text-xs font-bold uppercase text-slate-300 hover:text-white transition-all"
          >
            Política de Datos
          </Link>
        </div>
      </section>
    </div>
  );
}
