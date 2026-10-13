'use client';

// Lista de artistas (EDITOR+): búsqueda, filtro activos/inactivos y alta
// rápida. Sin DELETE: se desactiva con isActive (regla del proyecto).

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiGetList, ApiError } from '@/lib/api';
import type { Artist, Paginated } from '@/lib/types';

export default function AdminArtistsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [data, setData] = useState<Paginated<Artist> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = sp.get('search') ?? '';
  const isActive = sp.get('isActive') ?? '';
  const page = sp.get('page') ?? '1';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams({ page, limit: '20' });
    if (search) qs.set('search', search);
    if (isActive) qs.set('isActive', isActive);
    try {
      setData(await apiGetList<Artist>(`/admin/artists?${qs.toString()}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los artistas.');
    } finally {
      setLoading(false);
    }
  }, [page, search, isActive]);

  useEffect(() => {
    void load();
  }, [load]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    router.replace(`/admin/artistas?${next.toString()}`);
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="hud text-xs">EDITOR+</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Artistas</h1>
        </div>
        <Link
          href="/admin/artistas/nuevo"
          className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--depth-0)] transition-transform hover:scale-[1.02]"
        >
          + Nuevo artista
        </Link>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setParam('search', String(fd.get('search') ?? '').trim());
        }}
        className="mt-5 flex flex-wrap items-end gap-3"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="f-search" className="hud text-xs">
            Buscar
          </label>
          <input
            id="f-search"
            name="search"
            type="search"
            defaultValue={search}
            placeholder="Nombre…"
            className="w-56 rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--depth-0)]">
          Aplicar
        </button>
        <div className="flex flex-col gap-1">
          <label htmlFor="f-active" className="hud text-xs">
            Estado
          </label>
          <select
            id="f-active"
            value={isActive}
            onChange={(e) => setParam('isActive', e.target.value)}
            className="rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-[var(--color-error,#ff7d8b)] bg-[rgba(255,125,139,0.08)] p-3 text-sm">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--depth-4)]">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-[var(--depth-2)]">
            <tr className="text-left">
              <th scope="col" className="hud px-4 py-3 text-[10px]">Artista</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Géneros</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Señales</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--depth-4)]">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-muted)]">Cargando…</td>
              </tr>
            ) : !data || data.data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No hay artistas con esos filtros.
                </td>
              </tr>
            ) : (
              data.data.map((a) => (
                <tr key={a.id} className="bg-[var(--depth-1)] transition-colors hover:bg-[var(--depth-2)]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/artistas/${a.id}`} className="font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]">
                      {a.name}
                    </Link>
                    <p className="text-xs text-[var(--text-muted)]">/{a.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                    {a.genres.join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {a.isFeatured && (
                        <span className="hud-accent rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px]">Destacado</span>
                      )}
                      {a.isBookable && (
                        <span className="hud rounded-full bg-[var(--depth-3)] px-2 py-0.5 text-[10px]">Bookable</span>
                      )}
                      {a.isSigned && (
                        <span className="hud rounded-full bg-[var(--depth-3)] px-2 py-0.5 text-[10px]">Firmado</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`hud rounded-full px-2.5 py-0.5 text-[10px] ${
                        a.isActive
                          ? 'bg-[rgba(125,255,179,0.15)] text-[var(--accent)]'
                          : 'bg-[var(--depth-4)] text-[var(--text-muted)]'
                      }`}
                    >
                      {a.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.pagination.totalPages > 1 && (
        <nav aria-label="Paginación" className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={data.pagination.page <= 1}
            onClick={() => setParam('page', String(data.pagination.page - 1))}
            className="rounded-full border border-[var(--depth-4)] px-4 py-1.5 text-sm text-[var(--text-secondary)] disabled:opacity-40"
          >
            ← Anteriores
          </button>
          <span className="hud text-xs">
            Página {data.pagination.page} de {data.pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={data.pagination.page >= data.pagination.totalPages}
            onClick={() => setParam('page', String(data.pagination.page + 1))}
            className="rounded-full border border-[var(--depth-4)] px-4 py-1.5 text-sm text-[var(--text-secondary)] disabled:opacity-40"
          >
            Siguientes →
          </button>
        </nav>
      )}
    </div>
  );
}
