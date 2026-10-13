'use client';

// Layout del panel admin (F5):
// - Guard: estado 'loading' muestra un placeholder; 'guest' redirige a login.
// - El panel usa los mismos tokens pero SIN efectos (usabilidad primero).
// - La navegación se filtra por rol: administradores solo para SUPER_ADMIN.

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/lib/session';
import { logout } from '@/lib/api';
import type { Role } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  roles?: Role[]; // undefined = todos los roles
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/bookings', label: 'Bookings', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/artistas', label: 'Artistas' },
  { href: '/admin/eventos', label: 'Eventos' },
  { href: '/admin/administradores', label: 'Administradores', roles: ['SUPER_ADMIN'] },
  { href: '/admin/mi-cuenta', label: 'Mi cuenta' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (isLogin) return;
    if (status === 'guest') router.replace('/admin/login');
  }, [status, isLogin, router]);

  if (isLogin) return <>{children}</>;

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--depth-0)]">
        <p className="hud hud-accent text-sm" role="status">
          Verificando sesión…
        </p>
      </main>
    );
  }

  if (status === 'guest' || !user) {
    // Mientras la redirección se aplica.
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--depth-0)]">
        <p className="hud text-sm">Redirigiendo al login…</p>
      </main>
    );
  }

  const visibleNav = NAV.filter((item) => !item.roles || item.roles.includes(user.role));

  async function onLogout() {
    await logout();
    router.replace('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-[var(--depth-0)] text-[var(--text-primary)]">
      <aside className="flex w-60 shrink-0 flex-col border-r border-[var(--depth-4)] bg-[var(--depth-1)] p-4">
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--accent)]"
          />
          <span className="font-[family-name:var(--font-display)] text-xs uppercase tracking-widest">
            Money-Stack
          </span>
        </Link>

        <p className="hud mt-6 px-2 text-[10px]">Panel</p>
        <nav aria-label="Navegación del panel" className="mt-2 flex-1">
          <ul className="space-y-1">
            {visibleNav.map((item) => {
              const active =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={
                      active
                        ? 'block rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--accent)]'
                        : 'block rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--depth-2)] hover:text-[var(--text-primary)]'
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[var(--depth-4)] pt-3">
          <p className="truncate px-2 text-sm text-[var(--text-primary)]">{user.name}</p>
          <p className="hud truncate px-2 text-[10px]">{user.role}</p>
          <div className="mt-2 flex flex-col gap-1 px-2">
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg px-2 py-1.5 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--depth-2)] hover:text-[var(--color-error,#ff7d8b)]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
