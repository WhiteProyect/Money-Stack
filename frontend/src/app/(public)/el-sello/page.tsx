import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'El sello',
  description:
    'Money-Stack es un sello discográfico independiente desde Caucasia, Antioquia: catálogo, agenda y bookings de artistas de la región.',
};

const VALUES = [
  {
    title: 'Raíz regional',
    body: 'Trabajamos con artistas de Caucasia y el Bajo Cauca antioqueño, con su idioma, su ritmo y su escena. El catálogo nace de aquí.',
  },
  {
    title: 'Catálogo con criterio',
    body: 'Cada lanzamiento se acompaña de arte, identidad y una estrategia de distribución digital. Nada se publica por publicar.',
  },
  {
    title: 'Puente hacia el público',
    body: 'Producimos y programamos eventos propios y apoyamos a terceros: la música existe cuando hay alguien enfrente.',
  },
  {
    title: 'Contratación transparente',
    body: 'El formulario de booking es el canal oficial. Cada solicitud se revisa y se responde, con tarifas claras y trato directo.',
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="hud hud-accent text-sm">El sello</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
          Un sello nacido en la orilla del río
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">
          Money-Stack es un sello discográfico independiente con base en
          Caucasia, Antioquia. Reunimos artistas, producimos lanzamientos,
          organizamos eventos y conectamos el talento de la región con
          públicos, escenas y festivales de todo el país.
        </p>
      </header>

      <section className="mt-12 grid gap-4 sm:grid-cols-2" aria-labelledby="principios">
        <h2 id="principios" className="sr-only">
          Principios
        </h2>
        {VALUES.map((v, i) => (
          <article
            key={v.title}
            className="rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-6"
          >
            <p className="hud hud-accent text-xs" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{v.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-8">
        <p className="hud text-xs">Contacto</p>
        <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
          ¿Colaboraciones, prensa o booking?
        </h2>
        <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
          Para contrataciones usa el formulario de booking: llega directo al
          equipo y recibe respuesta. Para prensa o alianas, escríbenos por
          nuestras redes.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--depth-0)] shadow-[0_0_16px_var(--accent-glow)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[var(--depth-0)]"
          >
            Solicitar booking
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/politica-de-datos"
            className="inline-flex items-center rounded-full border border-[var(--depth-4)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            Política de datos
          </Link>
        </div>
      </section>
    </div>
  );
}
