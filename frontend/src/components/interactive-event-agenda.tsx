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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#07090e]/95 p-4 shadow-[0_15px_35px_rgba(0,0,0,0.85)]">
        {/* Pestañas estilo Stencil en titanio */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'all'
                ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                : 'border border-white/10 bg-black/80 text-slate-400 hover:border-white/40 hover:text-white'
            }`}
          >
            [TODOS ({baseEvents.length})]
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('caucasia')}
            className={`rounded px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'caucasia'
                ? 'bg-slate-200 text-black shadow-[0_0_12px_rgba(226,232,240,0.4)]'
                : 'border border-white/10 bg-black/80 text-slate-400 hover:border-white/40 hover:text-white'
            }`}
          >
            [📍 CAUCASIA]
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('medellin')}
            className={`rounded px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'medellin'
                ? 'bg-slate-300 text-black shadow-[0_0_12px_rgba(203,213,225,0.4)]'
                : 'border border-white/10 bg-black/80 text-slate-400 hover:border-white/40 hover:text-white'
            }`}
          >
            [MEDELLÍN]
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('festival')}
            className={`rounded px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'festival'
                ? 'bg-slate-100 text-black shadow-[0_0_12px_rgba(241,245,249,0.4)]'
                : 'border border-white/10 bg-black/80 text-slate-400 hover:border-white/40 hover:text-white'
            }`}
          >
            [🔥 FESTIVALES]
          </button>
        </div>

        {/* Input de búsqueda estilo consola */}
        <div className="relative w-full sm:w-64">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            &gt;_
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="BUSCAR TARIMA O FECHA..."
            className="w-full rounded bg-black/80 border border-white/15 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-white/50 focus:outline-none uppercase"
          />
        </div>
      </div>

      {/* Grid de eventos */}
      {filteredEvents.length === 0 ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-[#07090e] p-8 text-center">
          <p className="text-xs text-slate-400 uppercase font-bold">NO HAY FECHAS ACTIVAS CON ESOS FILTROS</p>
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
            }}
            className="mt-2 text-xs text-white hover:underline uppercase font-bold"
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
