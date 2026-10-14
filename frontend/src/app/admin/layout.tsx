'use client';

// Layout del panel admin (F5):
// - Interfaz de mando estilo Consola de Estudio & Sonido Subterráneo.
// - Superficies de carbono, bordes de titanio pulido, indicadores LED y telemetría en tiempo real.
// - Soporte responsive con menú lateral deslizable en móviles.
// - Filtrado de navegación por rol estricto (SUPER_ADMIN, ADMIN, EDITOR).

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/lib/session';
import { logout } from '@/lib/api';
import type { Role } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  badge?: string;
  roles?: Role[]; // undefined = todos los roles
  icon: (props: { className?: string }) => React.ReactElement;
}

// Iconografía SVG ligera y táctica
function IconDashboard({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconBookings({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconArtists({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

function IconEvents({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}

function IconAdmins({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconAccount({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: IconDashboard },
  { href: '/admin/bookings', label: 'Bookings', roles: ['SUPER_ADMIN', 'ADMIN'], icon: IconBookings },
  { href: '/admin/artistas', label: 'Artistas', icon: IconArtists },
  { href: '/admin/eventos', label: 'Eventos', icon: IconEvents },
  { href: '/admin/administradores', label: 'Administradores', roles: ['SUPER_ADMIN'], icon: IconAdmins },
  { href: '/admin/mi-cuenta', label: 'Mi cuenta', icon: IconAccount },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const isLogin = pathname === '/admin/login';

  // Reloj digital de cabecera (Hora de Colombia UTC-5)
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-CO', {
          timeZone: 'America/Bogota',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isLogin) return;
    if (status === 'guest') router.replace('/admin/login');
  }, [status, isLogin, router]);

  // Cierra menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isLogin) return <>{children}</>;

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#040507]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-full bg-white/20" />
            <span className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#cbd5e1]" role="status">
            AUTORIZANDO CONSOLA DE ESTUDIO…
          </p>
        </div>
      </main>
    );
  }

  if (status === 'guest' || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#040507]">
        <p className="font-mono text-xs uppercase tracking-widest text-[#94a3b8]">
          REDIRECCIONANDO A TERMINAL DE ACCESO…
        </p>
      </main>
    );
  }

  const visibleNav = NAV.filter((item) => !item.roles || item.roles.includes(user.role));

  async function onLogout() {
    await logout();
    router.replace('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-[#040507] text-[#f8fafc] selection:bg-white selection:text-[#040507]">
      {/* ── Overlay móvil ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Barra Lateral Táctica (Sidebar) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#202736] bg-[#07090e] transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Cabecera del Sidebar: Logo y Consola */}
        <div className="border-b border-[#202736] p-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-[#121620] shadow-[0_0_12px_rgba(255,255,255,0.15)] transition-transform group-hover:scale-105">
                <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              </span>
              <div>
                <span className="block font-mono text-xs font-black uppercase tracking-wider text-white">
                  MONEY-STACK
                </span>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-[#94a3b8]">
                  STUDIO OS // V2.6
                </span>
              </div>
            </Link>

            {/* Botón cerrar en móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1 text-[#94a3b8] hover:bg-[#121620] hover:text-white lg:hidden"
              aria-label="Cerrar menú"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Telemetría del Sistema */}
          <div className="mt-3.5 flex items-center justify-between rounded-lg border border-[#202736] bg-[#0c0f17] px-2.5 py-1.5 font-mono text-[10px]">
            <span className="flex items-center gap-1.5 text-[#94a3b8]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
              API ONLINE
            </span>
            <span className="font-semibold text-white/80">PORT 4000</span>
          </div>
        </div>

        {/* Navegación Principal */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 font-mono text-[10px] uppercase tracking-widest text-[#64748b]">
            // MÓDULOS DEL SISTEMA
          </p>
          <nav aria-label="Navegación del panel" className="mt-2 space-y-1">
            {visibleNav.map((item) => {
              const active =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-all ${
                    active
                      ? 'border border-white/20 bg-gradient-to-r from-white/10 to-white/5 font-bold text-white shadow-[0_0_15px_rgba(255,255,255,0.06)]'
                      : 'border border-transparent text-[#94a3b8] hover:border-[#202736] hover:bg-[#0e121a] hover:text-white'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      active ? 'text-white' : 'text-[#64748b] group-hover:text-white'
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Accesos Rápidos Callejeros */}
          <div className="mt-6 border-t border-[#202736] pt-4">
            <p className="px-3 font-mono text-[10px] uppercase tracking-widest text-[#64748b]">
              // VÍNCULOS EXTERNOS
            </p>
            <div className="mt-2 space-y-1">
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl px-3 py-2 font-mono text-xs text-[#94a3b8] transition-colors hover:bg-[#0e121a] hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-[#64748b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Sitio Público
                </span>
                <span className="font-mono text-[10px] text-[#64748b]">↗</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Panel Inferior de Usuario & Desconexión */}
        <div className="border-t border-[#202736] bg-[#05070b] p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-[#121620] font-mono text-xs font-bold text-white shadow-inner">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="rounded border border-white/20 bg-white/10 px-1.5 py-0.2 font-mono text-[9px] font-bold tracking-wider text-white">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#202736] bg-[#0a0d14] py-2 font-mono text-xs uppercase tracking-wider text-[#94a3b8] transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Contenedor de Área de Trabajo Central ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabecera Superior Táctica (Top Bar) */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#202736] bg-[#07090e]/90 px-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg border border-[#202736] bg-[#0c0f17] p-2 text-[#94a3b8] hover:text-white lg:hidden"
              aria-label="Abrir menú"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="hidden sm:block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#64748b]">
                CAUCASIA · ANTIOQUIA · ESTUDIO CENTRAL
              </span>
            </div>
          </div>

          {/* Reloj en Vivo y Atajos Superiores */}
          <div className="flex items-center gap-4">
            {currentTime && (
              <div className="flex items-center gap-2 rounded-lg border border-[#202736] bg-[#0c0f17] px-3 py-1 font-mono text-xs text-white">
                <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-ping" />
                <span className="font-semibold">{currentTime}</span>
                <span className="text-[10px] text-[#64748b]">COT</span>
              </div>
            )}

            <Link
              href="/admin/artistas/nuevo"
              className="hidden items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black md:inline-flex"
            >
              <span>+ Artista</span>
            </Link>

            <Link
              href="/admin/eventos/nuevo"
              className="hidden items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black md:inline-flex"
            >
              <span>+ Evento</span>
            </Link>
          </div>
        </header>

        {/* Contenido Dinámico de la Página */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

