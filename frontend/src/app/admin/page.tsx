'use client';

// Dashboard del panel (F5): bookings pendientes + próximos eventos.
// Datos en cliente con el token en memoria (apiGet).

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGetList, ApiError } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { Booking, EventItem } from '@/lib/types';

export default function AdminDashboardPage() {
  const { user } = useSession();
  const canSeeBookings = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  const [pending, setPending] = useState<Booking[] | null>(null);
  const [upcoming, setUpcoming] = useState<EventItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const [bookingsRes, eventsRes] = await Promise.allSettled([
        canSeeBookings
          ? apiGetList<Booking>('/admin/bookings?status=PENDING&limit=5')
          : Promise.resolve({ data: null as Booking[] | null, pagination: null }),
        apiGetList<EventItem>('/admin/events?upcoming=true&limit=5'),
      ]);

      if (cancelled) return;

      if (bookingsRes.status === 'fulfilled') setPending(bookingsRes.value.data);
      else if (bookingsRes.reason instanceof ApiError && bookingsRes.reason.status === 403)
        setPending(null); // sin permiso (403): se muestra aviso, no "0 solicitudes"
      else setError('No se pudieron cargar los bookings pendientes.');

      if (eventsRes.status === 'fulfilled') setUpcoming(eventsRes.value.data);
      else setError((prev) => prev ?? 'No se pudieron cargar los próximos eventos.');

      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [canSeeBookings]);

  return (
    <div>
      <header>
        <p className="hud text-xs">Panel</p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Dashboard</h1>
      </header>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-[var(--color-error,#ff7d8b)] bg-[rgba(255,125,139,0.08)] p-3 text-sm">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Bookings pendientes */}
        <section aria-labelledby="pendientes" className="rounded-xl border border-[var(--depth-4)] bg-[var(--depth-1)] p-5">
          <div className="flex items-center justify-between">
            <h2 id="pendientes" className="text-lg font-semibold">
              Bookings pendientes
            </h2>
            <Link href="/admin/bookings?status=PENDING" className="hud text-xs transition-colors hover:text-[var(--accent)]">
              Ver todos
            </Link>
          </div>
          {loading ? (
            <p className="hud mt-4 text-xs" role="status">
              Cargando…
            </p>
          ) : pending === null ? (
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              No tienes permiso para ver las solicitudes de booking.
            </p>
          ) : pending.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--text-secondary)]">No hay solicitudes pendientes. 🎉</p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--depth-4)]">
              {pending.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="block py-3 transition-colors hover:bg-[var(--depth-2)]"
                  >
                    <p className="text-sm font-medium text-[var(--text-primary)]">{b.requesterName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {b.eventType} · {formatDate(b.eventDate)} · {b.city}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Próximos eventos */}
        <section aria-labelledby="proximos" className="rounded-xl border border-[var(--depth-4)] bg-[var(--depth-1)] p-5">
          <div className="flex items-center justify-between">
            <h2 id="proximos" className="text-lg font-semibold">
              Próximos eventos
            </h2>
            <Link href="/admin/eventos" className="hud text-xs transition-colors hover:text-[var(--accent)]">
              Ver todos
            </Link>
          </div>
          {loading ? (
            <p className="hud mt-4 text-xs" role="status">
              Cargando…
            </p>
          ) : upcoming === null || upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--text-secondary)]">No hay eventos programados.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--depth-4)]">
              {upcoming.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/admin/eventos/${e.id}`}
                    className="block py-3 transition-colors hover:bg-[var(--depth-2)]"
                  >
                    <p className="text-sm font-medium text-[var(--text-primary)]">{e.title}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {formatDate(e.startsAt)} · {e.venueName} · {e.status}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
