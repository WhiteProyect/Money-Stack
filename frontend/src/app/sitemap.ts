import type { MetadataRoute } from 'next';
import { serverGetList, qs } from '@/lib/server-api';
import { absoluteUrl } from '@/lib/site';
import type { Artist, EventItem } from '@/lib/types';

// Sitemap dinámico (F6): páginas fijas + artistas activos + eventos próximos.
// Si la API no responde se genera solo con las páginas fijas (nunca 500).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const statics: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/artistas'), changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/eventos'), changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/booking'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/el-sello'), changeFrequency: 'yearly', priority: 0.5 },
    { url: absoluteUrl('/politica-de-datos'), changeFrequency: 'yearly', priority: 0.3 },
  ];

  let artists: Artist[] = [];
  let events: EventItem[] = [];

  const [artistsResult, eventsResult] = await Promise.allSettled([
    serverGetList<Artist>(`/artists${qs({ limit: 100 })}`),
    serverGetList<EventItem>(`/events${qs({ upcoming: true, limit: 100 })}`),
  ]);

  if (artistsResult.status === 'fulfilled') artists = artistsResult.value.data;
  if (eventsResult.status === 'fulfilled') events = eventsResult.value.data;

  return [
    ...statics,
    ...artists.map((a) => ({
      url: absoluteUrl(`/artistas/${a.slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...events.map((e) => ({
      url: absoluteUrl(`/eventos/${e.slug}`),
      lastModified: new Date(e.startsAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
