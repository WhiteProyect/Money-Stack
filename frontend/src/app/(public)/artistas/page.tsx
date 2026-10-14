import type { Metadata } from 'next';
import InteractiveArtistCatalog from '@/components/interactive-artist-catalog';
import { serverGetList, qs } from '@/lib/server-api';
import type { Artist } from '@/lib/types';
import { SHOWCASE_ARTISTS } from '@/lib/showcase-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cartel de Artistas // Money-Stack Roster',
  description:
    'Roster oficial de artistas callejeros de Money-Stack: Trap, Afrobeat, Drill y ritmos pesados desde Caucasia, Colombia.',
};

interface Props {
  searchParams: Promise<{
    genre?: string;
    featured?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ArtistsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = sp.page ?? '1';

  let artists: Artist[] = SHOWCASE_ARTISTS;

  try {
    const result = await serverGetList<Artist>(
      `/artists${qs({ page, limit: 24, genre: sp.genre, featured: sp.featured, search: sp.search })}`
    );
    if (result && result.data && result.data.length > 0) {
      artists = result.data;
    }
  } catch {
    artists = SHOWCASE_ARTISTS;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6 font-mono">
      {/* Header callejero / visión nocturna */}
      <header className="relative overflow-hidden rounded-xl border border-[#00ff87]/30 bg-[#090c12] p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-[#00ff87]" />
        <div className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-[#00ff87]" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-[#00ff87]" />
        <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#00ff87]" />

        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded bg-black/80 border border-[#00ff87]/40 px-2.5 py-1 text-xs font-black text-[#00ff87]">
            <span className="h-2 w-2 rounded-full bg-[#00ff87] animate-pulse" />
            <span>NVG // ROSTER CALLEJERO // BAJO CAUCA</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Artistas en{' '}
            <span className="text-[#00ff87] nv-glow">
              Cartel
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            Directo del barrio para la escena nacional e internacional. Revisa los perfiles de los artistas,
            escucha sus singles y cotiza su contratación directa para shows en vivo.
          </p>
        </div>
      </header>

      {/* Catálogo con filtros reactivos */}
      <InteractiveArtistCatalog initialArtists={artists} />
    </div>
  );
}
