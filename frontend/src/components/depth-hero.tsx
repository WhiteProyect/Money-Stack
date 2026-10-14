'use client';

// 3D Audio Topography & Wireframe Matrix Canvas (Titanium Gray & Chrome)
// Paisaje sonoro tridimensional inspirado en topografía de frecuencias analógicas,
// titanio pulido y reacción interactiva en perspectiva 3D al puntero.

import { useEffect, useRef } from 'react';

export default function DepthHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains('fx-off')) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let step = 0;
    const mouse = { x: 0.5, y: 0.5 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent!.clientWidth;
      height = parent!.clientHeight;
      canvas!.width = Math.max(1, Math.floor(width * dpr));
      canvas!.height = Math.max(1, Math.floor(height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const onPointerMove = (e: PointerEvent) => {
      const rect = parent!.getBoundingClientRect();
      mouse.x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      mouse.y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      // Fondo oscuro carbón con resplandor plateado suave
      const bgGrad = ctx!.createRadialGradient(
        width * 0.5,
        height * 0.45,
        10,
        width * 0.5,
        height * 0.5,
        width * 0.7
      );
      bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      bgGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.02)');
      bgGrad.addColorStop(1, 'rgba(4, 5, 7, 0)');
      ctx!.fillStyle = bgGrad;
      ctx!.fillRect(0, 0, width, height);

      step += 0.02;

      // ── Cuadrícula técnica en gris titanio ──
      ctx!.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx!.lineWidth = 1;
      const gridSize = 48;
      for (let x = 0; x < width; x += gridSize) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
        ctx!.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
        ctx!.stroke();
      }

      // ── Topografía de 8 crestas sonoras en perspectiva 3D (estilo Joy Division / OP-1) ──
      const ridges = 8;
      const baseY = height * 0.72;
      const spacing = 18;

      for (let r = 0; r < ridges; r++) {
        const depthFactor = (r + 1) / ridges; // 0..1
        const yBase = baseY + (r - ridges / 2) * spacing;
        const alpha = 0.08 + depthFactor * 0.35;

        ctx!.beginPath();
        ctx!.moveTo(0, height);

        for (let x = 0; x <= width; x += 6) {
          const normX = x / width;
          // Deformación de campana hacia el centro
          const bell = Math.exp(-Math.pow((normX - 0.5) * 3, 2));
          // Modulación interactiva con el mouse
          const mouseInfluence = Math.sin((normX + mouse.x) * Math.PI) * (1 - mouse.y * 0.5);

          const wave =
            Math.sin(normX * 14 + step * (1.2 + r * 0.2) + r) * 16 * bell * mouseInfluence +
            Math.cos(normX * 8 - step * 0.8 + r * 0.5) * 10 * bell;

          const y = yBase - wave;
          if (x === 0) ctx!.lineTo(x, y);
          else ctx!.lineTo(x, y);
        }

        ctx!.lineTo(width, height);
        ctx!.closePath();

        // Relleno oclusión oscura para efecto 3D
        ctx!.fillStyle = '#080a0f';
        ctx!.fill();

        // Línea de cresta metálica
        ctx!.strokeStyle = `rgba(226, 232, 240, ${alpha.toFixed(2)})`;
        ctx!.lineWidth = r === ridges - 1 ? 1.5 : 1;
        ctx!.stroke();
      }

      // ── Haz de escaneo láser plateado ──
      const sweepX = ((step * 90) % (width + 300)) - 150;
      const sweepGrad = ctx!.createLinearGradient(sweepX - 80, 0, sweepX, 0);
      sweepGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      sweepGrad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
      ctx!.fillStyle = sweepGrad;
      ctx!.fillRect(sweepX - 80, 0, 80, height);

      ctx!.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx!.beginPath();
      ctx!.moveTo(sweepX, 0);
      ctx!.lineTo(sweepX, height);
      ctx!.stroke();

      // ── Retícula del puntero con lectura de coordenadas ──
      const tx = mouse.x * width;
      const ty = mouse.y * height;
      ctx!.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(tx, ty, 20, 0, Math.PI * 2);
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.arc(tx, ty, 4, 0, Math.PI * 2);
      ctx!.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx!.fill();

      raf = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      aria-hidden="true"
    />
  );
}
