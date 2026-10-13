import type { Metadata } from 'next';
import Link from 'next/link';
import ArtistCard from '@/components/artist-card';
import Pagination from '@/components/pagination';
import { ApiUnavailable, EmptyState } from '@/components/api-states';
import { serverGetList, qs, ServerApiError } from '@/lib/server-api';
import type { Artist, Paginated } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Artistas',
  description:
    'Catálogo de artistas de Money-Stack: talento local de Caucasia y la región, con géneros, biografías y enlaces oficiales.',
};

interface Props {
  searchParams: Promise<{
    genre?: string;
    featured?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ArtistsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = sp.page ?? '1';

  let result: Paginated<Artist> | null = null;
  let apiDown = false;

  try {
    result = await serverGetList<Artist>(
      `/artists${qs({ page, limit: 12, genre: sp.genre, featured: sp.featured, search: sp.search })}`
    );
  } catch (err) {
    if (err instanceof ServerApiError && err.status === 0) apiDown = true;
    else throw err;
  }

  // Géneros visibles para los chips de filtro (unión de la página actual).
  const genres = Array.from(
    new Set((result?.data ?? []).flatMap((a) => a.genres))
  ).sort((a, b) => a.localeCompare(b, 'es'));

  const activeFilters = { genre: sp.genre, featured: sp.featured, search: sp.search };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <p className="hud text-xs">Catálogo</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Artistas
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
          Talentos firmados y invitados del sello. Filtra por género o busca por nombre.
        </p>
      </header>

      {/* Filtros */}
      <form method="get" action="/artistas" className="mt-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="search" className="hud text-xs">
            Buscar
          </label>
          <input
            id="search"
            name="search"
            type="search"
            defaultValue={sp.search ?? ''}
            placeholder="Nombre del artista…"
            maxLength={120}
            className="w-56 rounded-lg border border-[var(--depth-4)] bg-[var(--depth-2)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--depth-0)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[var(--depth-0)]"
        >
          Aplicar
        </button>
        {(sp.genre || sp.featured || sp.search) && (
          <Link
            href="/artistas"
            className="rounded-full border border-[var(--depth-4)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Limpiar filtros
          </Link>
        )}
      </form>

      {/* Chips de género + destacados */}
      {(genres.length > 0 || sp.featured) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {sp.featured !== 'true' && (
            <Link
              href={{ pathname: '/artistas', query: { ...cleanQuery(sp), featured: 'true' } }}
              className="hud rounded-full border border-[var(--depth-4)] px-3 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              ★ Destacados
            </Link>
          )}
          {genres.map((g) => {
            const active = sp.genre === g;
            return (
              <Link
                key={g}
                href={{ pathname: '/artistas', query: { ...cleanQuery(sp), genre: g } }}
                aria-current={active ? 'true' : undefined}
                className={
                  active
                    ? 'hud-accent rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs'
                    : 'hud rounded-full border border-[var(--depth-4)] px-3 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]'
                }
              >
                {g}
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        {apiDown ? (
          <ApiUnavailable />
        ) : result === null || result.data.length === 0 ? (
          <EmptyState
            title="No encontramos artistas con esos filtros"
            hint="Prueba con otro género u otra búsqueda."
          />
        ) : (
          <>
            <p className="hud text-xs" aria-live="polite">
              {result.pagination.total} artista{result.pagination.total === 1 ? '' : 's'}
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.data.map((a) => (
                <ArtistCard key={a.id} artist={a} />
              ))}
            </div>
            <Pagination
              pagination={result.pagination}
              basePath="/artistas"
              filters={activeFilters}
            />
          </>
        )}
      </div>
    </main>
  );
}

function cleanQuery(sp: { genre?: string; featured?: string; search?: string }) {
  const q: Record<string, string> = {};
  if (sp.genre) q.genre = sp.genre;
  if (sp.featured) q.featured = sp.featured;
  if (sp.search) q.search = sp.search;
  return q;
}
