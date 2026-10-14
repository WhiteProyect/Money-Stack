'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Artist } from '@/lib/types';
import AudioVisualizer from './audio-visualizer';
import Interactive3DCard from './interactive-3d-card';
import WaveformPlayer from './waveform-player';

export default function ArtistCard({ artist }: { artist: Artist }) {
  const [showPreview, setShowPreview] = useState(false);
  const fallbackImage =
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop';
  const imgUrl = artist.imageUrl || fallbackImage;

  return (
    <Interactive3DCard maxTilt={8} className="w-full h-full">
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#07090e] transition-all duration-300 hover:border-white/40 hover:shadow-[0_20px_45px_rgba(0,0,0,0.9),0_0_25px_rgba(255,255,255,0.08)]">
        {/* Esquinas tácticas en cromo / titanio */}
        <div className="absolute top-0 left-0 h-3 w-3 border-t border-l border-slate-400 z-20 pointer-events-none opacity-50 group-hover:opacity-100 group-hover:border-white transition-all" />
        <div className="absolute top-0 right-0 h-3 w-3 border-t border-r border-slate-400 z-20 pointer-events-none opacity-50 group-hover:opacity-100 group-hover:border-white transition-all" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-slate-400 z-20 pointer-events-none opacity-50 group-hover:opacity-100 group-hover:border-white transition-all" />
        <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-slate-400 z-20 pointer-events-none opacity-50 group-hover:opacity-100 group-hover:border-white transition-all" />

        {/* Imagen del artista con overlay táctico */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
          <Link href={`/artistas/${artist.slug}`} className="block relative h-full w-full">
            <Image
              src={imgUrl}
              alt={artist.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125 brightness-90 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/30 to-black/40" />
          </Link>

          {/* Badges superiores */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none font-mono">
            {artist.isFeatured ? (
              <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[9px] font-black uppercase text-black shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                ★ TOP CARTEL
              </span>
            ) : (
              <span className="inline-flex items-center rounded bg-black/80 border border-white/20 px-2 py-0.5 text-[9px] font-bold text-slate-300">
                ROSTER OFICIAL
              </span>
            )}

            {artist.isBookable && (
              <span className="inline-flex items-center gap-1 rounded bg-black/80 border border-white/30 px-2 py-0.5 text-[9px] font-bold text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                BOOKING DISPONIBLE
              </span>
            )}
          </div>

          {/* Botón central para activar el Waveform Snippet */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowPreview(!showPreview);
            }}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-[1px] cursor-pointer"
            aria-label={`Pre-escuchar beat de ${artist.name}`}
          >
            <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-black font-black text-xs uppercase shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-transform hover:scale-105 active:scale-95">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>{showPreview ? 'Cerrar Waveform' : 'Escuchar Beat'}</span>
            </div>
          </button>

          {/* VU meter plateado en la esquina */}
          <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <AudioVisualizer isPlaying={true} bars={8} className="h-4" />
          </div>
        </div>

        {/* Contenido inferior */}
        <div className="flex flex-1 flex-col p-4 font-mono">
          <Link href={`/artistas/${artist.slug}`} className="flex items-center justify-between gap-2 group/title">
            <h3 className="text-lg font-black uppercase tracking-wider text-white group-hover/title:text-slate-300 transition-colors">
              {artist.name}
            </h3>
            <span className="text-slate-400 group-hover/title:text-white group-hover/title:translate-x-1 transition-all">
              →
            </span>
          </Link>

          {artist.bio && (
            <p className="mt-1.5 text-xs font-sans leading-relaxed text-slate-400 line-clamp-2">
              {artist.bio}
            </p>
          )}

          {/* Reproductor Waveform interactivo desplegable */}
          {showPreview && (
            <div className="mt-3 pt-2">
              <WaveformPlayer
                title="SNIPPET BEAT 808"
                artistName={artist.name}
                durationSeconds={30}
                barCount={28}
              />
            </div>
          )}

          {/* Tags de géneros estilo stencil militar en grises */}
          <div className="mt-auto pt-3.5 flex flex-wrap gap-1.5 border-t border-white/10">
            {artist.genres.map((g) => (
              <span
                key={g}
                className="rounded bg-black/80 border border-white/15 px-2 py-0.5 text-[9px] font-bold tracking-wider text-slate-300 group-hover:border-white/30"
              >
                [{g.toUpperCase()}]
              </span>
            ))}
          </div>
        </div>
      </div>
    </Interactive3DCard>
  );
}
