import type { Metadata } from 'next';
import BookingForm from '@/components/booking-form';
import { ApiUnavailable } from '@/components/api-states';
import { serverGet, serverGetList, qs, ServerApiError } from '@/lib/server-api';
import type { Artist } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Booking',
  description:
    'Solicita la contratación de un artista de Money-Stack. Cuéntanos sobre tu evento y te respondemos con tarifas y disponibilidad.',
};

interface Props {
  searchParams: Promise<{ artist?: string }>;
}

export default async function BookingPage({ searchParams }: Props) {
  const sp = await searchParams;

  // Catálogo de artistas contratables para el <select> (independiente del resto).
  const catalogResult = await Promise.allSettled([
    serverGetList<Artist>(`/artists${qs({ limit: 100 })}`),
  ]);
  const catalog =
    catalogResult[0].status === 'fulfilled' ? catalogResult[0].value.data : null;

  const bookable = (catalog ?? []).filter((a) => a.isBookable);

  // Si venimos de la ficha de un artista (?artist=slug), preseleccionarlo.
  let defaultArtistId: string | null = null;
  if (sp.artist) {
    try {
      const artist = await serverGet<Artist>(`/artists/${encodeURIComponent(sp.artist)}`);
      if (artist.isBookable) defaultArtistId = artist.id;
    } catch (err) {
      // Slug inexistente o inactivo: no bloquea el formulario.
      if (!(err instanceof ServerApiError)) throw err;
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="max-w-2xl">
        <p className="hud hud-accent text-sm">Contratación</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
          Solicitar booking
        </h1>
        <p className="mt-4 text-[var(--text-secondary)]">
          Cuéntanos sobre tu evento: fecha, ciudad, aforo y el artista que
          tienes en mente. Revisamos cada solicitud y respondemos al correo
          que nos dejes. Tus datos se tratan conforme a nuestra{' '}
          <a href="/politica-de-datos" className="text-[var(--accent)] underline underline-offset-2">
            política de datos
          </a>{' '}
          (Ley 1581 de Colombia).
        </p>
      </header>

      <section className="mt-8" aria-label="Formulario de booking">
        {catalog === null ? (
          <>
            <ApiUnavailable />
            <div className="mt-6">
              <BookingForm artists={[]} defaultArtistId={null} />
            </div>
          </>
        ) : (
          <BookingForm
            artists={bookable.map((a) => ({ id: a.id, name: a.name }))}
            defaultArtistId={defaultArtistId}
          />
        )}
      </section>
    </main>
  );
}
