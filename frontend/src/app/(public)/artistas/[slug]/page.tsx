import Image from 'next/image';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EventCard from '@/components/event-card';
import JsonLd from '@/components/json-ld';
import AudioVisualizer from '@/components/audio-visualizer';
import { serverGet, serverGetList, qs } from '@/lib/server-api';
import { musicGroupJsonLd } from '@/lib/jsonld';
import type { Artist, EventItem, SocialLinkKey } from '@/lib/types';
import { SHOWCASE_ARTISTS, SHOWCASE_EVENTS } from '@/lib/showcase-data';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let artist: Artist | undefined;
  try {
    artist = await serverGet<Artist>(`/artists/${slug}`);
  } catch {
    artist = SHOWCASE_ARTISTS.find((a) => a.slug === slug);
  }

  if (!artist) {
    return { title: 'Artista no encontrado // Money-Stack' };
  }

  const description =
    artist.bio?.slice(0, 155) ??
    `${artist.name} — artista oficial de Money-Stack Discos en Caucasia.`;
  const image = artist.imageUrl ?? artist.coverUrl ?? undefined;

  return {
    title: `${artist.name} // Cartel Money-Stack`,
    description,
    openGraph: {
      type: 'profile',
      title: artist.name,
      description,
      ...(image ? { images: [{ url: image, alt: artist.name }] } : {}),
    },
  };
}

const SOCIAL_LABELS: Record<SocialLinkKey, { label: string; icon: string }> = {
  instagram: { label: 'Instagram', icon: '📸' },
  spotify: { label: 'Spotify', icon: '🎧' },
  youtube: { label: 'YouTube', icon: '▶' },
  tiktok: { label: 'TikTok', icon: '⚡' },
  facebook: { label: 'Facebook', icon: '👥' },
  soundcloud: { label: 'SoundCloud', icon: '☁️' },
  web: { label: 'Sitio web', icon: '🌐' },
};

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;

  let artist: Artist | null = null;
  try {
    artist = await serverGet<Artist>(`/artists/${encodeURIComponent(slug)}`);
  } catch {
    artist = SHOWCASE_ARTISTS.find((a) => a.slug === slug) || null;
  }

  if (!artist) {
    notFound();
  }

  let events: EventItem[] = [];
  try {
    const res = await serverGetList<EventItem>(`/events${qs({ upcoming: true, artistSlug: slug, limit: 6 })}`);
    events = res.data;
  } catch {
    events = SHOWCASE_EVENTS.filter((e) => e.artists.some((a) => a.slug === slug));
  }

  const socialEntries = Object.entries(artist.socialLinks ?? {}).filter(
    ([, url]) => typeof url === 'string' && url.length > 0
  ) as [SocialLinkKey, string][];

  const cover =
    artist.coverUrl ||
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1400&auto=format&fit=crop';
  const avatar =
    artist.imageUrl ||
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 font-mono">
      <JsonLd data={musicGroupJsonLd(artist)} />

      {/* Migas de pan estilo terminal */}
      <nav aria-label="Migas de pan" className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-[#00ff87] transition-colors">
          INICIO
        </Link>
        <span>/</span>
        <Link href="/artistas" className="hover:text-[#00ff87] transition-colors">
          ARTISTAS
        </Link>
        <span>/</span>
        <span className="text-[#00ff87] font-bold">{artist.name.toUpperCase()}</span>
      </nav>

      {/* Cabecera oscura con visión nocturna */}
      <section className="relative overflow-hidden rounded-xl border border-[#00ff87]/30 bg-[#090c12] shadow-2xl">
        <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-[#00ff87] z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-[#00ff87] z-20 pointer-events-none" />

        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-black">
          <Image
            src={cover}
            alt={`Portada de ${artist.name}`}
            fill
            priority
            className="object-cover filter grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-[#00ff87]/10 mix-blend-color" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090c12] via-[#090c12]/60 to-transparent" />
        </div>

        <div className="relative -mt-20 sm:-mt-24 flex flex-col md:flex-row md:items-end justify-between gap-6 px-6 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar con marco night vision */}
            <div className="relative h-32 w-32 sm:h-40 sm:w-40 shrink-0 overflow-hidden rounded-lg border-2 border-[#00ff87] bg-black shadow-[0_0_20px_rgba(0,255,135,0.4)]">
              <Image
                src={avatar}
                alt={artist.name}
                fill
                priority
                className="object-cover filter grayscale contrast-125"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {artist.isFeatured && (
                  <span className="rounded bg-[#facc15] px-2 py-0.5 text-[9px] font-black uppercase text-black">
                    ★ TOP CARTEL
                  </span>
                )}
                <span className="rounded bg-black border border-[#00ff87]/50 px-2 py-0.5 text-[9px] font-bold text-[#00ff87]">
                  [ROSTER CAUCASIA]
                </span>
                {artist.isBookable && (
                  <span className="rounded bg-black border border-emerald-500/50 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                    ● BOOKING DISPONIBLE
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                {artist.name}
              </h1>

              {artist.genres.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-1">
                  {artist.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded bg-black border border-white/10 px-2 py-0.5 text-[10px] text-slate-300"
                    >
                      [{g.toUpperCase()}]
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            {artist.isBookable && (
              <Link
                href={`/booking?artist=${artist.slug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded bg-[#00ff87] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(0,255,135,0.4)] hover:bg-[#00e572] transition-all"
              >
                <span>Contratar Artista</span>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}

            {socialEntries.length > 0 && (
              <div className="flex items-center gap-1.5">
                {socialEntries.map(([key, url]) => {
                  const item = SOCIAL_LABELS[key] || { label: key, icon: '🔗' };
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="h-9 w-9 flex items-center justify-center rounded border border-[#00ff87]/30 bg-black text-xs hover:border-[#00ff87] hover:text-[#00ff87] transition-colors"
                      title={item.label}
                    >
                      {item.icon}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Biografía & Ficha de booking */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-8 rounded-xl border border-[#00ff87]/20 bg-[#090c12] p-6 sm:p-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-wider text-[#00ff87]">
              // PERFIL & IDENTIDAD
            </h2>
            <AudioVisualizer isPlaying={true} bars={8} className="h-3" />
          </div>
          <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {artist.bio ||
              'Artista clave del movimiento urbano de Money-Stack, transformando vivencias locales en composiciones de alcance internacional.'}
          </p>
        </section>

        <div className="lg:col-span-4 rounded-xl border border-[#00ff87]/20 bg-[#090c12] p-6 space-y-3 text-xs">
          <h3 className="font-black uppercase tracking-wider text-[#facc15]">
            // FICHA DE BOOKING
          </h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">ORIGEN:</span>
              <span className="font-bold text-white">CAUCASIA, ANT</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">FORMATO:</span>
              <span className="font-bold text-white">TARIMA COMPLETA</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">DURACIÓN:</span>
              <span className="font-bold text-white">60 - 90 MIN</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-slate-400">RIDER:</span>
              <span className="font-bold text-[#00ff87]">INCLUIDO CONTRATO</span>
            </li>
          </ul>
          <Link
            href={`/booking?artist=${artist.slug}`}
            className="mt-3 block w-full text-center rounded bg-black border border-[#00ff87]/40 py-2 font-bold uppercase text-[10px] text-[#00ff87] hover:bg-[#00ff87]/10 transition-colors"
          >
            Consultar fechas disponibles →
          </Link>
        </div>
      </div>

      {/* Próximos shows */}
      <section className="space-y-4 pt-2">
        <h2 className="text-xl font-black uppercase text-white">
          Próximas Tarimas de {artist.name}
        </h2>
        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#090c12] p-6 text-center">
            <p className="text-xs text-slate-400">Sin fechas públicas en este momento.</p>
            <Link
              href={`/booking?artist=${artist.slug}`}
              className="mt-2 inline-block text-xs font-bold text-[#00ff87] hover:underline"
            >
              Hacer propuesta de booking →
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
