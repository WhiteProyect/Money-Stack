'use client';

// Formulario de artista (EDITOR+): crear y editar en una sola ruta.
// /admin/artistas/nuevo → POST; /admin/artistas/:id → GET + PATCH.
// Sin DELETE: se desactiva con isActive (regla del proyecto).
// Los errores del backend (error.details) se muestran por campo.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPatch, ApiError } from '@/lib/api';
import type { Artist, SocialLinkKey } from '@/lib/types';

const SOCIAL_KEYS: { key: SocialLinkKey; label: string }[] = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'spotify', label: 'Spotify' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'soundcloud', label: 'SoundCloud' },
  { key: 'web', label: 'Sitio web' },
];

const inputCls =
  'w-full rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]';

interface FormState {
  name: string;
  bio: string;
  genres: string; // coma-separados en el formulario
  imageUrl: string;
  coverUrl: string;
  socialLinks: Partial<Record<SocialLinkKey, string>>;
  isSigned: boolean;
  isBookable: boolean;
  isFeatured: boolean;
  isActive: boolean;
}

const EMPTY: FormState = {
  name: '',
  bio: '',
  genres: '',
  imageUrl: '',
  coverUrl: '',
  socialLinks: {},
  isSigned: true,
  isBookable: true,
  isFeatured: false,
  isActive: true,
};

export default function AdminArtistFormPage() {
  const params = useParams<{ id: string }>();
  const isNew = params.id === 'nuevo';
  const router = useRouter();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (isNew) return;
    try {
      const a = await apiGet<Artist>(`/admin/artists/${params.id}`);
      setForm({
        name: a.name,
        bio: a.bio ?? '',
        genres: a.genres.join(', '),
        imageUrl: a.imageUrl ?? '',
        coverUrl: a.coverUrl ?? '',
        socialLinks: { ...(a.socialLinks ?? {}) },
        isSigned: a.isSigned,
        isBookable: a.isBookable,
        isFeatured: a.isFeatured,
        isActive: a.isActive,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el artista.');
    } finally {
      setLoading(false);
    }
  }, [isNew, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setSaved(false);

    const genres = form.genres
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    const social = Object.fromEntries(
      Object.entries(form.socialLinks).filter(([, v]) => v && v.trim())
    );

    const payload = {
      name: form.name.trim(),
      bio: form.bio.trim() || null,
      genres,
      imageUrl: form.imageUrl.trim() || null,
      coverUrl: form.coverUrl.trim() || null,
      socialLinks: Object.keys(social).length > 0 ? social : null,
      isSigned: form.isSigned,
      isBookable: form.isBookable,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
    };

    try {
      if (isNew) {
        await apiPost<Artist>('/admin/artists', payload);
        router.replace('/admin/artistas');
      } else {
        const updated = await apiPatch<Artist>(`/admin/artists/${params.id}`, payload);
        setForm((f) => ({ ...f, name: updated.name }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
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
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="hud text-sm" role="status">
        Cargando artista…
      </p>
    );
  }

  return (
    <div className="max-w-2xl">
      <nav aria-label="Migas" className="hud text-xs">
        <Link href="/admin/artistas" className="transition-colors hover:text-[var(--accent)]">
          Artistas
        </Link>
        <span aria-hidden="true" className="mx-2 opacity-50">/</span>
        <span className="text-[var(--text-secondary)]">{isNew ? 'Nuevo' : 'Editar'}</span>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">
        {isNew ? 'Nuevo artista' : `Editar: ${form.name}`}
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
          <label htmlFor="name" className="hud text-xs">Nombre *</label>
          <input
            id="name"
            type="text"
            required
            maxLength={120}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            className={inputCls}
          />
          {fieldErrors.name && (
            <p role="alert" className="text-xs text-[var(--color-error,#ff7d8b)]">{fieldErrors.name}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="bio" className="hud text-xs">Biografía</label>
          <textarea
            id="bio"
            rows={5}
            maxLength={4000}
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            className={`${inputCls} resize-y`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="genres" className="hud text-xs">Géneros (separados por coma)</label>
          <input
            id="genres"
            type="text"
            placeholder="afrobeat, champeta, rap"
            value={form.genres}
            onChange={(e) => set('genres', e.target.value)}
            className={inputCls}
          />
          <p className="text-xs text-[var(--text-muted)]">Máximo 12.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="imageUrl" className="hud text-xs">URL de imagen (https)</label>
            <input
              id="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)}
              aria-invalid={Boolean(fieldErrors.imageUrl)}
              className={inputCls}
            />
            {fieldErrors.imageUrl && (
              <p role="alert" className="text-xs text-[var(--color-error,#ff7d8b)]">{fieldErrors.imageUrl}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="coverUrl" className="hud text-xs">URL de portada (https)</label>
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
        </div>

        <fieldset className="rounded-xl border border-[var(--depth-4)] p-4">
          <legend className="hud px-2 text-xs">Redes sociales (https)</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {SOCIAL_KEYS.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <label htmlFor={`social-${key}`} className="text-xs text-[var(--text-secondary)]">
                  {label}
                </label>
                <input
                  id={`social-${key}`}
                  type="url"
                  placeholder="https://…"
                  value={form.socialLinks[key] ?? ''}
                  onChange={(e) =>
                    set('socialLinks', { ...form.socialLinks, [key]: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            ))}
          </div>
          {fieldErrors.socialLinks && (
            <p role="alert" className="mt-2 text-xs text-[var(--color-error,#ff7d8b)]">
              {fieldErrors.socialLinks}
            </p>
          )}
        </fieldset>

        <fieldset className="rounded-xl border border-[var(--depth-4)] p-4">
          <legend className="hud px-2 text-xs">Estado</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ['isSigned', 'Firmado con el sello'],
                ['isBookable', 'Disponible para booking'],
                ['isFeatured', 'Destacado en el inicio'],
                ['isActive', 'Activo (visible en el sitio)'],
              ] as [keyof FormState, string][]
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={Boolean(form[key])}
                  onChange={(e) => set(key, e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-[var(--depth-0)] transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {saving ? 'Guardando…' : isNew ? 'Crear artista' : 'Guardar cambios'}
          </button>
          <Link
            href="/admin/artistas"
            className="rounded-full border border-[var(--depth-4)] px-6 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
