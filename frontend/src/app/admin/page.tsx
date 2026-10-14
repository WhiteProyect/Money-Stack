'use client';

// Dashboard del panel (F5): Consola Ejecutiva & Centro de Mando del Sello.
// - Telemetría en vivo, métricas clave (KPIs), accesos directos de alta prioridad,
//   bandeja de bookings y agenda de eventos en tiempo real.
// - Tokens de titanio, carbono y cromo metálico con alto contraste y usabilidad.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGetList, ApiError } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { Booking, EventItem, Artist } from '@/lib/types';

export default function AdminDashboardPage() {
  const { user } = useSession();
  const canSeeBookings = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const [pending, setPending] = useState<Booking[] | null>(null);
  const [totalPendingBookings, setTotalPendingBookings] = useState<number>(0);
  const [upcoming, setUpcoming] = useState<EventItem[] | null>(null);
  const [totalUpcomingEvents, setTotalUpcomingEvents] = useState<number>(0);
  const [totalArtists, setTotalArtists] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const [bookingsRes, eventsRes, artistsRes] = await Promise.allSettled([
        canSeeBookings
          ? apiGetList<Booking>('/admin/bookings?status=PENDING&limit=5')
          : Promise.resolve({ data: [] as Booking[], pagination: { total: 0, page: 1, limit: 5, totalPages: 0 } }),
        apiGetList<EventItem>('/admin/events?upcoming=true&limit=5'),
        apiGetList<Artist>('/admin/artists?limit=1'),
      ]);

      if (cancelled) return;

      if (bookingsRes.status === 'fulfilled') {
        setPending(bookingsRes.value.data);
        setTotalPendingBookings(bookingsRes.value.pagination?.total ?? bookingsRes.value.data.length);
      } else if (bookingsRes.reason instanceof ApiError && bookingsRes.reason.status === 403) {
        setPending(null);
      } else {
        setError('No se pudieron sincronizar las solicitudes de booking.');
      }

      if (eventsRes.status === 'fulfilled') {
        setUpcoming(eventsRes.value.data);
        setTotalUpcomingEvents(eventsRes.value.pagination?.total ?? eventsRes.value.data.length);
      } else {
        setError((prev) => prev ?? 'No se pudieron sincronizar los próximos eventos.');
      }

      if (artistsRes.status === 'fulfilled') {
        setTotalArtists(artistsRes.value.pagination?.total ?? 0);
      }

      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [canSeeBookings]);

  return (
    <div className="space-y-8">
      {/* ── 1. Cabecera Ejecutiva & Bienvenida ── */}
      <div className="relative overflow-hidden rounded-2xl border border-[#202736] bg-gradient-to-r from-[#0c0f17] via-[#090b12] to-[#0c0f17] p-6 shadow-xl lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="font-bold tracking-widest uppercase">CONSOLA OPERATIVA // V2.6</span>
              <span>·</span>
              <span className="text-white/70">CAUCASIA, COLOMBIA</span>
            </div>
            <h1 className="mt-2 font-mono text-2xl font-black uppercase tracking-tight text-white sm:text-3xl lg:text-4xl">
              HOLA, <span className="text-[#cbd5e1]">{user?.name ?? 'ADMINISTRADOR'}</span>
            </h1>
            <p className="mt-1 text-xs text-[#94a3b8] sm:text-sm">
              Centro de mando para la gestión de catálogo musical, contratos de bookings y eventos en vivo.
            </p>
          </div>

          {/* Badge de Rol Táctico */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="rounded-xl border border-white/20 bg-[#121620] px-4 py-2.5 text-right font-mono">
              <span className="block text-[10px] uppercase tracking-widest text-[#94a3b8]">NIVEL DE ACCESO</span>
              <span className="block text-sm font-black tracking-wider text-white">
                {user?.role ?? 'EDITOR'}
              </span>
            </div>
          </div>
        </div>

        {/* Notificación de Error */}
        {error && (
          <div
            role="alert"
            className="mt-6 flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-200"
          >
            <span className="font-mono text-base font-bold text-red-400">⚠</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ── 2. Deck de Tarjetas de Métricas (KPIs de Titanio) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 01: Bookings Pendientes */}
        <div className="relative overflow-hidden rounded-2xl border border-[#202736] bg-[#090b12] p-5 shadow-lg transition-all hover:border-white/30">
          <div className="flex items-center justify-between font-mono text-xs text-[#94a3b8]">
            <span className="uppercase tracking-wider">BOOKINGS PENDIENTES</span>
            <span className="rounded-full bg-amber-500/15 p-1.5 text-amber-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-white sm:text-4xl">
              {loading ? '—' : canSeeBookings ? totalPendingBookings : 'N/A'}
            </span>
            {canSeeBookings && (
              <span className="font-mono text-[10px] text-amber-400">
                {totalPendingBookings > 0 ? 'POR REVISAR' : 'AL DÍA'}
              </span>
            )}
          </div>
          <div className="mt-4 border-t border-[#202736] pt-3">
            {canSeeBookings ? (
              <Link
                href="/admin/bookings?status=PENDING"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-[#cbd5e1] hover:text-white"
              >
                <span>Gestionar bandeja</span>
                <span>→</span>
              </Link>
            ) : (
              <span className="font-mono text-[10px] text-[#64748b]">Requiere rol ADMIN+</span>
            )}
          </div>
        </div>

        {/* KPI 02: Artistas en Roster */}
        <div className="relative overflow-hidden rounded-2xl border border-[#202736] bg-[#090b12] p-5 shadow-lg transition-all hover:border-white/30">
          <div className="flex items-center justify-between font-mono text-xs text-[#94a3b8]">
            <span className="uppercase tracking-wider">CATÁLOGO / ROSTER</span>
            <span className="rounded-full bg-white/10 p-1.5 text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="8" y1="22" x2="16" y2="22" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-white sm:text-4xl">
              {loading ? '—' : totalArtists}
            </span>
            <span className="font-mono text-[10px] text-[#94a3b8]">TALENTOS</span>
          </div>
          <div className="mt-4 border-t border-[#202736] pt-3">
            <Link
              href="/admin/artistas"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#cbd5e1] hover:text-white"
            >
              <span>Ver catálogo</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* KPI 03: Eventos Próximos */}
        <div className="relative overflow-hidden rounded-2xl border border-[#202736] bg-[#090b12] p-5 shadow-lg transition-all hover:border-white/30">
          <div className="flex items-center justify-between font-mono text-xs text-[#94a3b8]">
            <span className="uppercase tracking-wider">SHOWS EN AGENDA</span>
            <span className="rounded-full bg-white/10 p-1.5 text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-white sm:text-4xl">
              {loading ? '—' : totalUpcomingEvents}
            </span>
            <span className="font-mono text-[10px] text-emerald-400">PRÓXIMOS</span>
          </div>
          <div className="mt-4 border-t border-[#202736] pt-3">
            <Link
              href="/admin/eventos"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#cbd5e1] hover:text-white"
            >
              <span>Ver fechas</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* KPI 04: Estado del Engine */}
        <div className="relative overflow-hidden rounded-2xl border border-[#202736] bg-[#090b12] p-5 shadow-lg transition-all hover:border-white/30">
          <div className="flex items-center justify-between font-mono text-xs text-[#94a3b8]">
            <span className="uppercase tracking-wider">MOTOR BACKEND</span>
            <span className="rounded-full bg-emerald-500/15 p-1.5 text-emerald-400">
              <span className="inline-block h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-xl font-bold text-white sm:text-2xl">
              OPTIMIZADO
            </span>
          </div>
          <div className="mt-4 border-t border-[#202736] pt-3">
            <span className="font-mono text-[10px] text-[#94a3b8]">
              Node.js · Express · Prisma 6
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Barra de Acciones Rápidas (Shortcuts) ── */}
      <div className="rounded-2xl border border-[#202736] bg-[#0c0f17] p-4">
        <p className="px-2 font-mono text-[10px] uppercase tracking-widest text-[#64748b]">
          // ACCIONES RÁPIDAS DE ESTUDIO
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/admin/artistas/nuevo"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-[#121620] py-2.5 px-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-white hover:bg-white hover:text-black"
          >
            <span>+ Nuevo Artista</span>
          </Link>

          <Link
            href="/admin/eventos/nuevo"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-[#121620] py-2.5 px-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-white hover:bg-white hover:text-black"
          >
            <span>+ Agendar Show</span>
          </Link>

          {canSeeBookings && (
            <Link
              href="/admin/bookings"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#202736] bg-[#0e121a] py-2.5 px-3 font-mono text-xs font-bold uppercase tracking-wider text-[#cbd5e1] transition-all hover:border-[#cbd5e1] hover:text-white"
            >
              <span>Ver Bookings</span>
            </Link>
          )}

          <Link
            href="/admin/mi-cuenta"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#202736] bg-[#0e121a] py-2.5 px-3 font-mono text-xs font-bold uppercase tracking-wider text-[#cbd5e1] transition-all hover:border-[#cbd5e1] hover:text-white"
          >
            <span>Mi Cuenta</span>
          </Link>
        </div>
      </div>

      {/* ── 4. Contenido Principal en Dos Columnas ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Columna Izquierda: Bookings Pendientes */}
        <section
          aria-labelledby="bookings-heading"
          className="flex flex-col rounded-2xl border border-[#202736] bg-[#080a10] p-6 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-[#202736] pb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <h2 id="bookings-heading" className="font-mono text-base font-bold uppercase tracking-wide text-white">
                Solicitudes de Booking
              </h2>
            </div>
            {canSeeBookings && (
              <Link
                href="/admin/bookings"
                className="font-mono text-xs text-[#94a3b8] transition-colors hover:text-white"
              >
                Ver todos →
              </Link>
            )}
          </div>

          <div className="mt-4 flex-1">
            {loading ? (
              <div className="flex h-44 items-center justify-center font-mono text-xs text-[#94a3b8]">
                Sincronizando bandeja…
              </div>
            ) : !canSeeBookings || pending === null ? (
              <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-[#202736] p-4 text-center font-mono text-xs text-[#64748b]">
                <p>Módulo reservado para roles SUPER_ADMIN y ADMIN.</p>
              </div>
            ) : pending.length === 0 ? (
              <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-[#202736] p-6 text-center">
                <span className="font-mono text-2xl text-emerald-400">✓</span>
                <p className="mt-2 font-mono text-xs font-bold uppercase tracking-wider text-white">
                  Bandeja de entrada despejada
                </p>
                <p className="mt-1 text-xs text-[#94a3b8]">
                  No hay solicitudes de booking pendientes de revisión en este momento.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#202736]">
                {pending.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="group flex items-center justify-between py-3.5 px-2 transition-colors hover:bg-[#0f131c] rounded-xl"
                    >
                      <div>
                        <p className="font-mono text-xs font-bold text-white group-hover:text-amber-300">
                          {b.requesterName}
                        </p>
                        <p className="mt-0.5 text-xs text-[#94a3b8]">
                          {b.eventType} · {b.city} · {formatDate(b.eventDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                          {b.status}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Columna Derecha: Próximos Eventos */}
        <section
          aria-labelledby="events-heading"
          className="flex flex-col rounded-2xl border border-[#202736] bg-[#080a10] p-6 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-[#202736] pb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white" />
              <h2 id="events-heading" className="font-mono text-base font-bold uppercase tracking-wide text-white">
                Próximos Shows & Eventos
              </h2>
            </div>
            <Link
              href="/admin/eventos"
              className="font-mono text-xs text-[#94a3b8] transition-colors hover:text-white"
            >
              Ver agenda →
            </Link>
          </div>

          <div className="mt-4 flex-1">
            {loading ? (
              <div className="flex h-44 items-center justify-center font-mono text-xs text-[#94a3b8]">
                Sincronizando agenda…
              </div>
            ) : upcoming === null || upcoming.length === 0 ? (
              <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-[#202736] p-6 text-center">
                <span className="font-mono text-xl text-[#94a3b8]">✦</span>
                <p className="mt-2 font-mono text-xs font-bold uppercase tracking-wider text-white">
                  No hay fechas programadas
                </p>
                <p className="mt-1 text-xs text-[#94a3b8]">
                  Comienza creando el primer evento del sello discográfico.
                </p>
                <Link
                  href="/admin/eventos/nuevo"
                  className="mt-3 rounded-lg border border-white/20 bg-white/10 px-3 py-1 font-mono text-xs font-bold text-white hover:bg-white hover:text-black"
                >
                  + Programar Evento
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[#202736]">
                {upcoming.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/admin/eventos/${e.id}`}
                      className="group flex items-center justify-between py-3.5 px-2 transition-colors hover:bg-[#0f131c] rounded-xl"
                    >
                      <div>
                        <p className="font-mono text-xs font-bold text-white group-hover:text-emerald-300">
                          {e.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[#94a3b8]">
                          {e.venueName} · {e.city} · {formatDate(e.startsAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block rounded-md border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                          {e.status}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* ── 5. Telemetría de Seguridad y Cumplimiento Legal ── */}
      <div className="rounded-2xl border border-[#202736] bg-[#05070c] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between font-mono text-[11px] text-[#64748b]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-white/80 font-bold">SEGURIDAD CRIPTOGRÁFICA ACTIVA</span>
            <span>—</span>
            <span>ROTACIÓN HMAC SHA-256 + COOKIE HTTPONLY</span>
          </div>
          <div>
            <span>LEY 1581 DE 2012 (PROTECCIÓN DE DATOS · COLOMBIA)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

