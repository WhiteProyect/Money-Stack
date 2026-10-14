import Link from 'next/link';
import ElectricHero from '@/components/electric-hero';
import MusicPlayerBar from '@/components/music-player-bar';
import InteractiveArtistCatalog from '@/components/interactive-artist-catalog';
import InteractiveEventAgenda from '@/components/interactive-event-agenda';
import JsonLd from '@/components/json-ld';
import { serverGetList } from '@/lib/server-api';
import { ORGANIZATION_JSONLD } from '@/lib/jsonld';
import type { Artist, EventItem } from '@/lib/types';
import { SHOWCASE_ARTISTS, SHOWCASE_EVENTS } from '@/lib/showcase-data';

export const revalidate = 60;

export const metadata = {
  title: 'Sello discográfico de música callejera y urbana en Caucasia',
  description:
    'Money-Stack es el sello discográfico independiente del Bajo Cauca antioqueño. Trap, Afrobeat, Drill, producción musical y booking directo de artistas.',
};

export default async function HomePage() {
  const [artistsResult, eventsResult] = await Promise.allSettled([
    serverGetList<Artist>('/artists?featured=true&limit=6'),
    serverGetList<EventItem>('/events?upcoming=true&limit=6'),
  ]);

  const apiArtists = artistsResult.status === 'fulfilled' ? artistsResult.value.data : null;
  const apiEvents = eventsResult.status === 'fulfilled' ? eventsResult.value.data : null;

  const initialArtists = apiArtists && apiArtists.length > 0 ? apiArtists : SHOWCASE_ARTISTS;
  const initialEvents = apiEvents && apiEvents.length > 0 ? apiEvents : SHOWCASE_EVENTS;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-16 sm:space-y-20">
      <JsonLd data={ORGANIZATION_JSONLD} />

      {/* Hero eléctrico, oscuro y callejero con visión nocturna */}
      <ElectricHero />

      {/* Reproductor de audio tipo consola / tape deck callejero */}
      <section aria-label="Reproductor de audio del sello" className="relative z-20 -mt-6 sm:-mt-10">
        <MusicPlayerBar />
      </section>

      {/* Catálogo interactivo de artistas con filtros en tiempo real */}
      <section aria-labelledby="artistas-catalogo" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 font-mono">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00ff87]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ff87] animate-pulse" />
              <span>// ROSTER CALLEJERO // TALENTO DEL RÍO</span>
            </div>
            <h2 id="artistas-catalogo" className="mt-1 text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              El Cartel Oficial
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-sans max-w-xl">
              Filtra por género o busca el sonido que buscas. Cada artista representa la identidad y la energía cruda del río Cauca.
            </p>
          </div>
          <Link
            href="/artistas"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00ff87] hover:underline"
          >
            <span>Ver cartel completo ({initialArtists.length})</span>
            <span>→</span>
          </Link>
        </div>

        {/* Componente interactivo con filtros y búsqueda instantánea */}
        <InteractiveArtistCatalog initialArtists={initialArtists} />
      </section>

      {/* Próximos eventos y fechas en tarima */}
      <section aria-labelledby="eventos-agenda" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 font-mono">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00e5ff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
              <span>// TARIMAS & FESTIVALES // SUB-808 BASS</span>
            </div>
            <h2 id="eventos-agenda" className="mt-1 text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Agenda de Shows
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 font-sans max-w-xl">
              Fechas confirmadas, sedes y boletería oficial para los eventos del sello en Caucasia, Medellín y festivales.
            </p>
          </div>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00e5ff] hover:underline"
          >
            <span>Ver calendario completo</span>
            <span>→</span>
          </Link>
        </div>

        {/* Componente interactivo de eventos */}
        <InteractiveEventAgenda initialEvents={initialEvents} />
      </section>

      {/* Pilares del sello (Estructura Callejera) */}
      <section aria-labelledby="manifiesto-sello" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1.5 font-mono">
          <p className="text-xs uppercase tracking-wider text-[#facc15] font-black">
            // ESTRUCTURA & MAQUINARIA
          </p>
          <h2 id="manifiesto-sello" className="text-2xl sm:text-3xl font-black text-white uppercase">
            El Ecosistema Money-Stack
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Más que una disquera, una plataforma independiente con sonido rudo y calidad internacional.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-mono">
          <div className="rounded-xl border border-[#00ff87]/20 bg-[#0d1017] p-5 hover:border-[#00ff87] transition-all">
            <span className="text-2xl mb-3 block">🎛️</span>
            <h3 className="text-base font-black text-white uppercase tracking-wider">Estudio Central</h3>
            <p className="mt-1.5 text-xs text-slate-400 font-sans leading-relaxed">
              Consola analógica, micrófonos valvulares y mezcla calibrada para bombos 808 limpios y demoledores.
            </p>
          </div>

          <div className="rounded-xl border border-[#00e5ff]/20 bg-[#0d1017] p-5 hover:border-[#00e5ff] transition-all">
            <span className="text-2xl mb-3 block">📡</span>
            <h3 className="text-base font-black text-white uppercase tracking-wider">Distribución Global</h3>
            <p className="mt-1.5 text-xs text-slate-400 font-sans leading-relaxed">
              Llevamos los temas a Spotify, Apple Music, TikTok y YouTube con sincronización directa de regalías.
            </p>
          </div>

          <div className="rounded-xl border border-[#facc15]/20 bg-[#0d1017] p-5 hover:border-[#facc15] transition-all">
            <span className="text-2xl mb-3 block">🎪</span>
            <h3 className="text-base font-black text-white uppercase tracking-wider">Tarimas Masivas</h3>
            <p className="mt-1.5 text-xs text-slate-400 font-sans leading-relaxed">
              Montajes para festivales y club nights: sonido line array, pirotecnia y seguridad profesional.
            </p>
          </div>

          <div className="rounded-xl border border-[#ef4444]/20 bg-[#0d1017] p-5 hover:border-[#ef4444] transition-all">
            <span className="text-2xl mb-3 block">📋</span>
            <h3 className="text-base font-black text-white uppercase tracking-wider">Booking Directo</h3>
            <p className="mt-1.5 text-xs text-slate-400 font-sans leading-relaxed">
              Trato directo sin intermediarios. Cotizaciones con rider técnico y contrato formal en 48 horas.
            </p>
          </div>
        </div>
      </section>

      {/* CTA de Contrataciones Callejeras */}
      <section className="relative overflow-hidden rounded-2xl border border-[#00ff87]/30 bg-black p-8 sm:p-12 text-center shadow-2xl font-mono">
        <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-[#00ff87]" />
        <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-[#00ff87]" />
        <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#00ff87]" />
        <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#00ff87]" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded bg-[#facc15] px-3 py-0.5 text-[11px] font-black uppercase text-black">
            ⚡ RESERVAS 2026-2027 // TRATO DIRECTO
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            ¿Organizas un concierto, feria o festival?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            Contrata a los artistas del Bajo Cauca con riders oficiales, prueba de sonido y respuesta ágil.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded bg-[#00ff87] px-7 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(0,255,135,0.4)] hover:bg-[#00e572] transition-all"
            >
              <span>Solicitar Booking de Artistas</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/el-sello"
              className="inline-flex items-center gap-2 rounded border border-[#00ff87]/40 bg-black px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#00ff87] hover:bg-[#00ff87]/10 transition-all"
            >
              <span>Conoce el Sello</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
