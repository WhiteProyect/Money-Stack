'use client';

import { useState, useMemo } from 'react';
import type { Artist } from '@/lib/types';
import ArtistCard from './artist-card';
import { SHOWCASE_ARTISTS } from '@/lib/showcase-data';

interface InteractiveArtistCatalogProps {
  initialArtists?: Artist[] | null;
}

export default function InteractiveArtistCatalog({
  initialArtists,
}: InteractiveArtistCatalogProps) {
  const baseArtists = useMemo(() => {
    if (initialArtists && initialArtists.length > 0) {
      return initialArtists;
    }
    return SHOWCASE_ARTISTS;
  }, [initialArtists]);

  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'name'>('featured');

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    baseArtists.forEach((a) => {
      a.genres.forEach((g) => set.add(g));
    });
    return Array.from(set).sort();
  }, [baseArtists]);

  const filteredArtists = useMemo(() => {
    return baseArtists
      .filter((artist) => {
        if (selectedGenre !== 'all' && !artist.genres.includes(selectedGenre)) {
          return false;
        }
        if (onlyFeatured && !artist.isFeatured) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = artist.name.toLowerCase().includes(q);
          const matchBio = artist.bio?.toLowerCase().includes(q);
          const matchGenre = artist.genres.some((g) => g.toLowerCase().includes(q));
          if (!matchName && !matchBio && !matchGenre) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        }
        return a.name.localeCompare(b.name, 'es');
      });
  }, [baseArtists, selectedGenre, onlyFeatured, searchQuery, sortBy]);

  const clearFilters = () => {
    setSelectedGenre('all');
    setSearchQuery('');
    setOnlyFeatured(false);
    setSortBy('featured');
  };

  const isFiltered =
    selectedGenre !== 'all' || searchQuery.trim() !== '' || onlyFeatured || sortBy !== 'featured';

  return (
    <div className="w-full font-mono">
      {/* Controles Tácticos y Barra de filtros en gris titanio */}
      <div className="rounded-xl border border-white/15 bg-[#07090e]/95 p-4 md:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Barra de búsqueda estilo terminal militar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              &gt;_
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="BUSCAR ARTISTA O FLOW CALLEJERO..."
              className="w-full rounded bg-black/80 border border-white/15 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 uppercase tracking-wider"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Opciones y ordenamiento */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyFeatured(!onlyFeatured)}
              className={`rounded px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                onlyFeatured
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'border border-white/20 bg-black text-slate-300 hover:bg-white/10'
              }`}
            >
              [★ TOP CARTEL]
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded border border-white/15 bg-black px-3 py-1.5 text-xs font-bold uppercase text-slate-300 hover:border-white/40 focus:outline-none cursor-pointer"
            >
              <option value="featured">DESTACADOS PRIMERO</option>
              <option value="name">ALFABÉTICO (A-Z)</option>
            </select>

            {isFiltered && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold uppercase text-red-400 hover:bg-red-500/20 transition-all"
              >
                [LIMPIAR]
              </button>
            )}
          </div>
        </div>

        {/* Píldoras de género estilo Stencil en gris titanio */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/10">
          <span className="text-[11px] font-bold text-slate-400 mr-1">// GÉNEROS:</span>
          <button
            type="button"
            onClick={() => setSelectedGenre('all')}
            className={`rounded px-3 py-1 text-[11px] font-black uppercase tracking-wider transition-all ${
              selectedGenre === 'all'
                ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                : 'border border-white/10 bg-black/80 text-slate-400 hover:border-white/40 hover:text-white'
            }`}
          >
            [TODOS ({baseArtists.length})]
          </button>
          {allGenres.map((genre) => {
            const count = baseArtists.filter((a) => a.genres.includes(genre)).length;
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(isSelected ? 'all' : genre)}
                className={`rounded px-3 py-1 text-[11px] font-black uppercase tracking-wider transition-all ${
                  isSelected
                    ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'border border-white/10 bg-black/80 text-slate-400 hover:border-white/40 hover:text-white'
                }`}
              >
                [{genre.toUpperCase()}] <span className="opacity-60 text-[9px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          MOSTRANDO <strong className="text-white">{filteredArtists.length}</strong> DE {baseArtists.length} ARTISTAS CALLEJEROS
        </span>
        {selectedGenre !== 'all' && (
          <span className="text-slate-300 font-bold">[FILTRO: {selectedGenre.toUpperCase()}]</span>
        )}
      </div>

      {/* Grid de artistas con 3D tilt */}
      {filteredArtists.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-[#07090e] p-10 text-center">
          <p className="text-sm font-bold text-slate-400">NO HAY ARTISTAS CON ESE CRITERIO</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 text-xs text-white hover:underline uppercase font-bold"
          >
            Restablecer catálogo →
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
}
