'use client';

// Mi cuenta: cambio de contraseña de la sesión actual (POST /auth/change-password).
// La política de contraseña vive en el backend; los detalles por campo se
// muestran si el backend responde VALIDATION_ERROR.

import { useState } from 'react';
import { changePassword, logoutAll, ApiError } from '@/lib/api';
import { useSession } from '@/lib/session';
import { useRouter } from 'next/navigation';

const inputCls =
  'w-full rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]';

export default function MyAccountPage() {
  const { user } = useSession();
  const router = useRouter();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setDone(false);

    if (next !== confirm) {
      setFieldErrors({ confirm: 'Las contraseñas no coinciden.' });
      return;
    }
    if (next.length < 12 || !/[a-z]/.test(next) || !/[A-Z]/.test(next) || !/\d/.test(next)) {
      setFieldErrors({
        newPassword: 'Mínimo 12 caracteres, con mayúscula, minúscula y número.',
      });
      return;
    }

    setSaving(true);
    try {
      await changePassword(current, next);
      setDone(true);
      setCurrent('');
      setNext('');
      setConfirm('');
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
        setError('No se pudo cambiar la contraseña. Intenta de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  }

  async function onLogoutAll() {
    if (!window.confirm('Esto cerrará la sesión en TODOS los dispositivos. ¿Continuar?'))
      return;
    try {
      await logoutAll();
      router.replace('/admin/login');
    } catch {
      // logoutAll siempre limpia la sesión local, incluso si la API falla
      router.replace('/admin/login');
    }
  }

  return (
    <div className="max-w-lg">
      <p className="hud text-xs">Cuenta</p>
      <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Mi cuenta</h1>

      {user && (
        <dl className="mt-4 rounded-xl border border-[var(--depth-4)] bg-[var(--depth-1)] px-5">
          <div className="flex gap-4 border-b border-[var(--depth-4)] py-3 last:border-b-0">
            <dt className="hud w-24 shrink-0 text-xs">Nombre</dt>
            <dd className="text-sm text-[var(--text-primary)]">{user.name}</dd>
          </div>
          <div className="flex gap-4 border-b border-[var(--depth-4)] py-3 last:border-b-0">
            <dt className="hud w-24 shrink-0 text-xs">Correo</dt>
            <dd className="text-sm text-[var(--text-primary)]">{user.email}</dd>
          </div>
          <div className="flex gap-4 py-3">
            <dt className="hud w-24 shrink-0 text-xs">Rol</dt>
            <dd className="text-sm text-[var(--text-primary)]">{user.role}</dd>
          </div>
        </dl>
      )}

      <h2 className="mt-8 text-lg font-semibold text-[var(--text-primary)]">Cambiar contraseña</h2>

      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-[var(--color-error,#ff7d8b)] bg-[rgba(255,125,139,0.08)] p-3 text-sm">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="mt-3 rounded-lg border border-[var(--accent-soft)] bg-[var(--accent-soft)] p-3 text-sm text-[var(--accent)]">
          Contraseña actualizada. La usarás en el próximo inicio de sesión.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="current" className="hud text-xs">Contraseña actual *</label>
          <input
            id="current"
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            aria-invalid={Boolean(fieldErrors.currentPassword)}
            className={inputCls}
          />
          {fieldErrors.currentPassword && (
            <p role="alert" className="text-xs text-[var(--color-error,#ff7d8b)]">
              {fieldErrors.currentPassword}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="new" className="hud text-xs">Nueva contraseña *</label>
          <input
            id="new"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            aria-invalid={Boolean(fieldErrors.newPassword)}
            className={inputCls}
          />
          <p className="text-xs text-[var(--text-muted)]">
            Mínimo 12 caracteres, con mayúscula, minúscula y número.
          </p>
          {fieldErrors.newPassword && (
            <p role="alert" className="text-xs text-[var(--color-error,#ff7d8b)]">
              {fieldErrors.newPassword}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirm" className="hud text-xs">Confirmar nueva contraseña *</label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={Boolean(fieldErrors.confirm)}
            className={inputCls}
          />
          {fieldErrors.confirm && (
            <p role="alert" className="text-xs text-[var(--color-error,#ff7d8b)]">
              {fieldErrors.confirm}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-[var(--depth-0)] transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </form>

      <div className="mt-10 border-t border-[var(--depth-4)] pt-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Sesión</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          ¿En otra computadora? Cierra todas las sesiones para asegurarte.
        </p>
        <button
          type="button"
          onClick={onLogoutAll}
          className="mt-3 rounded-full border border-[var(--color-error,#ff7d8b)] px-5 py-2 text-sm text-[var(--color-error,#ff7d8b)] transition-colors hover:bg-[rgba(255,125,139,0.08)]"
        >
          Cerrar sesión en todos los dispositivos
        </button>
      </div>
    </div>
  );
}
