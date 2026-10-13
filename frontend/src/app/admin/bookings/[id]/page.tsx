'use client';

// Detalle de booking (ADMIN+): datos completos, notas internas y cambio de
// estado con transiciones válidas. PATCH { status, adminNotes }.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, apiPatch, ApiError } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import type { Booking, BookingStatus } from '@/lib/types';

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Pendiente',
  IN_REVIEW: 'En revisión',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
};

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['IN_REVIEW', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
  IN_REVIEW: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[var(--depth-4)] py-3 last:border-b-0 sm:flex-row sm:gap-4">
      <dt className="hud w-36 shrink-0 text-xs">{label}</dt>
      <dd className="break-words text-sm text-[var(--text-primary)]">{children}</dd>
    </div>
  );
}

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<Booking>(`/admin/bookings/${id}`);
      setBooking(data);
      setNotes(data.adminNotes ?? '');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar la solicitud.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(payload: { status: BookingStatus; adminNotes?: string }) {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await apiPatch<Booking>(`/admin/bookings/${id}`, payload);
      setBooking(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="hud text-sm" role="status">
        Cargando solicitud…
      </p>
    );
  }

  if (!booking) {
    return (
      <div>
        <p role="alert" className="rounded-lg border border-[var(--color-error,#ff7d8b)] bg-[rgba(255,125,139,0.08)] p-3 text-sm">
          {error ?? 'Solicitud no encontrada.'}
        </p>
        <button
          type="button"
          onClick={() => router.replace('/admin/bookings')}
          className="mt-4 rounded-full border border-[var(--depth-4)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]"
        >
          ← Volver a bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <nav aria-label="Migas" className="hud text-xs">
        <Link href="/admin/bookings" className="transition-colors hover:text-[var(--accent)]">
          Bookings
        </Link>
        <span aria-hidden="true" className="mx-2 opacity-50">/</span>
        <span className="text-[var(--text-secondary)]">{booking.requesterName}</span>
      </nav>

      <header className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          {booking.requesterName}
        </h1>
        <span className="hud rounded-full bg-[var(--depth-3)] px-3 py-1 text-[10px]">
          {STATUS_LABEL[booking.status]}
        </span>
      </header>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-[var(--color-error,#ff7d8b)] bg-[rgba(255,125,139,0.08)] p-3 text-sm">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="mt-4 rounded-lg border border-[var(--accent-soft)] bg-[var(--accent-soft)] p-3 text-sm text-[var(--accent)]">
          Guardado.
        </p>
      )}

      {/* Datos */}
      <dl className="mt-6 rounded-xl border border-[var(--depth-4)] bg-[var(--depth-1)] px-5">
        <Row label="Correo">
          <a href={`mailto:${booking.email}`} className="text-[var(--accent)] underline underline-offset-2">
            {booking.email}
          </a>
        </Row>
        <Row label="Teléfono">{booking.phone}</Row>
        {booking.organization && <Row label="Organización">{booking.organization}</Row>}
        <Row label="Tipo de evento">{booking.eventType}</Row>
        <Row label="Fecha del evento">{formatDate(booking.eventDate)}</Row>
        <Row label="Ciudad">{booking.city}</Row>
        {booking.venue && <Row label="Venue">{booking.venue}</Row>}
        <Row label="Presupuesto">{formatPrice(booking.budget)}</Row>
        {booking.artist && (
          <Row label="Artista de interés">
            <Link href={`/admin/artistas/${booking.artist.id}`} className="text-[var(--accent)] underline underline-offset-2">
              {booking.artist.name}
            </Link>
          </Row>
        )}
        <Row label="Enviada el">{formatDate(booking.createdAt)}</Row>
      </dl>

      {/* Mensaje */}
      <section className="mt-8" aria-labelledby="mensaje">
        <h2 id="mensaje" className="text-lg font-semibold text-[var(--text-primary)]">
          Mensaje
        </h2>
        <p className="mt-2 whitespace-pre-line rounded-xl border border-[var(--depth-4)] bg-[var(--depth-1)] p-5 text-sm leading-relaxed text-[var(--text-secondary)]">
          {booking.message}
        </p>
      </section>

      {/* Estado + notas */}
      <section className="mt-8" aria-labelledby="gestion">
        <h2 id="gestion" className="text-lg font-semibold text-[var(--text-primary)]">
          Gestión
        </h2>

        <div className="mt-3 flex flex-wrap gap-2">
          {TRANSITIONS[booking.status].map((next) => (
            <button
              key={next}
              type="button"
              disabled={saving}
              onClick={() => save({ status: next })}
              className="rounded-full border border-[var(--depth-4)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
            >
              Cambiar a {STATUS_LABEL[next]}
            </button>
          ))}
          {TRANSITIONS[booking.status].length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">
              Estado final: no hay transiciones disponibles.
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <label htmlFor="adminNotes" className="hud text-xs">
            Notas internas
          </label>
          <textarea
            id="adminNotes"
            rows={5}
            maxLength={4000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Seguimiento, acuerdos, tarifa acordada…"
            className="w-full rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          />
          <div>
            <button
              type="button"
              disabled={saving}
              // El backend exige status en todo PATCH: se reenvía el actual.
              onClick={() => save({ status: booking.status, adminNotes: notes })}
              className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--depth-0)] transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar notas'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
