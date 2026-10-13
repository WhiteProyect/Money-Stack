import type { Metadata } from 'next';
import Link from 'next/link';
import EventCard from '@/components/event-card';
import Pagination from '@/components/pagination';
import { ApiUnavailable, EmptyState } from '@/components/api-states';
import { serverGetList, qs, ServerApiError } from '@/lib/server-api';
import type { EventItem, Paginated } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Eventos',
  description:
    'Agenda de Money-Stack: próximos y pasados eventos en Caucasia y la región. Fechas, venues, cartel y boletería.',
};

interface Props {
  searchParams: Promise<{
    when?: string; // 'upcoming' | 'past' | undefined (todo)
    city?: string;
    page?: string;
  }>;
}

export default async function EventsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = sp.page ?? '1';
  const when = sp.when === 'past' ? 'past' : sp.when === 'upcoming' ? 'upcoming' : undefined;

  let result: Paginated<EventItem> | null = null;
  let apiDown = false;

  try {
    result = await serverGetList<EventItem>(
      `/events${qs({
        page,
        limit: 12,
        ...(when ? { [when]: true } : {}),
        city: sp.city,
      })}`
    );
  } catch (err) {
    if (err instanceof ServerApiError && err.status === 0) apiDown = true;
    else throw err;
  }

  const cities = Array.from(
    new Set((result?.data ?? []).map((e) => e.city).filter((c): c is string => Boolean(c)))
  ).sort((a, b) => a.localeCompare(b, 'es'));

  const activeFilters = { when, city: sp.city };

  const tabs = [
    { key: undefined as string | undefined, label: 'Todos' },
    { key: 'upcoming', label: 'Próximos' },
    { key: 'past', label: 'Pasados' },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <p className="hud text-xs">Agenda</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Eventos
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
          Fechas confirmadas del sello y de nuestros artistas. Filtra por momento o ciudad.
        </p>
      </header>

      {/* Pestañas de momento */}
      <nav aria-label="Filtrar por momento" className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = when === t.key;
          const href = {
            pathname: '/eventos',
            query: { ...(sp.city ? { city: sp.city } : {}), ...(t.key ? { when: t.key } : {}) },
          };
          return (
            <Link
              key={t.label}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? 'hud-accent rounded-full bg-[var(--accent-soft)] px-4 py-1.5 text-sm'
                  : 'hud rounded-full border border-[var(--depth-4)] px-4 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]'
              }
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {/* Filtro por ciudad */}
      {cities.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="hud text-xs">Ciudad:</span>
          <Link
            href={{ pathname: '/eventos', query: { ...(when ? { when } : {}) } }}
            className={
              !sp.city
                ? 'hud-accent rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs'
                : 'hud rounded-full border border-[var(--depth-4)] px-3 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]'
            }
          >
            Todas
          </Link>
          {cities.map((c) => (
            <Link
              key={c}
              href={{ pathname: '/eventos', query: { ...(when ? { when } : {}), city: c } }}
              aria-current={sp.city === c ? 'true' : undefined}
              className={
                sp.city === c
                  ? 'hud-accent rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs'
                  : 'hud rounded-full border border-[var(--depth-4)] px-3 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]'
              }
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        {apiDown ? (
          <ApiUnavailable />
        ) : result === null || result.data.length === 0 ? (
          <EmptyState
            title={when === 'past' ? 'Aún no hay eventos pasados' : 'No hay eventos con esos filtros'}
            hint="Prueba con otra ciudad o revisa la agenda completa."
          />
        ) : (
          <>
            <p className="hud text-xs" aria-live="polite">
              {result.pagination.total} evento{result.pagination.total === 1 ? '' : 's'}
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.data.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
            <Pagination
              pagination={result.pagination}
              basePath="/eventos"
              filters={activeFilters}
            />
          </>
        )}
      </div>
    </main>
  );
}
