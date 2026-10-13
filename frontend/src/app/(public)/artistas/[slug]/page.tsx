import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EventCard from '@/components/event-card';
import JsonLd from '@/components/json-ld';
import { ApiUnavailable } from '@/components/api-states';
import { serverGet, serverGetList, ServerApiError, qs } from '@/lib/server-api';
import { musicGroupJsonLd } from '@/lib/jsonld';
import type { Artist, EventItem, SocialLinkKey } from '@/lib/types';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const artist = await serverGet<Artist>(`/artists/${slug}`);
    const description =
      artist.bio?.slice(0, 155) ??
      `${artist.name} — artista de Money-Stack. Géneros: ${artist.genres.join(', ') || 'varios'}.`;
    const image = artist.imageUrl ?? artist.coverUrl ?? undefined;
    return {
      title: artist.name,
      description,
      alternates: { canonical: `/artistas/${artist.slug}` },
      openGraph: {
        type: 'profile',
        title: artist.name,
        description,
        url: `/artistas/${artist.slug}`,
        ...(image ? { images: [{ url: image, alt: artist.name }] } : {}),
      },
      twitter: {
        card: image ? 'summary_large_image' : 'summary',
        title: artist.name,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    return { title: 'Artista' };
  }
}

const SOCIAL_LABELS: Record<SocialLinkKey, string> = {
  instagram: 'Instagram',
  spotify: 'Spotify',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  soundcloud: 'SoundCloud',
  web: 'Sitio web',
};

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;

  let artist: Artist;
  try {
    artist = await serverGet<Artist>(`/artists/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof ServerApiError && (err.status === 404 || err.status === 410)) notFound();
    throw err;
  }

  // Eventos próximos de este artista (independiente del resto de la página).
  const eventsResult = await Promise.allSettled([
    serverGetList<EventItem>(`/events${qs({ upcoming: true, artistSlug: slug, limit: 6 })}`),
  ]);
  const events =
    eventsResult[0].status === 'fulfilled' ? eventsResult[0].value.data : null;

  const socialEntries = Object.entries(artist.socialLinks ?? {}).filter(
    ([, url]) => typeof url === 'string' && url.length > 0
  ) as [SocialLinkKey, string][];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <JsonLd data={musicGroupJsonLd(artist)} />

      <nav aria-label="Migas de pan" className="hud text-xs">
        <Link href="/artistas" className="transition-colors hover:text-[var(--accent)]">
          Artistas
        </Link>
        <span aria-hidden="true" className="mx-2 opacity-50">
          /
        </span>
        <span className="text-[var(--text-secondary)]">{artist.name}</span>
      </nav>

      {/* Cabecera con portada */}
      <section className="relative mt-4 overflow-hidden rounded-2xl border border-[var(--depth-4)] bg-[var(--depth-2)]">
        <div className="relative h-48 w-full bg-[var(--depth-3)] md:h-64">
          {artist.coverUrl && (
            <Image
              src={artist.coverUrl}
              alt={`Portada de ${artist.name}`}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-80"
            />
          )}
        </div>
        <div className="relative -mt-16 flex flex-col gap-6 px-6 pb-8 md:flex-row md:items-end">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border-2 border-[var(--depth-4)] bg-[var(--depth-3)] md:h-40 md:w-40">
            {artist.imageUrl ? (
              <Image
                src={artist.imageUrl}
                alt={artist.name}
                fill
                priority
                sizes="(max-width: 768px) 128px, 160px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--text-muted)]" aria-hidden="true">
                <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25}>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {artist.isFeatured && (
                <span className="hud hud-accent rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[10px]">
                  ★ Destacado
                </span>
              )}
              {artist.isSigned && (
                <span className="hud rounded-full border border-[var(--depth-4)] px-2.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
                  Firma del sello
                </span>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
              {artist.name}
            </h1>
            {artist.genres.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Géneros">
                {artist.genres.map((g) => (
                  <li
                    key={g}
                    className="hud hud-accent rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[10px]"
                  >
                    {g}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {artist.isBookable && (
              <Link
                href={`/booking?artist=${artist.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--depth-0)] shadow-[0_0_16px_var(--accent-glow)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[var(--depth-0)]"
              >
                Contratar
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            {socialEntries.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {socialEntries.map(([key, url]) => (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-block rounded-full border border-[var(--depth-4)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                    >
                      {SOCIAL_LABELS[key]}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Biografía */}
      {artist.bio && (
        <section className="mt-10 max-w-3xl" aria-labelledby="bio">
          <p className="hud text-xs">Perfil</p>
          <h2 id="bio" className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
            Sobre {artist.name}
          </h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-[var(--text-secondary)]">
            {artist.bio}
          </p>
        </section>
      )}

      {/* Próximos eventos */}
      <section className="mt-12" aria-labelledby="proximos-eventos">
        <p className="hud text-xs">Agenda</p>
        <h2 id="proximos-eventos" className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
          Próximos eventos
        </h2>
        <div className="mt-4">
          {events === null ? (
            <ApiUnavailable />
          ) : events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--depth-4)] bg-[var(--depth-2)] p-8 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                Sin fechas programadas por ahora.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
