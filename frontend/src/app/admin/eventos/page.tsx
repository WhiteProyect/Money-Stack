'use client';

// Lista de eventos (EDITOR+): filtro por estado y momento, y alta rápida.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiGetList, ApiError } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { EventItem, EventStatus, Paginated } from '@/lib/types';

const STATUS_LABEL: Record<EventStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  CANCELLED: 'Cancelado',
  FINISHED: 'Finalizado',
};

export default function AdminEventsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [data, setData] = useState<Paginated<EventItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const status = sp.get('status') ?? '';
  const when = sp.get('when') ?? '';
  const page = sp.get('page') ?? '1';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams({ page, limit: '20' });
    if (status) qs.set('status', status);
    if (when === 'upcoming') qs.set('upcoming', 'true');
    if (when === 'past') qs.set('past', 'true');
    try {
      setData(await apiGetList<EventItem>(`/admin/events?${qs.toString()}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los eventos.');
    } finally {
      setLoading(false);
    }
  }, [page, status, when]);

  useEffect(() => {
    void load();
  }, [load]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    router.replace(`/admin/eventos?${next.toString()}`);
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="hud text-xs">EDITOR+</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Eventos</h1>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--depth-0)] transition-transform hover:scale-[1.02]"
        >
          + Nuevo evento
        </Link>
      </header>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="f-status" className="hud text-xs">Estado</label>
          <select
            id="f-status"
            value={status}
            onChange={(e) => setParam('status', e.target.value)}
            className="rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="f-when" className="hud text-xs">Momento</label>
          <select
            id="f-when"
            value={when}
            onChange={(e) => setParam('when', e.target.value)}
            className="rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="upcoming">Próximos</option>
            <option value="past">Pasados</option>
          </select>
        </div>
        {(status || when) && (
          <button
            type="button"
            onClick={() => router.replace('/admin/eventos')}
            className="rounded-full border border-[var(--depth-4)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]"
          >
            Limpiar
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-[var(--color-error,#ff7d8b)] bg-[rgba(255,125,139,0.08)] p-3 text-sm">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--depth-4)]">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-[var(--depth-2)]">
            <tr className="text-left">
              <th scope="col" className="hud px-4 py-3 text-[10px]">Evento</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Fecha</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Lugar</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Cartel</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--depth-4)]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">Cargando…</td>
              </tr>
            ) : !data || data.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No hay eventos con esos filtros.
                </td>
              </tr>
            ) : (
              data.data.map((e) => (
                <tr key={e.id} className="bg-[var(--depth-1)] transition-colors hover:bg-[var(--depth-2)]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/eventos/${e.id}`} className="font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]">
                      {e.title}
                    </Link>
                    <p className="text-xs text-[var(--text-muted)]">/{e.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(e.startsAt)}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {e.venueName}
                    {e.city && <p className="text-xs text-[var(--text-muted)]">{e.city}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/eventos/${e.id}#cartel`} className="hud text-xs transition-colors hover:text-[var(--accent)]">
                      {e.artists.length} artista{e.artists.length === 1 ? '' : 's'}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`hud rounded-full px-2.5 py-0.5 text-[10px] ${
                        e.status === 'PUBLISHED'
                          ? 'bg-[rgba(125,255,179,0.15)] text-[var(--accent)]'
                          : e.status === 'CANCELLED'
                            ? 'bg-[rgba(255,125,139,0.15)] text-[var(--color-error,#ff7d8b)]'
                            : 'bg-[var(--depth-4)] text-[var(--text-muted)]'
                      }`}
                    >
                      {STATUS_LABEL[e.status]}
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
