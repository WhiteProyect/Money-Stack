'use client';

// Formulario de evento (EDITOR+): crear y editar en una sola ruta, con el
// editor de cartel (PUT /admin/events/:id/lineup = reemplazo completo).
// Reglas del backend: endsAt > startsAt, price >= 0, ticketUrl https.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, apiGetList, apiPost, apiPatch, apiPut, ApiError } from '@/lib/api';
import type { Artist, EventItem, EventStatus } from '@/lib/types';

const inputCls =
  'w-full rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]';

const STATUS_LABEL: Record<EventStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  CANCELLED: 'Cancelado',
  FINISHED: 'Finalizado',
};

interface LineupEntry {
  artistId: string;
  name: string;
  order: number;
  isHeadliner: boolean;
}

// datetime-local <-> ISO, siempre en hora de Colombia (UTC-5), sin depender de la
// zona del navegador.
const bogotaParts = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return bogotaParts.format(d).replace(' ', 'T'); // YYYY-MM-DDTHH:mm
}

function fromLocalInput(value: string): string | null {
  const d = new Date(`${value}:00-05:00`);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export default function AdminEventFormPage() {
  const params = useParams<{ id: string }>();
  const isNew = params.id === 'nuevo';
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    venueName: '',
    address: '',
    city: '',
    startsAt: '',
    endsAt: '',
    coverUrl: '',
    ticketUrl: '',
    price: '',
    capacity: '',
    status: 'DRAFT' as EventStatus,
  });
  const [lineup, setLineup] = useState<LineupEntry[]>([]);
  const [catalog, setCatalog] = useState<Artist[]>([]);
  const [addArtistId, setAddArtistId] = useState('');

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    // Catálogo de artistas activos para el selector del cartel.
    try {
      const list = await apiGetList<Artist>('/admin/artists?limit=100&isActive=true');
      setCatalog(list.data);
    } catch {
      setCatalog([]);
    }

    if (isNew) return;
    try {
      const e = await apiGet<EventItem>(`/admin/events/${params.id}`);
      setForm({
        title: e.title,
        description: e.description ?? '',
        venueName: e.venueName,
        address: e.address ?? '',
        city: e.city ?? '',
        startsAt: toLocalInput(e.startsAt),
        endsAt: toLocalInput(e.endsAt),
        coverUrl: e.coverUrl ?? '',
        ticketUrl: e.ticketUrl ?? '',
        price: e.price === null || e.price === undefined ? '' : String(e.price),
        capacity: e.capacity === null || e.capacity === undefined ? '' : String(e.capacity),
        status: e.status,
      });
      setLineup(
        [...e.artists]
          .sort((a, b) => a.order - b.order)
          .map((a) => ({
            artistId: a.artistId,
            name: a.name,
            order: a.order,
            isHeadliner: a.isHeadliner,
          }))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el evento.');
    } finally {
      setLoading(false);
    }
  }, [isNew, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setSaved(false);

    const startsAtIso = form.startsAt ? fromLocalInput(form.startsAt) : null;
    if (!startsAtIso) {
      setFieldErrors({ startsAt: 'La fecha y hora de inicio es obligatoria.' });
      setError('Revisa los campos marcados.');
      setSaving(false);
      return;
    }
    const endsAtIso = form.endsAt ? fromLocalInput(form.endsAt) : null;
    if (form.endsAt && !endsAtIso) {
      setFieldErrors({ endsAt: 'La fecha de fin no es válida.' });
      setError('Revisa los campos marcados.');
      setSaving(false);
      return;
    }

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      venueName: form.venueName.trim(),
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      startsAt: startsAtIso,
      coverUrl: form.coverUrl.trim() || null,
      ticketUrl: form.ticketUrl.trim() || null,
      status: form.status,
    };
    if (endsAtIso) payload.endsAt = endsAtIso;
    // El backend interpreta "50.000" como cincuenta mil.
    if (form.price.trim() !== '') payload.price = form.price.trim();
    if (form.capacity.trim() !== '') payload.capacity = Number(form.capacity);

    try {
      if (isNew) {
        const created = await apiPost<EventItem>('/admin/events', payload);
        router.replace(`/admin/eventos/${created.id}`);
      } else {
        await apiPatch<EventItem>(`/admin/events/${params.id}`, payload);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  }

  function handleError(err: unknown) {
    if (err instanceof ApiError) {
      if (err.details?.length) {
        const map: Record<string, string> = {};
        for (const d of err.details) {
          const key = d.field.includes('.') ? d.field.split('.').pop()! : d.field;
          if (!(key in map)) map[key] = d.message;
        }
        setFieldErrors(map);
        setError('Revisa los campos marcados.');
      } else {
        setError(err.message);
      }
    } else {
      setError('No se pudo guardar. Intenta de nuevo.');
    }
  }

  // ── Cartel ────────────────────────────────────────────────────────────────
  function addArtist() {
    if (!addArtistId) return;
    const artist = catalog.find((a) => a.id === addArtistId);
    if (!artist || lineup.some((l) => l.artistId === artist.id)) return;
    setLineup((l) => [
      ...l,
      { artistId: artist.id, name: artist.name, order: l.length, isHeadliner: l.length === 0 },
    ]);
    setAddArtistId('');
  }

  function removeArtist(artistId: string) {
    setLineup((l) =>
      l
        .filter((x) => x.artistId !== artistId)
        .map((x, i) => ({ ...x, order: i }))
    );
  }

  function move(index: number, dir: -1 | 1) {
    setLineup((l) => {
      const next = [...l];
      const target = index + dir;
      if (target < 0 || target >= next.length) return l;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((x, i) => ({ ...x, order: i }));
    });
  }

  function setHeadliner(artistId: string) {
    setLineup((l) => l.map((x) => ({ ...x, isHeadliner: x.artistId === artistId })));
  }

  async function saveLineup() {
    if (isNew || lineup.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await apiPut(`/admin/events/${params.id}/lineup`, {
        lineup: lineup.map((x) => ({
          artistId: x.artistId,
          order: x.order,
          isHeadliner: x.isHeadliner,
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="hud text-sm" role="status">
        Cargando evento…
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <nav aria-label="Migas" className="hud text-xs">
        <Link href="/admin/eventos" className="transition-colors hover:text-[var(--accent)]">
          Eventos
        </Link>
        <span aria-hidden="true" className="mx-2 opacity-50">/</span>
        <span className="text-[var(--text-secondary)]">{isNew ? 'Nuevo' : 'Editar'}</span>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
        {isNew ? 'Nuevo evento' : `Editar: ${form.title}`}
      </h1>

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

      <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="hud text-xs">Título *</label>
          <input
            id="title"
            type="text"
            required
            maxLength={160}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            aria-invalid={Boolean(fieldErrors.title)}
            className={inputCls}
          />
          {fieldErrors.title && (
            <p role="alert" className="text-xs text-[var(--color-error,#ff7d8b)]">{fieldErrors.title}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="hud text-xs">Descripción</label>
          <textarea
            id="description"
            rows={4}
            maxLength={6000}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={`${inputCls} resize-y`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="venueName" className="hud text-xs">Venue *</label>
            <input
              id="venueName"
              type="text"
              required
              maxLength={160}
              value={form.venueName}
              onChange={(e) => set('venueName', e.target.value)}
              aria-invalid={Boolean(fieldErrors.venueName)}
              className={inputCls}
            />
            {fieldErrors.venueName && (
              <p role="alert" className="text-xs text-[var(--color-error,#ff7d8b)]">{fieldErrors.venueName}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="city" className="hud text-xs">Ciudad</label>
            <input
              id="city"
              type="text"
              maxLength={80}
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label htmlFor="address" className="hud text-xs">Dirección</label>
            <input
              id="address"
              type="text"
              maxLength={240}
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="startsAt" className="hud text-xs">Inicio *</label>
            <input
              id="startsAt"
              type="datetime-local"
              required
              value={form.startsAt}
              onChange={(e) => set('startsAt', e.target.value)}
              aria-invalid={Boolean(fieldErrors.startsAt)}
              className={inputCls}
            />
            {fieldErrors.startsAt && (
              <p role="alert" className="text-xs text-[var(--color-error,#ff7d8b)]">{fieldErrors.startsAt}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="endsAt" className="hud text-xs">Fin</label>
            <input
              id="endsAt"
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => set('endsAt', e.target.value)}
              aria-invalid={Boolean(fieldErrors.endsAt)}
              className={inputCls}
            />
            {fieldErrors.endsAt && (
              <p role="alert" className="text-xs text-[var(--color-error,#ff7d8b)]">{fieldErrors.endsAt}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="price" className="hud text-xs">Precio (COP)</label>
            <input
              id="price"
              type="text"
              inputMode="numeric"
              placeholder="0 = entrada libre"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              aria-invalid={Boolean(fieldErrors.price)}
              className={inputCls}
            />
            {fieldErrors.price && (
              <p role="alert" className="text-xs text-[var(--color-error,#ff7d8b)]">{fieldErrors.price}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="capacity" className="hud text-xs">Aforo</label>
            <input
              id="capacity"
              type="text"
              inputMode="numeric"
              value={form.capacity}
              onChange={(e) => set('capacity', e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="coverUrl" className="hud text-xs">Portada (https)</label>
            <input
              id="coverUrl"
              type="url"
              value={form.coverUrl}
              onChange={(e) => set('coverUrl', e.target.value)}
              aria-invalid={Boolean(fieldErrors.coverUrl)}
              className={inputCls}
            />
            {fieldErrors.coverUrl && (
              <p role="alert" className="text-xs text-[var(--color-error,#ff7d8b)]">{fieldErrors.coverUrl}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="ticketUrl" className="hud text-xs">Boletería (https)</label>
            <input
              id="ticketUrl"
              type="url"
              value={form.ticketUrl}
              onChange={(e) => set('ticketUrl', e.target.value)}
              aria-invalid={Boolean(fieldErrors.ticketUrl)}
              className={inputCls}
            />
            {fieldErrors.ticketUrl && (
              <p role="alert" className="text-xs text-[var(--color-error,#ff7d8b)]">{fieldErrors.ticketUrl}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="hud text-xs">Estado</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => set('status', e.target.value as EventStatus)}
            className={inputCls}
          >
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-[var(--depth-0)] transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {saving ? 'Guardando…' : isNew ? 'Crear evento' : 'Guardar cambios'}
          </button>
          <Link
            href="/admin/eventos"
            className="rounded-full border border-[var(--depth-4)] px-6 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]"
          >
            Cancelar
          </Link>
        </div>
      </form>

      {/* Cartel: PUT /lineup reemplaza la lista completa */}
      <section id="cartel" className="mt-12 scroll-mt-24" aria-labelledby="cartel-title">
        <h2 id="cartel-title" className="text-lg font-semibold text-[var(--text-primary)]">
          Cartel
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          El orden de la lista es el orden de aparición. Marca un cabezal de cartel.
        </p>

        {isNew ? (
          <p className="mt-4 rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] p-4 text-sm text-[var(--text-muted)]">
            Crea el evento primero: el cartel se edita después.
          </p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="add-artist" className="hud text-xs">Agregar artista</label>
                <select
                  id="add-artist"
                  value={addArtistId}
                  onChange={(e) => setAddArtistId(e.target.value)}
                  className="rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm"
                >
                  <option value="">Selecciona…</option>
                  {catalog
                    .filter((a) => !lineup.some((l) => l.artistId === a.id))
                    .map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
              </div>
              <button
                type="button"
                onClick={addArtist}
                disabled={!addArtistId}
                className="rounded-full border border-[var(--depth-4)] px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40"
              >
                + Agregar
              </button>
            </div>

            {lineup.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-[var(--depth-4)] p-6 text-center text-sm text-[var(--text-muted)]">
                El cartel está vacío. Agrega al menos un artista.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {lineup.map((entry, i) => (
                  <li
                    key={entry.artistId}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-4 py-2.5"
                  >
                    <span className="hud text-xs" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                      {entry.name}
                    </span>
                    <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      <input
                        type="radio"
                        name="headliner"
                        checked={entry.isHeadliner}
                        onChange={() => setHeadliner(entry.artistId)}
                        className="h-3.5 w-3.5 accent-[var(--accent)]"
                      />
                      Cabezal
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label={`Mover a ${entry.name} arriba`}
                        className="rounded border border-[var(--depth-4)] px-2 py-1 text-xs text-[var(--text-secondary)] disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        disabled={i === lineup.length - 1}
                        aria-label={`Mover a ${entry.name} abajo`}
                        className="rounded border border-[var(--depth-4)] px-2 py-1 text-xs text-[var(--text-secondary)] disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeArtist(entry.artistId)}
                        aria-label={`Quitar a ${entry.name} del cartel`}
                        className="rounded border border-[var(--depth-4)] px-2 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--color-error,#ff7d8b)] hover:text-[var(--color-error,#ff7d8b)]"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={saveLineup}
              disabled={saving || lineup.length === 0}
              className="mt-4 rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-[var(--depth-0)] transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar cartel'}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
