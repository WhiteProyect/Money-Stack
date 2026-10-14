import type { Metadata } from 'next';
import BookingForm from '@/components/booking-form';
import { serverGet, serverGetList, qs } from '@/lib/server-api';
import type { Artist } from '@/lib/types';
import { SHOWCASE_ARTISTS } from '@/lib/showcase-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contrataciones & Booking // Money-Stack',
  description:
    'Solicita la contratación oficial de un artista de Money-Stack Discos. Cuéntanos sobre tu evento y te respondemos con tarifas oficiales, rider y disponibilidad.',
};

interface Props {
  searchParams: Promise<{ artist?: string }>;
}

export default async function BookingPage({ searchParams }: Props) {
  const sp = await searchParams;

  let bookable: { id: string; name: string }[] = [];

  try {
    const catalogResult = await serverGetList<Artist>(`/artists${qs({ limit: 100 })}`);
    const catalog = catalogResult?.data ?? [];
    const filtered = catalog.filter((a) => a.isBookable);
    if (filtered.length > 0) {
      bookable = filtered.map((a) => ({ id: a.id, name: a.name }));
    } else {
      bookable = SHOWCASE_ARTISTS.filter((a) => a.isBookable).map((a) => ({ id: a.id, name: a.name }));
    }
  } catch {
    bookable = SHOWCASE_ARTISTS.filter((a) => a.isBookable).map((a) => ({ id: a.id, name: a.name }));
  }

  let defaultArtistId: string | null = null;
  if (sp.artist) {
    const showcaseMatch = SHOWCASE_ARTISTS.find((a) => a.slug === sp.artist);
    if (showcaseMatch) {
      defaultArtistId = showcaseMatch.id;
    } else {
      try {
        const artist = await serverGet<Artist>(`/artists/${encodeURIComponent(sp.artist)}`);
        if (artist.isBookable) defaultArtistId = artist.id;
      } catch {
        // No bloquea
      }
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8 font-mono">
      <header className="relative overflow-hidden rounded-xl border border-white/15 bg-[#07090e]/95 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-slate-300" />
        <div className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-slate-300" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-slate-300" />
        <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-slate-300" />

        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded bg-black/80 border border-white/20 px-2.5 py-1 text-xs font-black text-slate-200">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>// CANAL OFICIAL // CONTRATACIONES DIRECTAS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Solicitud de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Booking
            </span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
            Completa la información de tu concierto, festival o evento.
            Revisamos la agenda y te responderemos con disponibilidad, cotización y rider técnico en menos de 48 horas.
          </p>
        </div>
      </header>

      <section aria-label="Formulario de booking" className="relative z-10">
        <BookingForm artists={bookable} defaultArtistId={defaultArtistId} />
      </section>
    </div>
  );
}
