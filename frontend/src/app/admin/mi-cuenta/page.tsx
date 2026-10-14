'use client';

// Mi cuenta: cambio de contraseña de la sesión actual (POST /auth/change-password).
// La política de contraseña vive en el backend; los detalles por campo se
// muestran si el backend responde VALIDATION_ERROR.

import { useState } from 'react';
import { changePassword, logoutAll, ApiError } from '@/lib/api';
import { useSession } from '@/lib/session';
import { useRouter } from 'next/navigation';

const inputCls =
  'w-full rounded-xl border border-[#202736] bg-[#05070c] px-3.5 py-2.5 font-mono text-xs text-white placeholder:text-[#64748b] focus:border-white focus:outline-none';

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
      router.replace('/admin/login');
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* ── Cabecera ── */}
      <div>
        <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          <span className="uppercase tracking-widest">SEGURIDAD & CREDENCIALES</span>
        </div>
        <h1 className="mt-1 font-mono text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          PERFIL & MI CUENTA
        </h1>
        <p className="mt-1 text-xs text-[#94a3b8]">
          Información de operador de estudio y actualización de clave maestra HMAC.
        </p>
      </div>

      {/* ── Tarjeta de Perfil del Operador ── */}
      {user && (
        <div className="overflow-hidden rounded-2xl border border-[#202736] bg-[#090b12] p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-[#121620] font-mono text-xl font-black text-white shadow-inner">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-mono text-base font-bold text-white">{user.name}</h2>
              <p className="truncate font-mono text-xs text-[#94a3b8]">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white">
                  {user.role}
                </span>
                <span className="font-mono text-[10px] text-emerald-400">
                  ● SESIÓN AUTORIZADA
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Formulario de Cambio de Contraseña ── */}
      <div className="rounded-2xl border border-[#202736] bg-[#090b12] p-6 shadow-xl">
        <div className="border-b border-[#202736] pb-4">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
            // ACTUALIZAR CONTRASEÑA MAESTRA
          </h2>
          <p className="mt-1 text-xs text-[#94a3b8]">
            La nueva clave se cifrará con bcrypt (cost factor 12) y revocará sesiones anteriores.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 font-mono text-xs text-red-200"
          >
            {error}
          </div>
        )}

        {done && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 font-mono text-xs text-emerald-300"
          >
            ✓ Contraseña actualizada correctamente. La usarás en el próximo inicio de sesión.
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
          <div>
            <label htmlFor="current" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
              // CONTRASEÑA ACTUAL *
            </label>
            <input
              id="current"
              type="password"
              autoComplete="current-password"
              required
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              aria-invalid={Boolean(fieldErrors.currentPassword)}
              placeholder="••••••••••••"
              className={inputCls}
            />
            {fieldErrors.currentPassword && (
              <p role="alert" className="mt-1 font-mono text-[10px] text-red-400">
                {fieldErrors.currentPassword}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="new" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
              // NUEVA CONTRASEÑA *
            </label>
            <input
              id="new"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              aria-invalid={Boolean(fieldErrors.newPassword)}
              placeholder="Mínimo 12 caracteres (mayúscula, minúscula, número)"
              className={inputCls}
            />
            {fieldErrors.newPassword && (
              <p role="alert" className="mt-1 font-mono text-[10px] text-red-400">
                {fieldErrors.newPassword}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirm" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
              // CONFIRMAR NUEVA CONTRASEÑA *
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={Boolean(fieldErrors.confirm)}
              placeholder="Repite la nueva contraseña"
              className={inputCls}
            />
            {fieldErrors.confirm && (
              <p role="alert" className="mt-1 font-mono text-[10px] text-red-400">
                {fieldErrors.confirm}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black disabled:opacity-40"
            >
              {saving ? 'Guardando nueva clave…' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Zona de Peligro / Cierre Global ── */}
      <div className="rounded-2xl border border-red-500/30 bg-[#0c080a] p-6 shadow-xl">
        <div className="border-b border-red-500/20 pb-4">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-red-400">
            // ZONA DE SEGURIDAD · REVOCACIÓN DE SESIONES
          </h2>
          <p className="mt-1 text-xs text-[#94a3b8]">
            Invalida todos los refresh tokens de tu usuario en la base de datos PostgreSQL.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-[#94a3b8]">
            ¿Sospechas que otra terminal tiene tu sesión abierta?
          </p>
          <button
            type="button"
            onClick={onLogoutAll}
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-red-400 transition-colors hover:bg-red-500/20"
          >
            Cerrar en todos los dispositivos
          </button>
        </div>
      </div>
    </div>
  );
}

