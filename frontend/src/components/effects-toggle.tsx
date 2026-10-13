'use client';

// Interruptor de efectos (grano, scanlines, viñeta, parallax, night vision).
// - Estado en localStorage ('ms:fx') y en <html class="fx-off">.
// - Arranca desactivado si el sistema pide prefers-reduced-motion (salvo que
//   el usuario lo active explícitamente).
// - Los componentes de efectos (DepthHero, overlays) leen .fx-off antes de
//   montarse y se quedan estáticos si está apagado.

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ms:fx';

function isReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// Aplica el estado al <html> antes del hidratare (evita parpadeo).
export function applyFxFromStorage() {
  if (typeof document === 'undefined') return;
  const stored = localStorage.getItem(STORAGE_KEY);
  const enabled = stored === '1' || (stored === null && !isReducedMotion());
  document.documentElement.classList.toggle('fx-off', !enabled);
}

export default function EffectsToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    applyFxFromStorage();
    setEnabled(!document.documentElement.classList.contains('fx-off'));
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    document.documentElement.classList.toggle('fx-off', !next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled === true}
      title={
        enabled
          ? 'Desactivar efectos visuales'
          : 'Activar efectos visuales (grano, escaneo, parallax)'
      }
      className="hud rounded-full border border-[var(--depth-4)] px-3 py-1 text-[10px] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      {enabled === null ? 'Efectos' : enabled ? '◉ FX' : '○ FX'}
    </button>
  );
}
