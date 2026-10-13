import Link from 'next/link';
import ArtistCard from '@/components/artist-card';
import EventCard from '@/components/event-card';
import DepthHeroLazy from '@/components/depth-hero-lazy';
import JsonLd from '@/components/json-ld';
import { ApiUnavailable, EmptyState } from '@/components/api-states';
import { serverGetList } from '@/lib/server-api';
import { ORGANIZATION_JSONLD } from '@/lib/jsonld';
import type { Artist, EventItem } from '@/lib/types';

// Datos reales desde la API: renderizado dinámico en cada petición.
export const dynamic = 'force-dynamic';

export const metadata = {
  // El layout aplica el template '%s — Money-Stack': aquí va solo la parte propia.
  title: 'Sello discográfico independiente desde Caucasia',
  description:
    'Sello discográfico independiente desde Caucasia, Antioquia. Catálogo de artistas, agenda de eventos y sistema de bookings musicales.',
};

export default async function HomePage() {
  // Datos independientes: si uno falla, la otra sección sigue funcionando.
  const [artistsResult, eventsResult] = await Promise.allSettled([
    serverGetList<Artist>('/artists?featured=true&limit=3'),
    serverGetList<EventItem>('/events?upcoming=true&limit=3'),
  ]);

  const artists = artistsResult.status === 'fulfilled' ? artistsResult.value.data : null;
  const events = eventsResult.status === 'fulfilled' ? eventsResult.value.data : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <JsonLd data={ORGANIZATION_JSONLD} />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--depth-4)] bg-[var(--depth-2)] px-6 py-16 text-center shadow-2xl">
        <DepthHeroLazy />
        <div className="grain scanlines vignette absolute inset-0" aria-hidden="true" />
        <div className="relative z-10">
          <p className="hud hud-accent text-sm mb-3">Sello discográfico independiente</p>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl">
            Music from the edge of the map
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            Desde Caucasia, Antioquia, cultivamos talento local y conectamos
            artistas con públicos, escenas y festivales. Catálogo, agenda y
            reservas abiertas.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/artistas"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--depth-0)] shadow-[0_0_16px_var(--accent-glow)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[var(--depth-0)]"
            >
              Ver artistas
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--depth-4)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-transform hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              Próximos eventos
            </Link>
          </div>
        </div>
      </section>

      {/* Próximos eventos */}
      <section className="mt-14" aria-labelledby="eventos-destacados">
        <div className="flex items-center justify-between">
          <div>
            <p className="hud text-xs">Agenda</p>
            <h2 id="eventos-destacados" className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
              Próximos eventos
            </h2>
          </div>
          <Link
            href="/eventos"
            className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--depth-0)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            Ver todos
          </Link>
        </div>
        <div className="mt-4">
          {events === null ? (
            <ApiUnavailable />
          ) : events.length === 0 ? (
            <EmptyState title="No hay eventos publicados" hint="Pronto anunciaremos nuevas fechas. Suscríbete a nuestras redes." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Artistas destacados */}
      <section className="mt-14" aria-labelledby="artistas-destacados">
        <div className="flex items-center justify-between">
          <div>
            <p className="hud text-xs">Catálogo</p>
            <h2 id="artistas-destacados" className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
              Artistas destacados
            </h2>
          </div>
          <Link
            href="/artistas"
            className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--depth-0)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            Explorar catálogo
          </Link>
        </div>
        <div className="mt-4">
          {artists === null ? (
            <ApiUnavailable />
          ) : artists.length === 0 ? (
            <EmptyState title="El catálogo está en preparación" hint="Muy pronto publicaremos nuestros artistas." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {artists.map((a) => (
                <ArtistCard key={a.id} artist={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA booking */}
      <section className="mt-16 rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-8 text-center">
        <p className="hud hud-accent text-sm">Contratación</p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
          ¿Quieres contratar a un artista?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[var(--text-secondary)]">
          Envía una solicitud con los detalles de tu evento. Revisamos cada
          petición y respondemos en los próximos días.
        </p>
        <Link
          href="/booking"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--depth-0)] shadow-[0_0_16px_var(--accent-glow)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[var(--depth-0)]"
        >
          Solicitar booking
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>
    </main>
  );
}
