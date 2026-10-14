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
      return 'border border-amber-500/30 bg-amber-500/10 text-amber-400';
    case 'IN_REVIEW':
      return 'border border-blue-500/30 bg-blue-500/10 text-blue-400';
    case 'ACCEPTED':
      return 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    case 'REJECTED':
      return 'border border-red-500/30 bg-red-500/10 text-red-400';
    case 'CANCELLED':
      return 'border border-[#202736] bg-[#121620] text-[#94a3b8]';
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
    <div className="space-y-6">
      {/* ── Cabecera ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="uppercase tracking-widest">NIVEL REQUERIDO: ADMIN+</span>
          </div>
          <h1 className="mt-1 font-mono text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            BANDEJA DE BOOKINGS
          </h1>
          <p className="mt-1 text-xs text-[#94a3b8]">
            Solicitudes de contratación de artistas recibidas a través del portal público del sello.
          </p>
        </div>

        {data && (
          <div className="rounded-xl border border-white/20 bg-[#121620] px-4 py-2 font-mono text-xs">
            <span className="text-[#94a3b8]">TOTAL: </span>
            <span className="font-bold text-white">{data.pagination.total}</span>
          </div>
        )}
      </div>

      {/* ── Barra de Filtros ── */}
      <div className="rounded-2xl border border-[#202736] bg-[#090b12] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setParam('search', String(fd.get('search') ?? '').trim());
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="w-44">
            <label htmlFor="f-status" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
              // ESTADO
            </label>
            <select
              id="f-status"
              value={status}
              onChange={(e) => setParam('status', e.target.value)}
              className="w-full rounded-xl border border-[#202736] bg-[#05070c] px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
            >
              <option value="">Todos los estados</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="w-36">
            <label htmlFor="f-start" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
              // DESDE FECHA
            </label>
            <input
              id="f-start"
              type="date"
              name="startDate"
              defaultValue={startDate}
              onChange={(e) => setParam('startDate', e.target.value)}
              className="w-full rounded-xl border border-[#202736] bg-[#05070c] px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
            />
          </div>

          <div className="w-36">
            <label htmlFor="f-end" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
              // HASTA FECHA
            </label>
            <input
              id="f-end"
              type="date"
              name="endDate"
              defaultValue={endDate}
              onChange={(e) => setParam('endDate', e.target.value)}
              className="w-full rounded-xl border border-[#202736] bg-[#05070c] px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label htmlFor="f-search" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
              // BUSCAR SOLICITANTE / CIUDAD
            </label>
            <input
              id="f-search"
              name="search"
              type="search"
              defaultValue={search}
              placeholder="Nombre, email, ciudad…"
              className="w-full rounded-xl border border-[#202736] bg-[#05070c] px-3.5 py-2 font-mono text-xs text-white placeholder:text-[#64748b] focus:border-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl border border-[#202736] bg-[#121620] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Filtrar
          </button>

          {(status || search || artistId || startDate || endDate) && (
            <button
              type="button"
              onClick={() => router.replace('/admin/bookings')}
              className="rounded-xl border border-transparent px-3 py-2 font-mono text-xs text-[#94a3b8] hover:text-white"
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      {/* ── Aviso de Error ── */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 font-mono text-xs text-red-200"
        >
          {error}
        </div>
      )}

      {/* ── Tabla de Bookings ── */}
      <div className="overflow-hidden rounded-2xl border border-[#202736] bg-[#080a10] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-[#202736] bg-[#0c0f17]">
              <tr className="font-mono text-[10px] uppercase tracking-wider text-[#94a3b8]">
                <th scope="col" className="px-5 py-3.5">Solicitante</th>
                <th scope="col" className="px-5 py-3.5">Tipo de Evento</th>
                <th scope="col" className="px-5 py-3.5">Fecha del Show</th>
                <th scope="col" className="px-5 py-3.5">Ciudad</th>
                <th scope="col" className="px-5 py-3.5">Estado</th>
                <th scope="col" className="px-5 py-3.5 text-right">Transición Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202736]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center font-mono text-xs text-[#94a3b8]">
                    Sincronizando solicitudes con base de datos…
                  </td>
                </tr>
              ) : !data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="font-mono text-sm font-bold uppercase text-white">
                      No se encontraron solicitudes
                    </p>
                    <p className="mt-1 text-xs text-[#94a3b8]">
                      No hay solicitudes registradas que coincidan con los filtros seleccionados.
                    </p>
                  </td>
                </tr>
              ) : (
                data.data.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-[#0e121a]">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="font-mono text-sm font-bold text-white transition-colors hover:text-[#cbd5e1]"
                      >
                        {b.requesterName}
                      </Link>
                      <p className="font-mono text-[10px] text-[#64748b]">{b.email}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#cbd5e1]">
                      {b.eventType}
                      {b.artist && (
                        <p className="font-mono text-[10px] text-white/80">→ {b.artist.name}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#cbd5e1]">
                      {formatDate(b.eventDate)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#cbd5e1]">
                      {b.city}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-md px-2.5 py-0.5 font-mono text-[10px] font-bold ${statusBadge(
                          b.status
                        )}`}
                      >
                        {STATUS_LABEL[b.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5 font-mono text-xs">
                        {TRANSITIONS[b.status].map((next) => (
                          <button
                            key={next}
                            type="button"
                            disabled={savingId === b.id}
                            onClick={() => changeStatus(b, next)}
                            className="rounded-lg border border-[#202736] bg-[#121620] px-2.5 py-1 text-[11px] text-[#cbd5e1] transition-colors hover:border-white hover:text-white disabled:opacity-40"
                          >
                            → {STATUS_LABEL[next]}
                          </button>
                        ))}
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white hover:text-black"
                        >
                          Ver Detalle
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Paginación ── */}
      {data && data.pagination.totalPages > 1 && (
        <nav aria-label="Paginación" className="flex items-center justify-center gap-4 font-mono text-xs">
          <button
            type="button"
            disabled={data.pagination.page <= 1}
            onClick={() => setParam('page', String(data.pagination.page - 1))}
            className="rounded-xl border border-[#202736] bg-[#0c0f17] px-4 py-2 text-[#cbd5e1] transition-colors hover:border-white hover:text-white disabled:opacity-30 disabled:pointer-events-none"
          >
            ← Anteriores
          </button>
          <span className="text-[#94a3b8]">
            PÁGINA {data.pagination.page} DE {data.pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={data.pagination.page >= data.pagination.totalPages}
            onClick={() => setParam('page', String(data.pagination.page + 1))}
            className="rounded-xl border border-[#202736] bg-[#0c0f17] px-4 py-2 text-[#cbd5e1] transition-colors hover:border-white hover:text-white disabled:opacity-30 disabled:pointer-events-none"
          >
            Siguientes →
          </button>
        </nav>
      )}
    </div>
  );
}
