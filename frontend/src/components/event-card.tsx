'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { EventItem } from '@/lib/types';
import Interactive3DCard from './interactive-3d-card';

export default function EventCard({ event }: { event: EventItem }) {
  const headliner = event.artists.find((a) => a.isHeadliner);
  const others = event.artists.filter((a) => !a.isHeadliner);

  const fallbackImage =
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop';
  const cover = event.coverUrl || fallbackImage;

  const dateObj = new Date(event.startsAt);
  const day = !isNaN(dateObj.getTime()) ? dateObj.getDate() : 15;
  const month = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('es-CO', { month: 'short' }).toUpperCase()
    : 'NOV';
  const time = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    : '20:00';

  return (
    <Interactive3DCard maxTilt={10} className="w-full h-full">
      <Link
        href={`/eventos/${event.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#07090e] transition-all duration-300 hover:border-white/40 hover:shadow-[0_20px_45px_rgba(0,0,0,0.9),0_0_25px_rgba(255,255,255,0.08)] font-mono"
      >
        {/* Esquinas tácticas */}
        <div className="absolute top-0 left-0 h-3 w-3 border-t border-l border-slate-400 z-20 pointer-events-none opacity-50 group-hover:opacity-100 group-hover:border-white transition-all" />
        <div className="absolute top-0 right-0 h-3 w-3 border-t border-r border-slate-400 z-20 pointer-events-none opacity-50 group-hover:opacity-100 group-hover:border-white transition-all" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-slate-400 z-20 pointer-events-none opacity-50 group-hover:opacity-100 group-hover:border-white transition-all" />
        <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-slate-400 z-20 pointer-events-none opacity-50 group-hover:opacity-100 group-hover:border-white transition-all" />

        {/* Portada del evento estilo flyer callejero en alto contraste */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
          <Image
            src={cover}
            alt={`Portada de ${event.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-125 brightness-90 group-hover:brightness-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/40 to-black/30" />

          {/* Badge de fecha estilo ticket militar en titanio */}
          <div className="absolute top-2.5 left-2.5 flex flex-col items-center justify-center rounded bg-black/90 border border-white/30 px-3 py-1 shadow-md">
            <span className="text-[9px] font-bold tracking-wider text-slate-300">
              {month}
            </span>
            <span className="text-xl font-black text-white leading-none">
              {day}
            </span>
          </div>

          {/* Estado y Precio callejero */}
          <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
            {event.status === 'CANCELLED' ? (
              <span className="rounded bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                Cancelado
              </span>
            ) : (
              <span className="rounded bg-white px-2 py-0.5 text-[9px] font-black text-black uppercase shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                Confirmado
              </span>
            )}

            {event.price !== undefined && event.price !== null && (
              <span className="rounded bg-black/90 border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-200">
                {event.price === 0 ? 'ENTRADA LIBRE' : `$${event.price.toLocaleString('es-CO')}`}
              </span>
            )}
          </div>

          {/* Hora y Ciudad */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 text-[10px] text-slate-300">
            <span className="bg-black/85 px-2 py-0.5 rounded border border-white/10 text-slate-300 font-bold">
              {time} HRS
            </span>
            <span className="bg-black/85 px-2 py-0.5 rounded border border-white/10 text-white font-bold">
              {event.city || 'CAUCASIA'}
            </span>
          </div>
        </div>

        {/* Contenido del evento */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-base font-black uppercase tracking-wider text-white group-hover:text-slate-200 transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="mt-1 text-xs text-slate-400 font-sans line-clamp-1">
            📍 {event.venueName}
          </p>

          {/* Cartel / Lineup */}
          {event.artists.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] text-slate-400 uppercase font-bold mr-1">CARTEL:</span>
              {headliner && (
                <span className="rounded bg-white/10 border border-white/30 px-2 py-0.5 text-[9px] font-black text-slate-200">
                  ★ {headliner.name}
                </span>
              )}
              {others.slice(0, 2).map((a) => (
                <span
                  key={a.artistId}
                  className="rounded bg-black border border-white/10 px-2 py-0.5 text-[9px] text-slate-300"
                >
                  {a.name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-3 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white">
            <span className="uppercase text-[10px] tracking-wider">Ver Tarima &amp; Boletas</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </Link>
    </Interactive3DCard>
  );
}
