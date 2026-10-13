// JSON-LD (F6): datos estructurados para buscadores y vistas previas.
// Se emiten como <script type="application/ld+json"> en las páginas.

import { absoluteUrl } from './site';

export const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Money-Stack',
  url: absoluteUrl('/'),
  description:
    'Sello discográfico independiente desde Caucasia, Antioquia, Colombia.',
  areaServed: 'Colombia',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Caucasia',
    addressRegion: 'Antioquia',
    addressCountry: 'CO',
  },
} as const;

export function musicGroupJsonLd(artist: {
  name: string;
  slug: string;
  bio?: string | null;
  genres: string[];
  imageUrl?: string | null;
  socialLinks?: Record<string, string | null> | null;
}) {
  const sameAs = Object.values(artist.socialLinks ?? {}).filter(
    (v): v is string => Boolean(v)
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: artist.name,
    url: absoluteUrl(`/artistas/${artist.slug}`),
    description: artist.bio ?? undefined,
    genre: artist.genres,
    image: artist.imageUrl ?? undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

export function musicEventJsonLd(event: {
  title: string;
  slug: string;
  description?: string | null;
  venueName: string;
  address?: string | null;
  city?: string | null;
  startsAt: string;
  endsAt?: string | null;
  coverUrl?: string | null;
  ticketUrl?: string | null;
  price?: number | null;
  artists: { name: string; slug: string; isHeadliner: boolean }[];
}) {
  const location: Record<string, unknown> = {
    '@type': 'Place',
    name: event.venueName,
  };
  if (event.address || event.city) {
    location.address = {
      '@type': 'PostalAddress',
      streetAddress: event.address ?? undefined,
      addressLocality: event.city ?? undefined,
      addressCountry: 'CO',
    };
  }

  const offers = event.ticketUrl
    ? {
        '@type': 'Offer',
        url: event.ticketUrl,
        availability: 'https://schema.org/InStock',
        ...(event.price !== null && event.price !== undefined
          ? {
              price: event.price,
              priceCurrency: 'COP',
            }
          : {}),
      }
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: event.title,
    url: absoluteUrl(`/eventos/${event.slug}`),
    description: event.description ?? undefined,
    startDate: event.startsAt,
    endDate: event.endsAt ?? undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location,
    image: event.coverUrl ?? undefined,
    performer: event.artists.map((a) => ({
      '@type': 'MusicGroup',
      name: a.name,
      url: absoluteUrl(`/artistas/${a.slug}`),
    })),
    offers,
  };
}
