import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/json-ld';
import { ApiUnavailable } from '@/components/api-states';
import { serverGet, serverGetList, qs, ServerApiError } from '@/lib/server-api';
import { musicEventJsonLd } from '@/lib/jsonld';
import { formatDateRange, formatDate, formatPrice } from '@/lib/format';
import type { EventItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await serverGet<EventItem>(`/events/${encodeURIComponent(slug)}`);
    return {
      title: event.title,
      description:
        event.description?.slice(0, 155) ??
        `${event.title} — ${formatDate(event.startsAt)} en ${event.venueName}, ${event.city ?? 'Caucasia'}.`,
    };
  } catch {
    return { title: 'Evento' };
  }
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[var(--depth-4)] py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="hud w-28 shrink-0 text-xs">{label}</dt>
      <dd className="text-sm text-[var(--text-primary)]">{children}</dd>
    </div>
  );
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;

  let event: EventItem;
  try {
    event = await serverGet<EventItem>(`/events/${encodeURIComponent(slug)}`);
  } catch (err) {
    // 404: no existe. 410: cancelado (el backend responde así en público).
    if (err instanceof ServerApiError && (err.status === 404 || err.status === 410)) notFound();
    throw err;
  }

  const isPast = new Date(event.startsAt).getTime() < Date.now();
  const headliner = event.artists.find((a) => a.isHeadliner);
  const lineup = [...event.artists].sort((a, b) => a.order - b.order);

  let related: EventItem[] | null = null;
  if (headliner) {
    const relatedResult = await Promise.allSettled([
      serverGetList<EventItem>(
        `/events${qs({ upcoming: true, artistSlug: headliner.slug, limit: 3 })}`
      ),
    ]);
    related =
      relatedResult[0].status === 'fulfilled'
        ? relatedResult[0].value.data.filter((e) => e.id !== event.id)
        : null;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <JsonLd data={musicEventJsonLd(event)} />

      <nav aria-label="Migas de pan" className="hud text-xs">
        <Link href="/eventos" className="transition-colors hover:text-[var(--accent)]">
          Eventos
        </Link>
        <span aria-hidden="true" className="mx-2 opacity-50">
          /
        </span>
        <span className="text-[var(--text-secondary)]">{event.title}</span>
      </nav>

      <div className="mt-4 grid gap-10 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="lg:col-span-2">
          {event.coverUrl && (
            <div className="overflow-hidden rounded-2xl border border-[var(--depth-4)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.coverUrl}
                alt={`Portada de ${event.title}`}
                className="w-full object-cover"
              />
            </div>
          )}

          <header className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              {isPast && (
                <span className="hud rounded-full border border-[var(--depth-4)] px-2.5 py-0.5 text-[10px] text-[var(--text-muted)]">
                  Evento finalizado
                </span>
              )}
              {event.status === 'CANCELLED' && (
                <span className="hud rounded-full bg-[rgba(255,125,139,0.15)] px-2.5 py-0.5 text-[10px] text-[var(--color-error,#ff7d8b)]">
                  Cancelado
                </span>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
              {event.title}
            </h1>
            <p className="mt-2 text-[var(--text-secondary)]">
              {formatDateRange(event.startsAt, event.endsAt)} · {event.venueName}
              {event.city ? `, ${event.city}` : ''}
            </p>
          </header>

          {event.description && (
            <section className="mt-8 max-w-3xl" aria-labelledby="descripcion">
              <h2 id="descripcion" className="hud text-xs">
                Descripción
              </h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-[var(--text-secondary)]">
                {event.description}
              </p>
            </section>
          )}

          {/* Cartel */}
          {lineup.length > 0 && (
            <section className="mt-10" aria-labelledby="cartel">
              <p className="hud text-xs">Cartel</p>
              <h2 id="cartel" className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                Artistas en cartel
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {lineup.map((a, i) => (
                  <li key={a.artistId}>
                    <Link
                      href={`/artistas/${a.slug}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--depth-4)] bg-[var(--depth-3)] px-4 py-3 transition-colors hover:border-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                    >
                      <span className="flex items-center gap-3">
                        <span className="hud text-xs" aria-hidden="true">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-medium text-[var(--text-primary)]">{a.name}</span>
                      </span>
                      {a.isHeadliner && (
                        <span className="hud hud-accent rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[10px]">
                          Cabecartel
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Panel lateral: datos clave */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-6">
            <p className="hud hud-accent text-xs">Información</p>
            <dl className="mt-3">
              <InfoRow label="Fecha">
                <time dateTime={event.startsAt}>{formatDate(event.startsAt)}</time>
              </InfoRow>
              <InfoRow label="Venue">{event.venueName}</InfoRow>
              {event.address && <InfoRow label="Dirección">{event.address}</InfoRow>}
              {event.city && <InfoRow label="Ciudad">{event.city}</InfoRow>}
              <InfoRow label="Entrada">{formatPrice(event.price)}</InfoRow>
              {event.capacity !== null && event.capacity !== undefined && (
                <InfoRow label="Aforo">{event.capacity} personas</InfoRow>
              )}
            </dl>

            <div className="mt-5 flex flex-col gap-3">
              {event.ticketUrl && !isPast && event.status !== 'CANCELLED' && (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--depth-0)] shadow-[0_0_16px_var(--accent-glow)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[var(--depth-0)]"
                >
                  Comprar boletería
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              )}
              {headliner && (
                <Link
                  href={`/booking?artist=${headliner.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--depth-4)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  Contratar al artista
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Más eventos del artista principal */}
      {related && related.length > 0 && (
        <section className="mt-14" aria-labelledby="mas-eventos">
          <p className="hud text-xs">Agenda</p>
          <h2 id="mas-eventos" className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
            Más eventos de {headliner?.name}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/eventos/${e.slug}`}
                  className="block rounded-xl border border-[var(--depth-4)] bg-[var(--depth-3)] px-4 py-3 transition-colors hover:border-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  <p className="hud text-[10px]">{formatDate(e.startsAt)}</p>
                  <p className="mt-1 font-medium text-[var(--text-primary)]">{e.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{e.venueName}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related === null && headliner && <ApiUnavailable />}
    </main>
  );
}
