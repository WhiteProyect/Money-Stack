import type { Metadata } from 'next';
import InteractiveEventAgenda from '@/components/interactive-event-agenda';
import { serverGetList, qs } from '@/lib/server-api';
import type { EventItem } from '@/lib/types';
import { SHOWCASE_EVENTS } from '@/lib/showcase-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Agenda de Shows & Tarimas // Money-Stack',
  description:
    'Shows en vivo, festivales y club nights de Money-Stack en Caucasia, Medellín y Colombia. Cartel de artistas, fechas y venta de entradas.',
};

interface Props {
  searchParams: Promise<{
    when?: string;
    city?: string;
    page?: string;
  }>;
}

export default async function EventsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = sp.page ?? '1';
  const when = sp.when === 'past' ? 'past' : sp.when === 'upcoming' ? 'upcoming' : undefined;

  let events: EventItem[] = SHOWCASE_EVENTS;

  try {
    const result = await serverGetList<EventItem>(
      `/events${qs({
        page,
        limit: 24,
        ...(when ? { [when]: true } : {}),
        city: sp.city,
      })}`
    );
    if (result && result.data && result.data.length > 0) {
      events = result.data;
    }
  } catch {
    events = SHOWCASE_EVENTS;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6 font-mono">
      {/* Header oscuro / visión nocturna */}
      <header className="relative overflow-hidden rounded-xl border border-[#00ff87]/30 bg-[#090c12] p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-[#00ff87]" />
        <div className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-[#00ff87]" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-[#00ff87]" />
        <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#00ff87]" />

        <div className="relative z-10 max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded bg-black/80 border border-[#00ff87]/40 px-2.5 py-1 text-xs font-black text-[#00ff87]">
            <span className="h-2 w-2 rounded-full bg-[#00ff87] animate-pulse" />
            <span>// AGENDA OFICIAL // CONCIERTOS & TARIMAS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Próximos{' '}
            <span className="text-[#00ff87] nv-glow">
              Shows
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            Fechas confirmadas, sedes y boletería de los eventos de Money-Stack.
            Vive el golpe de bajo y el sonido crudo frente a la tarima.
          </p>
        </div>
      </header>

      {/* Agenda reactiva con filtros */}
      <InteractiveEventAgenda initialEvents={events} />
    </div>
  );
}
