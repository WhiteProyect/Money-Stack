'use client';

import { useState, useMemo } from 'react';
import type { EventItem } from '@/lib/types';
import EventCard from './event-card';
import { SHOWCASE_EVENTS } from '@/lib/showcase-data';

interface InteractiveEventAgendaProps {
  initialEvents?: EventItem[] | null;
}

export default function InteractiveEventAgenda({
  initialEvents,
}: InteractiveEventAgendaProps) {
  const baseEvents = useMemo(() => {
    if (initialEvents && initialEvents.length > 0) {
      return initialEvents;
    }
    return SHOWCASE_EVENTS;
  }, [initialEvents]);

  const [activeTab, setActiveTab] = useState<'all' | 'caucasia' | 'medellin' | 'festival'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = useMemo(() => {
    return baseEvents.filter((evt) => {
      if (activeTab === 'caucasia' && evt.city?.toLowerCase() !== 'caucasia') {
        return false;
      }
      if (activeTab === 'medellin' && evt.city?.toLowerCase() !== 'medellín' && evt.city?.toLowerCase() !== 'medellin') {
        return false;
      }
      if (activeTab === 'festival' && !evt.title.toLowerCase().includes('fest')) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(q);
        const matchVenue = evt.venueName.toLowerCase().includes(q);
        const matchCity = evt.city?.toLowerCase().includes(q);
        const matchArtist = evt.artists.some((a) => a.name.toLowerCase().includes(q));
        if (!matchTitle && !matchVenue && !matchCity && !matchArtist) return false;
      }

      return true;
    });
  }, [baseEvents, activeTab, searchQuery]);

  return (
    <div className="w-full font-mono">
      {/* Controles tácticos de la agenda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-[#00ff87]/30 bg-[#090c12] p-4 shadow-[0_15px_35px_rgba(0,0,0,0.8)]">
        {/* Pestañas estilo Stencil Militar / Callejero */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'all'
                ? 'bg-[#00ff87] text-black shadow-[0_0_12px_rgba(0,255,135,0.5)]'
                : 'border border-white/10 bg-black text-slate-400 hover:border-[#00ff87] hover:text-[#00ff87]'
            }`}
          >
            [TODOS ({baseEvents.length})]
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('caucasia')}
            className={`rounded px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'caucasia'
                ? 'bg-[#00e5ff] text-black shadow-[0_0_12px_rgba(0,229,255,0.5)]'
                : 'border border-white/10 bg-black text-slate-400 hover:border-[#00e5ff] hover:text-[#00e5ff]'
            }`}
          >
            [📍 CAUCASIA]
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('medellin')}
            className={`rounded px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'medellin'
                ? 'bg-[#00ff87] text-black shadow-[0_0_12px_rgba(0,255,135,0.5)]'
                : 'border border-white/10 bg-black text-slate-400 hover:border-[#00ff87] hover:text-[#00ff87]'
            }`}
          >
            [MEDELLÍN]
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('festival')}
            className={`rounded px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'festival'
                ? 'bg-[#facc15] text-black shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                : 'border border-white/10 bg-black text-slate-400 hover:border-[#facc15] hover:text-[#facc15]'
            }`}
          >
            [🔥 FESTIVALES]
          </button>
        </div>

        {/* Input de búsqueda estilo consola */}
        <div className="relative w-full sm:w-64">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#00ff87]">
            &gt;_
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR TARIMA O FECHA..."
            className="w-full rounded bg-black border border-[#00ff87]/30 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-[#00ff87] focus:outline-none uppercase"
          />
        </div>
      </div>

      {/* Grid de eventos */}
      {filteredEvents.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-[#090c12] p-8 text-center">
          <p className="text-xs text-slate-400 uppercase font-bold">NO HAY FECHAS ACTIVAS CON ESOS FILTROS</p>
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
            }}
            className="mt-2 text-xs text-[#00ff87] hover:underline uppercase"
          >
            Mostrar todas las fechas →
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      )}
    </div>
  );
}
