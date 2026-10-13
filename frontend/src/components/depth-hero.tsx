'use client';

// Efecto firma F3: "depth map" en canvas 2D, cargado de forma diferida.
//
// Reglas del proyecto:
// - prefers-reduced-motion: sin parallax ni animación (dibujo estático único).
// - Efecto desactivable: si <html> tiene .fx-off no se crea el canvas.
// - Sin dependencias: el brillo codifica la cercanía (capas cercanas más
//   claras y nítidas, lejanas más oscuras y desenfocadas) con niebla entre
//   capas; el puntero produce un parallax suave.

import { useEffect, useRef } from 'react';

interface Layer {
  // Puntos normalizados (0..1) de la silueta de la capa.
  points: { x: number; y: number }[];
  // 0 = lejana, 1 = cercana.
  depth: number;
}

// Genera una silueta de montaña con valores de ruido deterministas.
function buildLayer(seed: number, baseY: number, roughness: number): Layer {
  const points: { x: number; y: number }[] = [];
  const N = 24;
  let value = seed;
  const rand = () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
  let y = baseY;
  for (let i = 0; i <= N; i += 1) {
    y += (rand() - 0.5) * roughness;
    y = Math.min(0.95, Math.max(0.15, y));
    points.push({ x: i / N, y });
  }
  return { points, depth: 0 };
}

export default function DepthHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;

    // Efectos desactivables + reduced-motion: nada que animar.
    if (root.classList.contains('fx-off')) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    const el = canvasRef.current;
    if (!el) return;
    const host = el.parentElement;
    if (!host) return;
    const context = el.getContext('2d');
    if (!context) return;
    const canvas = el;
    const parent = host;
    const ctx = context;

    // Capas: de lejana (fondo, oscura y borrosa) a cercana (frente, clara).
    const layers: Layer[] = [
      { ...buildLayer(7, 0.42, 0.1), depth: 0.15 },
      { ...buildLayer(23, 0.52, 0.14), depth: 0.35 },
      { ...buildLayer(91, 0.62, 0.18), depth: 0.55 },
      { ...buildLayer(53, 0.74, 0.22), depth: 0.78 },
      { ...buildLayer(17, 0.86, 0.26), depth: 1.0 },
    ];

    let width = 0;
    let height = 0;
    let raf = 0;
    let t = 0;

    // Parallax objetivo (suavizado hacia el puntero).
    const pointer = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Niebla de fondo.
      const fog = ctx.createLinearGradient(0, 0, 0, height);
      fog.addColorStop(0, 'rgba(11, 13, 20, 0)');
      fog.addColorStop(1, 'rgba(5, 6, 10, 0.85)');
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, width, height);

      for (const layer of layers) {
        // Amplitud del parallax proporcional a la cercanía.
        const px = current.x * 26 * layer.depth;
        const py = current.y * 14 * layer.depth;
        // Onda lenta: solo las capas lejanas respiran menos.
        const wave = Math.sin(t * 0.0006 + layer.depth * 4) * 3 * (1 - layer.depth);

        ctx.beginPath();
        ctx.moveTo(-40, height + 40);
        for (const p of layer.points) {
          ctx.lineTo(p.x * width + px, p.y * height + py + wave);
        }
        ctx.lineTo(width + 40, height + 40);
        ctx.closePath();

        // Brillo codifica cercanía: lo cercano más claro.
        const l = 8 + layer.depth * 12;
        const alpha = 0.55 + layer.depth * 0.35;
        ctx.fillStyle = `hsla(228, 22%, ${l}%, ${alpha})`;

        // Lejana desenfocada, cercana nítida.
        ctx.filter = layer.depth < 0.5 ? `blur(${(0.5 - layer.depth) * 6}px)` : 'none';
        ctx.fill();
        ctx.filter = 'none';

        // Borde fosforescente sutil en la capa más cercana.
        if (layer.depth >= 0.9) {
          ctx.strokeStyle = 'rgba(125, 255, 179, 0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    function frame(now: number) {
      t = now;
      // Interpolación suave hacia el puntero (inercia).
      current.x += (pointer.x - current.x) * 0.06;
      current.y += (pointer.y - current.y) * 0.06;
      draw();
      raf = requestAnimationFrame(frame);
    }

    function onPointer(e: PointerEvent) {
      const rect = parent.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    resize();
    draw();
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(parent);
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  // aria-hidden: es puramente decorativo.
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
