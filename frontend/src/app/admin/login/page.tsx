'use client';

// Login del panel admin — Rediseño total: Super moderno, Dark y Estilo Callejero Underground.
// - Acceso exclusivo para el sello discográfico (Caucasia, Antioquia).
// - Plataforma de sonido: Tornamesa interactiva (33/45 RPM), ecualizador VU reactivo,
//   cinta de advertencia/marquee callejero, reloj digital en vivo y terminal táctica.

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, ApiError, describeApiError } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rpmSpeed, setRpmSpeed] = useState<'33' | '45'>('33');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Reloj digital en vivo (Hora de Colombia UTC-5)
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-CO', {
        timeZone: 'America/Bogota',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(timeStr);
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/admin');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401 || err.code === 'INVALID_CREDENTIALS'
            ? 'Credenciales no autorizadas. Verifica el email y la contraseña.'
            : err.code === 'ACCOUNT_LOCKED'
              ? 'Terminal bloqueada por múltiples intentos. Contacta al super admin.'
              : describeApiError(err, 'No se pudo autorizar el acceso al sistema.')
        );
      } else {
        setError('Error de enlace con la base de datos central. Intenta nuevamente.');
      }
      setSubmitting(false);
    }
  }

  // Generador de 20 barras reactivas de ecualizador
  const eqBars = [
    { delay: '0ms', duration: '0.8s', h: '60%' },
    { delay: '120ms', duration: '1.1s', h: '85%' },
    { delay: '240ms', duration: '0.7s', h: '45%' },
    { delay: '80ms', duration: '1.3s', h: '95%' },
    { delay: '300ms', duration: '0.9s', h: '70%' },
    { delay: '180ms', duration: '1.0s', h: '80%' },
    { delay: '350ms', duration: '0.75s', h: '50%' },
    { delay: '50ms', duration: '1.2s', h: '90%' },
    { delay: '220ms', duration: '0.85s', h: '65%' },
    { delay: '400ms', duration: '1.05s', h: '75%' },
    { delay: '150ms', duration: '0.95s', h: '88%' },
    { delay: '280ms', duration: '1.15s', h: '60%' },
    { delay: '90ms', duration: '0.8s', h: '92%' },
    { delay: '320ms', duration: '1.25s', h: '78%' },
    { delay: '170ms', duration: '0.7s', h: '55%' },
    { delay: '250ms', duration: '1.0s', h: '84%' },
    { delay: '60ms', duration: '0.9s', h: '96%' },
    { delay: '380ms', duration: '1.2s', h: '68%' },
    { delay: '140ms', duration: '0.85s', h: '74%' },
    { delay: '210ms', duration: '1.1s', h: '82%' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#05060a] text-[var(--text-primary)] selection:bg-[var(--accent)] selection:text-[#05060a]">
      {/* ── 1. Fondo ambiental: Matriz de puntos, luces de neón y textura analógica ── */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(125, 255, 179, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Resplandores ambientales de neón */}
      <div
        className="pointer-events-none fixed -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[rgba(125,255,179,0.08)] blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[rgba(125,255,179,0.06)] blur-[140px]"
        aria-hidden="true"
      />

      {/* ── 2. Ticker Marquee Callejero (Cinta infinita superior) ── */}
      <div
        className="relative z-20 overflow-hidden border-b border-[var(--depth-4)] bg-[#080a12]/90 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)] backdrop-blur-md"
        aria-hidden="true"
      >
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
          <span>⚡ MONEY-STACK UNDERGROUND SOUNDSYSTEM</span>
          <span className="text-[var(--text-muted)]">///</span>
          <span>CAUCASIA · ANTIOQUIA · 07°59&apos;N 75°12&apos;W</span>
          <span className="text-[var(--text-muted)]">///</span>
          <span>ESTUDIO CENTRAL & CONTROL DE BOOKINGS</span>
          <span className="text-[var(--text-muted)]">///</span>
          <span>BAJO CAUCA URBAN SOUND 2026</span>
          <span className="text-[var(--text-muted)]">///</span>
          <span>ACCESO RESTRINGIDO A CREW Y PRODUCTORES</span>
          <span className="text-[var(--text-muted)]">///</span>
          <span>⚡ MONEY-STACK UNDERGROUND SOUNDSYSTEM</span>
          <span className="text-[var(--text-muted)]">///</span>
          <span>CAUCASIA · ANTIOQUIA · 07°59&apos;N 75°12&apos;W</span>
          <span className="text-[var(--text-muted)]">///</span>
          <span>ESTUDIO CENTRAL & CONTROL DE BOOKINGS</span>
          <span className="text-[var(--text-muted)]">///</span>
          <span>BAJO CAUCA URBAN SOUND 2026</span>
        </div>
      </div>

      {/* ── 3. Contenedor Maestro: Split Layout Street / Soundsystem ── */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-35px)] max-w-7xl flex-col items-center justify-center px-4 py-8 lg:flex-row lg:gap-12 lg:px-8">
        {/* ── Columna Izquierda: Identidad Callejera, Vinilo 3D y Ecualizador VU ── */}
        <section className="flex w-full flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left">
          {/* Badge callejero de peligro / aviso técnico */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-3.5 py-1 font-mono text-xs uppercase tracking-wider text-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-ping" />
            <span className="font-bold">UNDERGROUND VAULT // 2026</span>
          </div>

          {/* Título de impacto callejero / brutalista */}
          <h1 className="font-mono text-4xl font-black uppercase tracking-tight text-white sm:text-6xl lg:text-7xl">
            MONEY<span className="text-[var(--accent)] animate-neon">-STACK</span>
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)] sm:text-sm">
            SOUNDSYSTEM & RECORD LABEL // CAUCASIA
          </p>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            Cultivando el sonido del Bajo Cauca. Consola central de gestión de catálogo,
            producción musical, contratos de bookings y eventos en vivo.
          </p>

          {/* Tornamesa / Vinilo Interactivo Giratorio */}
          <div className="relative mt-8 flex flex-col items-center rounded-2xl border border-[var(--depth-4)] bg-[rgba(11,13,20,0.85)] p-6 shadow-2xl backdrop-blur-xl sm:flex-row sm:gap-6">
            <div className="relative flex items-center justify-center">
              {/* Plato de tornamesa base */}
              <div className="h-44 w-44 rounded-full bg-[#11131b] p-1.5 shadow-[inset_0_0_20px_rgba(0,0,0,0.9),0_0_30px_rgba(0,0,0,0.8)] border border-[var(--depth-4)]">
                {/* Disco de vinilo que rota */}
                <div
                  className={`relative flex h-full w-full items-center justify-center rounded-full bg-[#08090d] shadow-inner transition-all ${
                    rpmSpeed === '45' ? 'animate-spin-fast' : 'animate-spin-slow'
                  }`}
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, transparent 28%, rgba(255,255,255,0.04) 30%, transparent 32%, rgba(255,255,255,0.03) 45%, transparent 48%, rgba(255,255,255,0.03) 60%, transparent 63%, rgba(255,255,255,0.05) 75%, transparent 78%)',
                  }}
                >
                  {/* Etiqueta central del vinilo */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-[#05060a] p-1 text-center shadow-[0_0_12px_var(--accent-glow)]">
                    <span className="font-mono text-[8px] font-black uppercase tracking-tighter text-[var(--accent)] leading-tight">
                      MS·REC
                      <br />
                      CAUCASIA
                    </span>
                  </div>
                  {/* Orificio central */}
                  <div className="absolute h-2 w-2 rounded-full bg-[#1a1e2b] shadow-inner" />
                </div>
              </div>

              {/* Brazo de tornamesa decorativo (Tonearm) */}
              <div
                className="pointer-events-none absolute -top-1 -right-1 h-20 w-8"
                aria-hidden="true"
              >
                <div className="h-16 w-1.5 rotate-[-25deg] rounded-full bg-gradient-to-b from-[#7dffb3] to-[#272c40] shadow-[0_0_8px_rgba(125,255,179,0.5)] origin-top" />
              </div>
            </div>

            {/* Controles de la tornamesa y selector RPM */}
            <div className="mt-4 flex flex-col items-center sm:mt-0 sm:items-start">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                CONTROL DE PLATO // TURNTABLE
              </span>
              <span className="font-mono text-sm font-bold text-[var(--accent)]">
                MASTER AUDIO DECK
              </span>
              <p className="mt-1 font-mono text-xs text-[var(--text-secondary)]">
                Velocidad de reproducción:
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRpmSpeed('33')}
                  className={`rounded-lg px-3 py-1 font-mono text-xs font-bold transition-all ${
                    rpmSpeed === '33'
                      ? 'bg-[var(--accent)] text-[#05060a] shadow-[0_0_12px_var(--accent-glow)]'
                      : 'border border-[var(--depth-4)] bg-[var(--depth-2)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                  }`}
                >
                  33 ⅓ RPM
                </button>
                <button
                  type="button"
                  onClick={() => setRpmSpeed('45')}
                  className={`rounded-lg px-3 py-1 font-mono text-xs font-bold transition-all ${
                    rpmSpeed === '45'
                      ? 'bg-[var(--accent)] text-[#05060a] shadow-[0_0_12px_var(--accent-glow)]'
                      : 'border border-[var(--depth-4)] bg-[var(--depth-2)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                  }`}
                >
                  45 RPM ⚡
                </button>
              </div>
            </div>
          </div>

          {/* Ecualizador Reactivo de 20 bandas (VU Meter) */}
          <div className="mt-8 w-full max-w-lg rounded-xl border border-[var(--depth-4)] bg-[rgba(11,13,20,0.85)] p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              <span>SPECTRUM ANALYZER // REALTIME VU</span>
              <span className="text-[var(--accent)] font-bold">24-BIT / 96kHz</span>
            </div>
            <div
              className="mt-3 flex h-12 items-end justify-between gap-1 rounded bg-[#07080d] p-2 border border-[var(--depth-4)] shadow-inner"
              aria-hidden="true"
            >
              {eqBars.map((bar, idx) => (
                <div
                  key={idx}
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    backgroundColor:
                      idx > 16
                        ? '#ff7d8b'
                        : idx > 12
                          ? '#ffcf7d'
                          : '#7dffb3',
                    animation: `vu-bounce ${bar.duration} infinite ease-in-out`,
                    animationDelay: bar.delay,
                    boxShadow: '0 0 6px currentColor',
                  }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[9px] text-[var(--text-muted)]" aria-hidden="true">
              <span>-30dB</span>
              <span>-18dB</span>
              <span>-12dB</span>
              <span>-6dB</span>
              <span>0dB</span>
              <span className="text-[#ff7d8b] font-bold">PEAK</span>
            </div>
          </div>
        </section>

        {/* ── Columna Derecha: Terminal Táctica de Acceso (Chassis Callejero) ── */}
        <section className="mt-10 w-full lg:mt-0 lg:w-1/2 lg:max-w-md">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--depth-4)] bg-[rgba(9,11,18,0.95)] p-6 shadow-[0_0_70px_rgba(0,0,0,0.95),0_0_35px_rgba(125,255,179,0.06)] backdrop-blur-2xl sm:p-8">
            {/* Haz de escáner láser que desciende periódicamente */}
            <div
              className="animate-scanbeam pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-70"
              aria-hidden="true"
            />

            {/* Corchetes esquineros de visor táctico (┌ ┐ └ ┘) */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-1 -left-1 h-4 w-4 border-t-2 border-l-2 border-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-1 -right-1 h-4 w-4 border-t-2 border-r-2 border-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]"
            />

            {/* Cabecera del Chasis: HUD Telemetría y Reloj en tiempo real */}
            <div className="border-b border-[var(--depth-4)] pb-5">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)] animate-pulse" />
                  <span className="font-bold text-[var(--accent)]">AUTH_TERMINAL_01</span>
                </div>
                {currentTime && (
                  <span className="font-mono text-xs font-semibold text-[var(--accent)]">
                    {currentTime} COT
                  </span>
                )}
              </div>

              <div className="mt-3">
                <p className="hud hud-accent text-xs">Acceso seguro // RBAC</p>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white font-mono sm:text-3xl">
                  INICIAR SESIÓN
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Introduce tus credenciales autorizadas para gestionar el sello.
                </p>
              </div>

              {/* Botón rápido para demo / pruebas */}
              <div className="mt-3 flex items-center gap-2">
                <span className="font-mono text-[10px] text-[var(--text-muted)]">ACCESO RÁPIDO:</span>
                <button
                  type="button"
                  onClick={() => setEmail('admin@moneystack.co')}
                  className="rounded-full border border-[var(--depth-4)] bg-[var(--depth-2)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--accent)] transition-colors hover:border-[var(--accent)]"
                >
                  admin@moneystack.co
                </button>
              </div>
            </div>

            {/* Formulario de Autenticación */}
            <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
              {error && (
                <div
                  role="alert"
                  className="relative overflow-hidden rounded-xl border border-[var(--color-error,#ff7d8b)] bg-[rgba(255,125,139,0.12)] p-3.5 text-xs text-[var(--text-primary)] shadow-lg"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-base text-[var(--color-error,#ff7d8b)]" aria-hidden="true">
                      ⚠
                    </span>
                    <div>
                      <strong className="block font-mono uppercase text-[var(--color-error,#ff7d8b)]">
                        Fallo de autenticación
                      </strong>
                      <span className="mt-0.5 block text-[var(--text-secondary)] leading-relaxed">
                        {error}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Canal 01: Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  <span>// CH-01 · Identificador / Email</span>
                  <span className="text-[10px] text-[var(--accent)]">REQUERIDO</span>
                </label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--accent)]/70"
                    aria-hidden="true"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    enterKeyHint="next"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@moneystack.co"
                    className="w-full rounded-xl border border-[var(--depth-4)] bg-[#040508] py-2.5 pr-4 pl-10 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 transition-all focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 shadow-inner"
                  />
                </div>
              </div>

              {/* Canal 02: Contraseña */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  <span>// CH-02 · Clave maestra / Password</span>
                  <span className="text-[10px] text-[var(--text-muted)]">HMAC SHA-256</span>
                </label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--accent)]/70"
                    aria-hidden="true"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    enterKeyHint="done"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[var(--depth-4)] bg-[#040508] py-2.5 pr-11 pl-10 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 transition-all focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-muted)] transition-colors hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Botón de Acción de Alta Tensión */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--accent)] px-5 py-3.5 font-mono text-sm font-black uppercase tracking-wider text-[#05060a] shadow-[0_0_25px_var(--accent-glow)] transition-all hover:scale-[1.02] hover:shadow-[0_0_35px_var(--accent-glow)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {/* Destello de luz animado al hover */}
                  <span
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                    aria-hidden="true"
                  />

                  {submitting ? (
                    <>
                      <span className="inline-block h-4 w-4 rounded-full border-2 border-[#05060a] border-t-transparent animate-spin" />
                      <span>AUTORIZANDO CREDENCIALES…</span>
                    </>
                  ) : (
                    <>
                      <span>AUTORIZAR ACCESO AL SISTEMA</span>
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-1.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Enlace para volver al sitio público */}
            <div className="mt-6 border-t border-[var(--depth-4)] pt-4 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span>Salir a la calle · Portal público</span>
              </Link>
            </div>
          </div>

          {/* Aviso legal inferior */}
          <div className="mt-4 flex items-center justify-between px-2 font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] opacity-60">
            <span>LEY 1581 DE 2012 · COLOMBIA</span>
            <span>PROTEGIDO CONTRA FUERZA BRUTA</span>
          </div>
        </section>
      </main>
    </div>
  );
}
