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
    <div className="space-y-6">
      {/* ── Cabecera ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="uppercase tracking-widest">NIVEL REQUERIDO: EDITOR+</span>
          </div>
          <h1 className="mt-1 font-mono text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            AGENDA DE EVENTOS Y SHOWS
          </h1>
          <p className="mt-1 text-xs text-[#94a3b8]">
            Conciertos, festivales, presentaciones en vivo y gestión de cartelera de artistas.
          </p>
        </div>

        <Link
          href="/admin/eventos/nuevo"
          className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black"
        >
          <span>+ Nuevo Evento</span>
        </Link>
      </div>

      {/* ── Barra de Filtros ── */}
      <div className="rounded-2xl border border-[#202736] bg-[#090b12] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <label htmlFor="f-status" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
              // ESTADO DEL EVENTO
            </label>
            <select
              id="f-status"
              value={status}
              onChange={(e) => setParam('status', e.target.value)}
              className="w-full rounded-xl border border-[#202736] bg-[#05070c] px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
            >
              <option value="">Todos los estados</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label htmlFor="f-when" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
              // TEMPORALIDAD
            </label>
            <select
              id="f-when"
              value={when}
              onChange={(e) => setParam('when', e.target.value)}
              className="w-full rounded-xl border border-[#202736] bg-[#05070c] px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
            >
              <option value="">Todas las fechas</option>
              <option value="upcoming">Próximos en vivo</option>
              <option value="past">Shows pasados</option>
            </select>
          </div>

          {(status || when) && (
            <button
              type="button"
              onClick={() => router.replace('/admin/eventos')}
              className="rounded-xl border border-[#202736] bg-[#121620] px-4 py-2 font-mono text-xs text-[#cbd5e1] hover:text-white"
            >
              Limpiar filtros
            </button>
          )}
        </div>
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

      {/* ── Tabla de Eventos ── */}
      <div className="overflow-hidden rounded-2xl border border-[#202736] bg-[#080a10] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead className="border-b border-[#202736] bg-[#0c0f17]">
              <tr className="font-mono text-[10px] uppercase tracking-wider text-[#94a3b8]">
                <th scope="col" className="px-5 py-3.5">Evento / Slug</th>
                <th scope="col" className="px-5 py-3.5">Fecha y Hora</th>
                <th scope="col" className="px-5 py-3.5">Locación</th>
                <th scope="col" className="px-5 py-3.5">Cartel de Artistas</th>
                <th scope="col" className="px-5 py-3.5">Estado</th>
                <th scope="col" className="px-5 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202736]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center font-mono text-xs text-[#94a3b8]">
                    Sincronizando agenda con base de datos…
                  </td>
                </tr>
              ) : !data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="font-mono text-sm font-bold uppercase text-white">
                      No se encontraron eventos
                    </p>
                    <p className="mt-1 text-xs text-[#94a3b8]">
                      Prueba ajustando los filtros o registra una nueva fecha en el calendario del sello.
                    </p>
                    <Link
                      href="/admin/eventos/nuevo"
                      className="mt-4 inline-block rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black"
                    >
                      + Programar Primer Evento
                    </Link>
                  </td>
                </tr>
              ) : (
                data.data.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-[#0e121a]">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/eventos/${e.id}`}
                        className="font-mono text-sm font-bold text-white transition-colors hover:text-[#cbd5e1]"
                      >
                        {e.title}
                      </Link>
                      <p className="font-mono text-[10px] text-[#64748b]">/{e.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#cbd5e1]">
                      {formatDate(e.startsAt)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#cbd5e1]">
                      <p className="font-bold text-white">{e.venueName}</p>
                      {e.city && <p className="text-[10px] text-[#94a3b8]">{e.city}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/eventos/${e.id}#cartel`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#202736] bg-[#121620] px-2.5 py-1 font-mono text-xs text-[#cbd5e1] hover:border-white hover:text-white"
                      >
                        <span>{e.artists.length} artista{e.artists.length === 1 ? '' : 's'}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-md px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                          e.status === 'PUBLISHED'
                            ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : e.status === 'CANCELLED'
                              ? 'border border-red-500/30 bg-red-500/10 text-red-400'
                              : 'border border-[#202736] bg-[#121620] text-[#94a3b8]'
                        }`}
                      >
                        {STATUS_LABEL[e.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono">
                      <Link
                        href={`/admin/eventos/${e.id}`}
                        className="inline-flex items-center gap-1 text-xs text-[#94a3b8] hover:text-white"
                      >
                        <span>Gestionar</span>
                        <span>→</span>
                      </Link>
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
