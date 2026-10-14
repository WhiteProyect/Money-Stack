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
    <div className="space-y-6">
      {/* ── Cabecera ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="uppercase tracking-widest">NIVEL REQUERIDO: EDITOR+</span>
          </div>
          <h1 className="mt-1 font-mono text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            ROSTER DE ARTISTAS
          </h1>
          <p className="mt-1 text-xs text-[#94a3b8]">
            Directorio del catálogo musical, enlaces de plataformas y estado de contratación.
          </p>
        </div>

        <Link
          href="/admin/artistas/nuevo"
          className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black"
        >
          <span>+ Nuevo Artista</span>
        </Link>
      </div>

      {/* ── Barra de Búsqueda y Filtros ── */}
      <div className="rounded-2xl border border-[#202736] bg-[#090b12] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setParam('search', String(fd.get('search') ?? '').trim());
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="flex-1 min-w-[220px]">
            <label htmlFor="f-search" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
              // BUSCAR ARTISTA
            </label>
            <div className="relative">
              <input
                id="f-search"
                name="search"
                type="search"
                defaultValue={search}
                placeholder="Nombre, alias o género…"
                className="w-full rounded-xl border border-[#202736] bg-[#05070c] px-3.5 py-2 font-mono text-xs text-white placeholder:text-[#64748b] focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div className="w-36">
            <label htmlFor="f-active" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
              // ESTADO
            </label>
            <select
              id="f-active"
              value={isActive}
              onChange={(e) => setParam('isActive', e.target.value)}
              className="w-full rounded-xl border border-[#202736] bg-[#05070c] px-3 py-2 font-mono text-xs text-white focus:border-white focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-xl border border-[#202736] bg-[#121620] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Filtrar
          </button>

          {(search || isActive) && (
            <button
              type="button"
              onClick={() => router.replace('/admin/artistas')}
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

      {/* ── Tabla de Artistas ── */}
      <div className="overflow-hidden rounded-2xl border border-[#202736] bg-[#080a10] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="border-b border-[#202736] bg-[#0c0f17]">
              <tr className="font-mono text-[10px] uppercase tracking-wider text-[#94a3b8]">
                <th scope="col" className="px-5 py-3.5">Artista / Slug</th>
                <th scope="col" className="px-5 py-3.5">Géneros</th>
                <th scope="col" className="px-5 py-3.5">Indicadores</th>
                <th scope="col" className="px-5 py-3.5">Estado</th>
                <th scope="col" className="px-5 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202736]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center font-mono text-xs text-[#94a3b8]">
                    Sincronizando catálogo con base de datos…
                  </td>
                </tr>
              ) : !data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <p className="font-mono text-sm font-bold uppercase text-white">
                      No se encontraron artistas
                    </p>
                    <p className="mt-1 text-xs text-[#94a3b8]">
                      Prueba ajustando los filtros de búsqueda o agrega un nuevo integrante al roster.
                    </p>
                    <Link
                      href="/admin/artistas/nuevo"
                      className="mt-4 inline-block rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black"
                    >
                      + Registrar Primer Artista
                    </Link>
                  </td>
                </tr>
              ) : (
                data.data.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-[#0e121a]">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/artistas/${a.id}`}
                        className="font-mono text-sm font-bold text-white transition-colors hover:text-[#cbd5e1]"
                      >
                        {a.name}
                      </Link>
                      <p className="font-mono text-[10px] text-[#64748b]">/{a.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#cbd5e1]">
                      {a.genres.join(', ') || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                        {a.isFeatured && (
                          <span className="rounded-md border border-white/30 bg-white/10 px-2 py-0.5 text-white">
                            Destacado
                          </span>
                        )}
                        {a.isBookable && (
                          <span className="rounded-md border border-[#202736] bg-[#121620] px-2 py-0.5 text-[#94a3b8]">
                            Bookable
                          </span>
                        )}
                        {a.isSigned && (
                          <span className="rounded-md border border-[#202736] bg-[#121620] px-2 py-0.5 text-[#94a3b8]">
                            Firmado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                          a.isActive
                            ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border border-[#202736] bg-[#121620] text-[#64748b]'
                        }`}
                      >
                        {a.isActive ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono">
                      <Link
                        href={`/admin/artistas/${a.id}`}
                        className="inline-flex items-center gap-1 text-xs text-[#94a3b8] hover:text-white"
                      >
                        <span>Editar</span>
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
