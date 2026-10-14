import Image from 'next/image';
import Link from 'next/link';
import type { Artist } from '@/lib/types';
import AudioVisualizer from './audio-visualizer';

export default function ArtistCard({ artist }: { artist: Artist }) {
  const fallbackImage =
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop';
  const imgUrl = artist.imageUrl || fallbackImage;

  return (
    <Link
      href={`/artistas/${artist.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[#00ff87]/20 bg-[#0d1017] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00ff87] hover:shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(0,255,135,0.25)]"
    >
      {/* Esquinas tácticas Night Vision */}
      <div className="absolute top-0 left-0 h-3 w-3 border-t border-l border-[#00ff87] z-20 pointer-events-none opacity-60 group-hover:opacity-100" />
      <div className="absolute top-0 right-0 h-3 w-3 border-t border-r border-[#00ff87] z-20 pointer-events-none opacity-60 group-hover:opacity-100" />
      <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-[#00ff87] z-20 pointer-events-none opacity-60 group-hover:opacity-100" />
      <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[#00ff87] z-20 pointer-events-none opacity-60 group-hover:opacity-100" />

      {/* Imagen del artista tratada con alto contraste y tinte nocturno */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
        <Image
          src={imgUrl}
          alt={artist.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale contrast-125"
        />
        {/* Capa de fósforo verde en hover */}
        <div className="absolute inset-0 bg-[#00ff87]/10 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-color" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017] via-[#0d1017]/30 to-black/40" />

        {/* Badges superiores estilo stencil callejero */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none font-mono">
          {artist.isFeatured ? (
            <span className="inline-flex items-center gap-1 rounded bg-[#facc15] px-2 py-0.5 text-[9px] font-black uppercase text-black shadow">
              ★ TOP CARTEL
            </span>
          ) : (
            <span className="inline-flex items-center rounded bg-black/80 border border-[#00ff87]/40 px-2 py-0.5 text-[9px] font-bold text-[#00ff87]">
              ROSTER OFICIAL
            </span>
          )}

          {artist.isBookable && (
            <span className="inline-flex items-center gap-1 rounded bg-black/80 border border-emerald-500/50 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              BOOKING ACTIVO
            </span>
          )}
        </div>

        {/* Retícula de mira y play button en hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-[1px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#00ff87] text-black font-black shadow-[0_0_20px_#00ff87]">
            <svg className="h-6 w-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Ecualizador verde fósforo en esquina */}
        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <AudioVisualizer isPlaying={true} bars={8} className="h-4" />
        </div>
      </div>

      {/* Contenido inferior en tipografía ruda y callejera */}
      <div className="flex flex-1 flex-col p-4 font-mono">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-black uppercase tracking-wider text-white group-hover:text-[#00ff87] transition-colors">
            {artist.name}
          </h3>
          <span className="text-[#00ff87] group-hover:translate-x-1 transition-transform">
            →
          </span>
        </div>

        {artist.bio && (
          <p className="mt-1.5 text-xs font-sans leading-relaxed text-slate-300 line-clamp-2">
            {artist.bio}
          </p>
        )}

        {/* Tags de géneros estilo stencil militar */}
        <div className="mt-3.5 flex flex-wrap gap-1.5 pt-2.5 border-t border-white/10">
          {artist.genres.map((g) => (
            <span
              key={g}
              className="rounded bg-black/80 border border-[#00ff87]/30 px-2 py-0.5 text-[9px] font-bold tracking-wider text-[#00ff87]"
            >
              [{g.toUpperCase()}]
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
