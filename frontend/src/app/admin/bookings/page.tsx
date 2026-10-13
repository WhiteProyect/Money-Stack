'use client';

// Lista de bookings (ADMIN+): filtros status/artista/rango de fechas/search,
// paginación y cambio de estado rápido con transiciones válidas del backend.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiGetList, apiPatch, ApiError } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Booking, BookingStatus, Paginated } from '@/lib/types';

const STATUSES: BookingStatus[] = ['PENDING', 'IN_REVIEW', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Pendiente',
  IN_REVIEW: 'En revisión',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
};

// Transiciones válidas del backend (espejo de booking.service.js).
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['IN_REVIEW', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
  IN_REVIEW: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: [],
  REJECTED: [],
  CANCELLED: [],
};

function statusBadge(status: BookingStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-[var(--color-warning,#ffcf7d)]/15 text-[var(--color-warning,#ffcf7d)]';
    case 'IN_REVIEW':
      return 'bg-[var(--accent-soft)] text-[var(--accent)]';
    case 'ACCEPTED':
      return 'bg-[rgba(125,255,179,0.15)] text-[var(--accent)]';
    case 'REJECTED':
      return 'bg-[rgba(255,125,139,0.15)] text-[var(--color-error,#ff7d8b)]';
    case 'CANCELLED':
      return 'bg-[var(--depth-4)] text-[var(--text-muted)]';
  }
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [data, setData] = useState<Paginated<Booking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const status = sp.get('status') ?? '';
  const page = sp.get('page') ?? '1';
  const search = sp.get('search') ?? '';
  const artistId = sp.get('artistId') ?? '';
  const startDate = sp.get('startDate') ?? '';
  const endDate = sp.get('endDate') ?? '';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams({ page, limit: '20' });
    if (status) qs.set('status', status);
    if (search) qs.set('search', search);
    if (artistId) qs.set('artistId', artistId);
    if (startDate) qs.set('startDate', startDate);
    if (endDate) qs.set('endDate', endDate);
    try {
      const result = await apiGetList<Booking>(`/admin/bookings?${qs.toString()}`);
      setData(result);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('No se pudieron cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  }, [page, status, search, artistId, startDate, endDate]);

  useEffect(() => {
    void load();
  }, [load]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page'); // volver a página 1 al filtrar
    router.replace(`/admin/bookings?${next.toString()}`);
  }

  async function changeStatus(booking: Booking, next: BookingStatus) {
    setSavingId(booking.id);
    setError(null);
    try {
      await apiPatch(`/admin/bookings/${booking.id}`, { status: next });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el estado.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="hud text-xs">ADMIN+</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Bookings</h1>
        </div>
        <p className="hud text-xs" aria-live="polite">
          {data ? `${data.pagination.total} en total` : ''}
        </p>
      </header>

      {/* Filtros */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setParam('search', String(fd.get('search') ?? '').trim());
        }}
        className="mt-5 flex flex-wrap items-end gap-3"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="f-status" className="hud text-xs">
            Estado
          </label>
          <select
            id="f-status"
            value={status}
            onChange={(e) => setParam('status', e.target.value)}
            className="rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="f-start" className="hud text-xs">
            Desde (fecha evento)
          </label>
          <input
            id="f-start"
            type="date"
            name="startDate"
            defaultValue={startDate}
            onChange={(e) => setParam('startDate', e.target.value)}
            className="rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="f-end" className="hud text-xs">
            Hasta
          </label>
          <input
            id="f-end"
            type="date"
            name="endDate"
            defaultValue={endDate}
            onChange={(e) => setParam('endDate', e.target.value)}
            className="rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="f-search" className="hud text-xs">
            Buscar
          </label>
          <input
            id="f-search"
            name="search"
            type="search"
            defaultValue={search}
            placeholder="Nombre, correo, ciudad…"
            className="w-56 rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--depth-0)] transition-transform hover:scale-[1.02]"
        >
          Aplicar
        </button>

        {(status || search || artistId || startDate || endDate) && (
          <button
            type="button"
            onClick={() => router.replace('/admin/bookings')}
            className="rounded-full border border-[var(--depth-4)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]"
          >
            Limpiar
          </button>
        )}
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-[var(--color-error,#ff7d8b)] bg-[rgba(255,125,139,0.08)] p-3 text-sm">
          {error}
        </p>
      )}

      {/* Tabla */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--depth-4)]">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-[var(--depth-2)]">
            <tr className="text-left">
              <th scope="col" className="hud px-4 py-3 text-[10px]">Solicitante</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Evento</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Fecha</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Ciudad</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Estado</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--depth-4)]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  Cargando…
                </td>
              </tr>
            ) : !data || data.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No hay solicitudes con esos filtros.
                </td>
              </tr>
            ) : (
              data.data.map((b) => (
                <tr key={b.id} className="bg-[var(--depth-1)] transition-colors hover:bg-[var(--depth-2)]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/bookings/${b.id}`} className="font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--accent)]">
                      {b.requesterName}
                    </Link>
                    <p className="text-xs text-[var(--text-muted)]">{b.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {b.eventType}
                    {b.artist && <p className="text-xs text-[var(--text-muted)]">→ {b.artist.name}</p>}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(b.eventDate)}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{b.city}</td>
                  <td className="px-4 py-3">
                    <span className={`hud rounded-full px-2.5 py-0.5 text-[10px] ${statusBadge(b.status)}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {TRANSITIONS[b.status].map((next) => (
                        <button
                          key={next}
                          type="button"
                          disabled={savingId === b.id}
                          onClick={() => changeStatus(b, next)}
                          className="rounded-full border border-[var(--depth-4)] px-2.5 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
                        >
                          → {STATUS_LABEL[next]}
                        </button>
                      ))}
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--depth-0)]"
                      >
                        Ver
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {data && data.pagination.totalPages > 1 && (
        <nav aria-label="Paginación" className="mt-6 flex items-center justify-center gap-4">
          {data.pagination.page > 1 ? (
            <button
              type="button"
              onClick={() => setParam('page', String(data.pagination.page - 1))}
              className="rounded-full border border-[var(--depth-4)] px-4 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]"
            >
              ← Anteriores
            </button>
          ) : (
            <span className="rounded-full border border-[var(--depth-4)] px-4 py-1.5 text-sm text-[var(--text-muted)] opacity-40" aria-disabled="true">
              ← Anteriores
            </span>
          )}
          <span className="hud text-xs">
            Página {data.pagination.page} de {data.pagination.totalPages}
          </span>
          {data.pagination.page < data.pagination.totalPages ? (
            <button
              type="button"
              onClick={() => setParam('page', String(data.pagination.page + 1))}
              className="rounded-full border border-[var(--depth-4)] px-4 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]"
            >
              Siguientes →
            </button>
          ) : (
            <span className="rounded-full border border-[var(--depth-4)] px-4 py-1.5 text-sm text-[var(--text-muted)] opacity-40" aria-disabled="true">
              Siguientes →
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
