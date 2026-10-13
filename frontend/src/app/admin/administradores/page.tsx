'use client';

// Gestión de administradores (SOLO SUPER_ADMIN): lista, alta, edición de
// rol/estado, reset de contraseña y desbloqueo. Nada se borra: se desactiva.

import { useCallback, useEffect, useState } from 'react';
import { apiGetList, apiPost, apiPatch, ApiError } from '@/lib/api';
import { useSession } from '@/lib/session';
import type { Paginated, Role } from '@/lib/types';

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
};

const ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];

const inputCls =
  'w-full rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]';

interface AdminRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  lockedUntil?: string | null;
}

export default function AdminUsersPage() {
  const { user } = useSession();
  const isSuper = user?.role === 'SUPER_ADMIN';

  const [data, setData] = useState<Paginated<AdminRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Alta
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>('EDITOR');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!isSuper) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await apiGetList<AdminRow>('/admin/users?limit=50'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los administradores.');
    } finally {
      setLoading(false);
    }
  }, [isSuper]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createAdmin(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await apiPost('/admin/users', {
        email: newEmail.trim(),
        name: newName.trim(),
        role: newRole,
        password: newPassword,
      });
      setShowCreate(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      setNotice('Administrador creado.');
      setTimeout(() => setNotice(null), 2500);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el administrador.');
    } finally {
      setCreating(false);
    }
  }

  async function patch(admin: AdminRow, payload: Record<string, unknown>, msg: string) {
    setError(null);
    try {
      await apiPatch(`/admin/users/${admin.id}`, payload);
      setNotice(msg);
      setTimeout(() => setNotice(null), 2500);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar.');
    }
  }

  async function resetPassword(admin: AdminRow) {
    const password = window.prompt(`Nueva contraseña para ${admin.email}:`);
    if (!password) return;
    setError(null);
    try {
      await apiPost(`/admin/users/${admin.id}/reset-password`, { newPassword: password });
      setNotice('Contraseña restablecida.');
      setTimeout(() => setNotice(null), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo restablecer la contraseña.');
    }
  }

  async function unlock(admin: AdminRow) {
    setError(null);
    try {
      await apiPost(`/admin/users/${admin.id}/unlock`, {});
      setNotice('Cuenta desbloqueada.');
      setTimeout(() => setNotice(null), 2500);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo desbloquear.');
    }
  }

  if (!isSuper) {
    return (
      <p className="rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] p-4 text-sm text-[var(--text-secondary)]">
        Esta sección es exclusiva de SUPER_ADMIN.
      </p>
    );
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="hud text-xs">SUPER_ADMIN</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">Administradores</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((s) => !s)}
          className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-[var(--depth-0)] transition-transform hover:scale-[1.02]"
        >
          {showCreate ? 'Cancelar' : '+ Nuevo administrador'}
        </button>
      </header>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-[var(--color-error,#ff7d8b)] bg-[rgba(255,125,139,0.08)] p-3 text-sm">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 rounded-lg border border-[var(--accent-soft)] bg-[var(--accent-soft)] p-3 text-sm text-[var(--accent)]">
          {notice}
        </p>
      )}

      {showCreate && (
        <form onSubmit={createAdmin} className="mt-5 grid gap-4 rounded-xl border border-[var(--depth-4)] bg-[var(--depth-1)] p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="a-email" className="hud text-xs">Correo *</label>
            <input id="a-email" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="a-name" className="hud text-xs">Nombre *</label>
            <input id="a-name" type="text" required maxLength={100} value={newName} onChange={(e) => setNewName(e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="a-role" className="hud text-xs">Rol *</label>
            <select id="a-role" value={newRole} onChange={(e) => setNewRole(e.target.value as Role)} className={inputCls}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="a-pass" className="hud text-xs">Contraseña *</label>
            <input id="a-pass" type="password" required minLength={10} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} />
            <p className="text-xs text-[var(--text-muted)]">Mínimo 10 caracteres (política del backend).</p>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-full bg-[var(--accent)] px-6 py-2 text-sm font-medium text-[var(--depth-0)] disabled:opacity-50"
            >
              {creating ? 'Creando…' : 'Crear'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--depth-4)]">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-[var(--depth-2)]">
            <tr className="text-left">
              <th scope="col" className="hud px-4 py-3 text-[10px]">Nombre</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Correo</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Rol</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Estado</th>
              <th scope="col" className="hud px-4 py-3 text-[10px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--depth-4)]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">Cargando…</td>
              </tr>
            ) : !data || data.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-secondary)]">Sin administradores.</td>
              </tr>
            ) : (
              data.data.map((a) => {
                const isSelf = a.id === user?.id;
                return (
                  <tr key={a.id} className="bg-[var(--depth-1)]">
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      {a.name}
                      {isSelf && <span className="hud ml-2 text-[10px]">(tú)</span>}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{a.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={a.role}
                        disabled={isSelf}
                        aria-label={`Rol de ${a.name}`}
                        onChange={(e) => patch(a, { role: e.target.value }, 'Rol actualizado.')}
                        className="rounded border border-[var(--depth-4)] bg-[var(--depth-2)] px-2 py-1 text-xs disabled:opacity-50"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`hud rounded-full px-2.5 py-0.5 text-[10px] ${
                          a.isActive
                            ? 'bg-[rgba(125,255,179,0.15)] text-[var(--accent)]'
                            : 'bg-[var(--depth-4)] text-[var(--text-muted)]'
                        }`}
                      >
                        {a.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      {a.lockedUntil && new Date(a.lockedUntil) > new Date() && (
                        <span className="hud ml-2 rounded-full bg-[rgba(255,125,139,0.15)] px-2 py-0.5 text-[10px] text-[var(--color-error,#ff7d8b)]">
                          Bloqueado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() =>
                            patch(
                              a,
                              { isActive: !a.isActive },
                              a.isActive ? 'Cuenta desactivada.' : 'Cuenta activada.'
                            )
                          }
                          className="rounded-full border border-[var(--depth-4)] px-2.5 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] disabled:opacity-40"
                        >
                          {a.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => resetPassword(a)}
                          className="rounded-full border border-[var(--depth-4)] px-2.5 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] disabled:opacity-40"
                        >
                          Reset contraseña
                        </button>
                        {a.lockedUntil && new Date(a.lockedUntil) > new Date() && (
                          <button
                            type="button"
                            onClick={() => unlock(a)}
                            className="rounded-full border border-[var(--depth-4)] px-2.5 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]"
                          >
                            Desbloquear
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
