import Link from 'next/link';

export const metadata = {
  // El layout aplica el template '%s — Money-Stack': aquí va solo la parte propia.
  title: 'Sello discográfico independiente desde Caucasia',
  description:
    'Sello discográfico independiente desde Caucasia, Antioquia. Catálogo de artistas, agenda de eventos y sistema de bookings musicales.',
};

function ArtistCard({
  name,
  slug,
  imageUrl,
  genres,
  isFeatured,
}: {
  name: string;
  slug: string;
  imageUrl?: string | null;
  genres?: string[];
  isFeatured?: boolean;
}) {
  return (
    <Link
      href={`/artistas/${slug}`}
      className="group block rounded-xl border border-[var(--depth-4)] bg-[var(--depth-3)] p-4 transition-transform duration-200 hover:-translate-y-1 hover:border-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-[var(--depth-2)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.25}
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 1 0-16 0" />
            </svg>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="font-medium text-[var(--text-primary)]">{name}</p>
        {isFeatured && (
          <span className="mt-1 flex items-center gap-1 text-xs text-[var(--accent)]">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Destacado
          </span>
        )}
        {genres && genres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="hud hud-accent inline-block rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px]"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function EventCard({
  title,
  slug,
  venueName,
  city,
  startsAt,
  coverUrl,
  artists,
}: {
  title: string;
  slug: string;
  venueName: string;
  city?: string;
  startsAt: string;
  coverUrl?: string | null;
  artists?: { name: string; isHeadliner: boolean }[];
}) {
  const date = new Date(startsAt);
  const summary = date.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  return (
    <Link
      href={`/eventos/${slug}`}
      className="group block rounded-xl border border-[var(--depth-4)] bg-[var(--depth-3)] p-4 transition-transform duration-200 hover:-translate-y-1 hover:border-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-[var(--depth-2)]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`Portada de ${title}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <time dateTime={startsAt}>{summary}</time>
          <span className="opacity-60">·</span>
          <span>{city ?? 'Caucasia'}</span>
        </div>
        <h3 className="mt-1 font-medium text-[var(--text-primary)]">{title}</h3>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{venueName}</p>
        {artists && artists.length > 0 && (
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">
            {artists.map((a, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1 opacity-50">·</span>}
                {a.isHeadliner && (
                  <span className="text-[var(--accent)]">{a.name}</span>
                )}
                {!a.isHeadliner && a.name}
              </span>
            ))}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function HomePage() {
  // Datos de ejemplo hasta que el backend y cliente API estén integrados.
  const featuredArtists = [
    {
      id: 'a1',
      name: 'Los Locales del Valle',
      slug: 'los-locales-del-valle',
      imageUrl: null,
      genres: ['rock', 'alternativo'],
      isFeatured: true,
    },
    {
      id: 'a2',
      name: 'Banda Soul Cauca',
      slug: 'banda-soul-cauca',
      imageUrl: null,
      genres: ['salsa', 'son'],
      isFeatured: true,
    },
    {
      id: 'a3',
      name: 'Café Nocturno',
      slug: 'cafe-nocturno',
      imageUrl: null,
      genres: ['electrónica', 'ambient'],
      isFeatured: false,
    },
  ];

  const upcomingEvents = [
    {
      id: 'e1',
      title: 'Noche de Puertas — Caucasia Metal',
      slug: 'noche-de-puertas-caucasia-metal',
      venueName: 'Plaza de la Cultura',
      city: 'Caucasia',
      startsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      coverUrl: null,
      artists: [
        { name: 'Los Locales del Valle', isHeadliner: true },
        { name: 'Banda Secundaria', isHeadliner: false },
      ],
    },
    {
      id: 'e2',
      title: 'Feria de Verano — Caucasia Sónica',
      slug: 'feria-verano-caucasia-sonica',
      venueName: 'Parque Norte',
      city: 'Caucasia',
      startsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
      coverUrl: null,
      artists: [
        { name: 'Café Nocturno', isHeadliner: true },
        { name: 'Duo Suno', isHeadliner: false },
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--depth-4)] bg-[var(--depth-2)] px-6 py-16 text-center shadow-2xl">
        <div className="absolute inset-0 grain scanlines vignette" aria-hidden="true" />
        <div className="relative z-10">
          <p className="hud hud-accent text-sm mb-3">Sello discográfico independiente</p>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl">
            Music from the edge of the map
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            Desde Caucasia, Antioquia, cultivamos talento local y conectamos
            artistas con públicos, escenas y festivales. Catálogo, agenda y
            reservas abiertas.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/artistas"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--depth-0)] shadow-[0_0_16px_var(--accent-glow)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[var(--depth-0)]"
            >
              Ver artistas
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--depth-4)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-transform hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              Próximos eventos
            </Link>
          </div>
        </div>
      </section>

      {/* Próximos eventos */}
      <section className="mt-14">
        <div className="flex items-center justify-between">
          <div>
            <p className="hud text-xs">Agenda</p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
              Próximos eventos
            </h2>
          </div>
          <Link
            href="/eventos?upcoming=true"
            className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--depth-0)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            Ver todos
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((evt) => (
            <EventCard key={evt.id} {...evt} />
          ))}
        </div>
      </section>

      {/* Artistas destacados */}
      <section className="mt-14">
        <div className="flex items-center justify-between">
          <div>
            <p className="hud text-xs">Catálogo</p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
              Artistas destacados
            </h2>
          </div>
          <Link
            href="/artistas?featured=true"
            className="rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--depth-0)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            Explorar catálogo
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredArtists.map((a) => (
            <ArtistCard key={a.id} {...a} />
          ))}
        </div>
      </section>

      {/* CTA booking */}
      <section className="mt-16 rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-8 text-center">
        <p className="hud hud-accent text-sm">Contratación</p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
          Quieres contratar a un artista?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[var(--text-secondary)]">
          Envía una solicitud con los detalles de tu evento. Revisamos cada
          petición y respondemos en los próximos días.
        </p>
        <Link
          href="/booking"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--depth-0)] shadow-[0_0_16px_var(--accent-glow)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[var(--depth-0)]"
        >
          Solicitar booking
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>
    </main>
  );
}
