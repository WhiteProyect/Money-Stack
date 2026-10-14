'use client';

// Night Vision & Tactical Street Oscilloscope Canvas
// Simula un osciloscopio táctico militar de visión nocturna con ondas de fósforo verde,
// barrido de radar y retícula que reacciona al puntero del usuario.

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

      // Fondo oscuro asfalto con leve brillo de fósforo en el centro
      const bgGrad = ctx!.createRadialGradient(
        width * 0.5,
        height * 0.5,
        20,
        width * 0.5,
        height * 0.5,
        width * 0.7
      );
      bgGrad.addColorStop(0, 'rgba(0, 255, 135, 0.08)');
      bgGrad.addColorStop(0.6, 'rgba(0, 229, 255, 0.02)');
      bgGrad.addColorStop(1, 'rgba(4, 5, 7, 0)');
      ctx!.fillStyle = bgGrad;
      ctx!.fillRect(0, 0, width, height);

      step += 0.025;

      // ── Cuadrícula táctica militar verde ──
      ctx!.strokeStyle = 'rgba(0, 255, 135, 0.06)';
      ctx!.lineWidth = 1;
      const gridSize = 40;
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

      // ── Línea de barrido de radar verde fósforo ──
      const sweepX = ((step * 120) % (width + 200)) - 100;
      const sweepGrad = ctx!.createLinearGradient(sweepX - 80, 0, sweepX, 0);
      sweepGrad.addColorStop(0, 'rgba(0, 255, 135, 0)');
      sweepGrad.addColorStop(1, 'rgba(0, 255, 135, 0.12)');
      ctx!.fillStyle = sweepGrad;
      ctx!.fillRect(sweepX - 80, 0, 80, height);

      ctx!.strokeStyle = 'rgba(0, 255, 135, 0.35)';
      ctx!.beginPath();
      ctx!.moveTo(sweepX, 0);
      ctx!.lineTo(sweepX, height);
      ctx!.stroke();

      // ── Ondas de osciloscopio sonoro en verde fósforo ──
      const waveConfigs = [
        { color: 'rgba(0, 255, 135, 0.45)', freq: 0.012, amp: 28, speed: 1.2, y: 0.75 },
        { color: 'rgba(0, 255, 135, 0.25)', freq: 0.008, amp: 20, speed: 0.8, y: 0.72 },
        { color: 'rgba(0, 229, 255, 0.20)', freq: 0.015, amp: 16, speed: 1.5, y: 0.78 },
      ];

      for (const w of waveConfigs) {
        ctx!.beginPath();
        ctx!.moveTo(0, height);

        for (let x = 0; x <= width; x += 6) {
          const mFactor = Math.sin((x / width) * Math.PI) * (1 + (1 - mouse.y) * 0.7);
          const y =
            height * w.y +
            Math.sin(x * w.freq + step * w.speed + mouse.x * 2.5) * w.amp * mFactor +
            Math.cos(x * 0.004 + step * 0.6) * (w.amp * 0.3);
          ctx!.lineTo(x, y);
        }

        ctx!.lineTo(width, height);
        ctx!.closePath();

        const grad = ctx!.createLinearGradient(0, height * 0.65, 0, height);
        grad.addColorStop(0, w.color);
        grad.addColorStop(1, 'rgba(4, 5, 7, 0.0)');
        ctx!.fillStyle = grad;
        ctx!.fill();
      }

      // ── Retícula del puntero táctico ──
      const targetX = mouse.x * width;
      const targetY = mouse.y * height;
      ctx!.strokeStyle = 'rgba(0, 255, 135, 0.3)';
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(targetX, targetY, 24, 0, Math.PI * 2);
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.arc(targetX, targetY, 6, 0, Math.PI * 2);
      ctx!.fillStyle = 'rgba(0, 255, 135, 0.5)';
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
