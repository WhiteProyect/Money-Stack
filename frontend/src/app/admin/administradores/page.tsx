'use client';

// Gestión de administradores (SOLO SUPER_ADMIN): lista, alta, edición de
// rol/estado, reset de contraseña y desbloqueo. Nada se borra: se desactiva.

import { useCallback, useEffect, useState } from 'react';
import { apiGetList, apiPost, apiPatch, describeApiError } from '@/lib/api';
import { useSession } from '@/lib/session';
import type { Paginated, Role } from '@/lib/types';

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
};

const ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];

const inputCls =
  'w-full rounded-xl border border-[#202736] bg-[#05070c] px-3.5 py-2 font-mono text-xs text-white placeholder:text-[#64748b] focus:border-white focus:outline-none';

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
      setError(describeApiError(err, 'No se pudieron cargar los administradores.'));
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
      setError(describeApiError(err, 'No se pudo crear el administrador.'));
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
      setError(describeApiError(err, 'No se pudo actualizar.'));
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
      setError(describeApiError(err, 'No se pudo restablecer la contraseña.'));
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
      setError(describeApiError(err, 'No se pudo desbloquear.'));
    }
  }

  if (!isSuper) {
    return (
      <div className="rounded-2xl border border-[#202736] bg-[#0c0f17] p-8 text-center font-mono">
        <span className="text-xl text-amber-400">⚠</span>
        <h2 className="mt-2 text-base font-bold text-white uppercase">Acceso Restringido</h2>
        <p className="mt-1 text-xs text-[#94a3b8]">
          Esta sección es de control exclusivo para el rol SUPER_ADMIN.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Cabecera ── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="uppercase tracking-widest">NIVEL REQUERIDO: SUPER_ADMIN</span>
          </div>
          <h1 className="mt-1 font-mono text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            GESTIÓN DE EQUIPO
          </h1>
          <p className="mt-1 text-xs text-[#94a3b8]">
            Administradores autorizados, niveles de acceso RBAC y restablecimiento de credenciales.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate((s) => !s)}
          className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black"
        >
          <span>{showCreate ? 'Cerrar Formulario' : '+ Nuevo Administrador'}</span>
        </button>
      </div>

      {/* ── Avisos de Error y Éxito ── */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 font-mono text-xs text-red-200"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 font-mono text-xs text-emerald-300"
        >
          ✓ {notice}
        </div>
      )}

      {/* ── Formulario de Alta ── */}
      {showCreate && (
        <form
          onSubmit={createAdmin}
          className="rounded-2xl border border-[#202736] bg-[#090b12] p-6 shadow-xl"
        >
          <div className="border-b border-[#202736] pb-3 mb-5">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              // REGISTRAR NUEVO MIEMBRO DEL EQUIPO
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="a-email" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
                // CORREO ELECTRÓNICO *
              </label>
              <input
                id="a-email"
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="operador@moneystack.co"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="a-name" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
                // NOMBRE COMPLETO *
              </label>
              <input
                id="a-name"
                type="text"
                required
                maxLength={100}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre o alias"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="a-role" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
                // ROL ASIGNADO *
              </label>
              <select
                id="a-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className={inputCls}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="a-pass" className="block font-mono text-[10px] uppercase tracking-wider text-[#94a3b8] mb-1">
                // CONTRASEÑA PROVISIONAL *
              </label>
              <input
                id="a-pass"
                type="password"
                required
                minLength={12}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 12 caracteres (Aa1)"
                className={inputCls}
              />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-[#202736]">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-xl px-4 py-2 font-mono text-xs text-[#94a3b8] hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-black disabled:opacity-40"
            >
              {creating ? 'Registrando…' : 'Crear Administrador'}
            </button>
          </div>
        </form>
      )}

      {/* ── Tabla de Administradores ── */}
      <div className="overflow-hidden rounded-2xl border border-[#202736] bg-[#080a10] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b border-[#202736] bg-[#0c0f17]">
              <tr className="font-mono text-[10px] uppercase tracking-wider text-[#94a3b8]">
                <th scope="col" className="px-5 py-3.5">Operador / Nombre</th>
                <th scope="col" className="px-5 py-3.5">Correo</th>
                <th scope="col" className="px-5 py-3.5">Nivel de Rol</th>
                <th scope="col" className="px-5 py-3.5">Estado de Cuenta</th>
                <th scope="col" className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202736]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center font-mono text-xs text-[#94a3b8]">
                    Sincronizando operadores…
                  </td>
                </tr>
              ) : !data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center font-mono text-xs text-[#94a3b8]">
                    Sin administradores registrados.
                  </td>
                </tr>
              ) : (
                data.data.map((a) => {
                  const isSelf = a.id === user?.id;
                  return (
                    <tr key={a.id} className="transition-colors hover:bg-[#0e121a]">
                      <td className="px-5 py-3.5 font-mono text-sm font-bold text-white">
                        {a.name}
                        {isSelf && (
                          <span className="ml-2 rounded-md border border-white/20 bg-white/10 px-1.5 py-0.2 text-[9px] text-white">
                            TÚ
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[#cbd5e1]">{a.email}</td>
                      <td className="px-5 py-3.5">
                        <select
                          value={a.role}
                          disabled={isSelf}
                          aria-label={`Rol de ${a.name}`}
                          onChange={(e) => patch(a, { role: e.target.value }, 'Rol actualizado.')}
                          className="rounded-lg border border-[#202736] bg-[#0c0f17] px-2 py-1 font-mono text-xs text-white focus:border-white focus:outline-none disabled:opacity-50"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABEL[r]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            a.isActive
                              ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : 'border border-[#202736] bg-[#121620] text-[#94a3b8]'
                          }`}
                        >
                          {a.isActive ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                        {a.lockedUntil && new Date(a.lockedUntil) > new Date() && (
                          <span className="ml-2 inline-block rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
                            BLOQUEADO
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5 font-mono text-xs">
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
                            className="rounded-lg border border-[#202736] bg-[#121620] px-2.5 py-1 text-[11px] text-[#cbd5e1] transition-colors hover:border-white hover:text-white disabled:opacity-30"
                          >
                            {a.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => resetPassword(a)}
                            className="rounded-lg border border-[#202736] bg-[#121620] px-2.5 py-1 text-[11px] text-[#cbd5e1] transition-colors hover:border-white hover:text-white disabled:opacity-30"
                          >
                            Reset Clave
                          </button>
                          {a.lockedUntil && new Date(a.lockedUntil) > new Date() && (
                            <button
                              type="button"
                              onClick={() => unlock(a)}
                              className="rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-400 hover:bg-red-500/20"
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
    </div>
  );
}
