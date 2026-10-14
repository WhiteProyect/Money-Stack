import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/json-ld';
import { serverGet, serverGetList, qs } from '@/lib/server-api';
import { musicEventJsonLd } from '@/lib/jsonld';
import { formatDateRange, formatDate, formatPrice } from '@/lib/format';
import type { EventItem } from '@/lib/types';
import { SHOWCASE_EVENTS } from '@/lib/showcase-data';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let event: EventItem | undefined;
  try {
    event = await serverGet<EventItem>(`/events/${encodeURIComponent(slug)}`);
  } catch {
    event = SHOWCASE_EVENTS.find((e) => e.slug === slug);
  }

  if (!event) {
    return { title: 'Evento no encontrado // Money-Stack' };
  }

  const description =
    event.description?.slice(0, 155) ??
    `${event.title} — ${formatDate(event.startsAt)} en ${event.venueName}, ${event.city ?? 'Caucasia'}.`;
  const image = event.coverUrl ?? undefined;

  return {
    title: `${event.title} // Money-Stack Tarimas`,
    description,
    openGraph: {
      type: 'website',
      title: event.title,
      description,
      url: `/eventos/${event.slug}`,
      ...(image ? { images: [{ url: image, alt: event.title }] } : {}),
    },
  };
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/5 py-2.5 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4 font-mono text-xs">
      <dt className="w-28 shrink-0 uppercase text-slate-400 font-bold">{label}:</dt>
      <dd className="font-semibold text-white">{children}</dd>
    </div>
  );
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;

  let event: EventItem | null = null;
  try {
    event = await serverGet<EventItem>(`/events/${encodeURIComponent(slug)}`);
  } catch {
    event = SHOWCASE_EVENTS.find((e) => e.slug === slug) || null;
  }

  if (!event) {
    notFound();
  }

  const isPast = new Date(event.startsAt).getTime() < Date.now();
  const headliner = event.artists.find((a) => a.isHeadliner);
  const lineup = [...event.artists].sort((a, b) => a.order - b.order);

  let related: EventItem[] = [];
  if (headliner) {
    try {
      const res = await serverGetList<EventItem>(
        `/events${qs({ upcoming: true, artistSlug: headliner.slug, limit: 3 })}`
      );
      related = res.data.filter((e) => e.id !== event.id);
    } catch {
      related = SHOWCASE_EVENTS.filter((e) => e.id !== event.id).slice(0, 3);
    }
  }

  const cover =
    event.coverUrl ||
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1400&auto=format&fit=crop';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 font-mono">
      <JsonLd data={musicEventJsonLd(event)} />

      {/* Migas de pan estilo terminal */}
      <nav aria-label="Migas de pan" className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-[#00ff87] transition-colors">
          INICIO
        </Link>
        <span>/</span>
        <Link href="/eventos" className="hover:text-[#00ff87] transition-colors">
          EVENTOS
        </Link>
        <span>/</span>
        <span className="text-[#00ff87] font-bold">{event.title.toUpperCase()}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Columna principal */}
        <div className="lg:col-span-8 space-y-6">
          {/* Portada grande con efecto táctico */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#00ff87]/30 bg-black shadow-2xl">
            <Image
              src={cover}
              alt={`Portada de ${event.title}`}
              fill
              priority
              className="object-cover filter grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-[#00ff87]/10 mix-blend-color" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {isPast ? (
                <span className="rounded bg-black border border-white/20 px-2.5 py-1 text-[10px] font-bold text-slate-400">
                  EVENTO FINALIZADO
                </span>
              ) : event.status === 'CANCELLED' ? (
                <span className="rounded bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white">
                  CANCELADO
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded bg-[#00ff87] px-2.5 py-1 text-[10px] font-black text-black">
                  <span className="h-2 w-2 rounded-full bg-black animate-ping" />
                  FECHA CONFIRMADA
                </span>
              )}
            </div>
          </div>

          {/* Información */}
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#00ff87] font-bold">
              {formatDateRange(event.startsAt, event.endsAt)} · {event.venueName}
              {event.city ? `, ${event.city.toUpperCase()}` : ''}
            </p>
          </header>

          {/* Descripción */}
          {event.description && (
            <section className="rounded-xl border border-[#00ff87]/20 bg-[#090c12] p-6 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#facc15]">
                // SOBRE EL SHOW
              </h2>
              <p className="font-sans whitespace-pre-line leading-relaxed text-xs sm:text-sm text-slate-300">
                {event.description}
              </p>
            </section>
          )}

          {/* Cartel / Lineup Oficial */}
          {lineup.length > 0 && (
            <section className="rounded-xl border border-[#00ff87]/20 bg-[#090c12] p-6 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#00ff87]">
                // CARTEL EN TARIMA
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {lineup.map((a, i) => (
                  <li key={a.artistId}>
                    <Link
                      href={`/artistas/${a.slug}`}
                      className="flex items-center justify-between gap-2.5 rounded border border-white/10 bg-black/80 p-3 hover:border-[#00ff87] transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-[#0d1017] text-[10px] font-black text-[#00ff87]">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-bold text-xs text-white uppercase">{a.name}</span>
                      </div>
                      {a.isHeadliner && (
                        <span className="rounded bg-[#00ff87] px-2 py-0.5 text-[9px] font-black text-black">
                          HEADLINER
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Panel lateral de entradas */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20 rounded-xl border border-[#00ff87]/30 bg-[#090c12] p-6 shadow-2xl space-y-5">
            <div>
              <p className="text-[11px] font-bold uppercase text-[#facc15]">
                // BOLETERÍA OFICIAL
              </p>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">ENTRADA:</span>
                <span className="text-2xl font-black text-[#00ff87] nv-glow">
                  {formatPrice(event.price)}
                </span>
              </div>
            </div>

            <dl className="border-t border-white/10 pt-3">
              <InfoRow label="FECHA">
                <time dateTime={event.startsAt}>{formatDate(event.startsAt)}</time>
              </InfoRow>
              <InfoRow label="VENUE">{event.venueName}</InfoRow>
              {event.address && <InfoRow label="DIRECCIÓN">{event.address}</InfoRow>}
              {event.city && <InfoRow label="CIUDAD">{event.city.toUpperCase()}</InfoRow>}
              {event.capacity && (
                <InfoRow label="AFORO">{event.capacity.toLocaleString('es-CO')} PERSONAS</InfoRow>
              )}
            </dl>

            <div className="space-y-2.5 pt-1">
              {!isPast && event.status !== 'CANCELLED' && (
                <a
                  href={event.ticketUrl || 'https://tuboleta.com'}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="w-full inline-flex items-center justify-center gap-2 rounded bg-[#00ff87] py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(0,255,135,0.4)] hover:bg-[#00e572] transition-all"
                >
                  <span>Comprar Entradas Online</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              )}

              {headliner && (
                <Link
                  href={`/booking?artist=${headliner.slug}`}
                  className="w-full inline-flex items-center justify-center rounded border border-[#00ff87]/30 bg-black py-2.5 text-[11px] font-bold uppercase text-slate-300 hover:border-[#00ff87] hover:text-[#00ff87] transition-all"
                >
                  Contratar a {headliner.name}
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Más eventos */}
      {related.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-white/10">
          <h2 className="text-lg font-black uppercase text-white">Más Fechas Relacionadas</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((e) => (
              <Link
                key={e.id}
                href={`/eventos/${e.slug}`}
                className="rounded border border-white/10 bg-[#090c12] p-4 hover:border-[#00ff87] transition-all"
              >
                <p className="text-[10px] font-bold text-[#00ff87]">{formatDate(e.startsAt)}</p>
                <h3 className="mt-1 font-bold text-white uppercase text-xs line-clamp-1">{e.title}</h3>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">{e.venueName}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
