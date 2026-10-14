'use client';

// 3D Audio Topography & Multimode Vector Canvas (Titanium Gray & Chrome)
// Modos: Topografía 3D (Joy Division), Osciloscopio Láser Analógico y Sonar Radar 3D.

import { useEffect, useRef, useState } from 'react';

type VizMode = 'topography' | 'oscilloscope' | 'radar';

export default function DepthHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<VizMode>('topography');
  const modeRef = useRef<VizMode>('topography');

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

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
      step += 0.02;
      const currentMode = modeRef.current;

      // Fondo oscuro carbón con resplandor plateado suave
      const bgGrad = ctx!.createRadialGradient(
        width * 0.5,
        height * 0.45,
        10,
        width * 0.5,
        height * 0.5,
        width * 0.7
      );
      bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      bgGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.015)');
      bgGrad.addColorStop(1, 'rgba(4, 5, 7, 0)');
      ctx!.fillStyle = bgGrad;
      ctx!.fillRect(0, 0, width, height);

      // Cuadrícula técnica en gris titanio
      ctx!.strokeStyle = 'rgba(255, 255, 255, 0.025)';
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

      if (currentMode === 'topography') {
        // ── MODO 1: Topografía 3D de crestas sonoras (Joy Division) ──
        const ridges = 8;
        const baseY = height * 0.72;
        const spacing = 18;

        for (let r = 0; r < ridges; r++) {
          const depthFactor = (r + 1) / ridges;
          const yBase = baseY + (r - ridges / 2) * spacing;
          const alpha = 0.08 + depthFactor * 0.35;

          ctx!.beginPath();
          ctx!.moveTo(0, height);

          for (let x = 0; x <= width; x += 6) {
            const normX = x / width;
            const bell = Math.exp(-Math.pow((normX - 0.5) * 3, 2));
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

          ctx!.fillStyle = '#07090e';
          ctx!.fill();

          ctx!.strokeStyle = `rgba(226, 232, 240, ${alpha.toFixed(2)})`;
          ctx!.lineWidth = r === ridges - 1 ? 1.5 : 1;
          ctx!.stroke();
        }

        // Haz de escaneo láser plateado
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
      } else if (currentMode === 'oscilloscope') {
        // ── MODO 2: Osciloscopio Láser Analógico de Doble Traza ──
        const centerY = height * 0.52;

        // Traza principal de audio (onda compuesta rica)
        ctx!.beginPath();
        ctx!.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx!.lineWidth = 2;
        ctx!.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx!.shadowBlur = 10;

        for (let x = 0; x <= width; x += 4) {
          const normX = x / width;
          const freq1 = Math.sin(normX * 18 + step * 2.5);
          const freq2 = Math.sin(normX * 36 - step * 3.5) * 0.5;
          const freq3 = Math.cos(normX * 8 + step * 1.2) * (mouse.y * 0.8 + 0.2);
          const envelope = Math.sin(normX * Math.PI); // atenuación bordes

          const wave = (freq1 + freq2 + freq3) * 35 * envelope;
          const y = centerY + wave;

          if (x === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.stroke();
        ctx!.shadowBlur = 0;

        // Segunda traza armónica (eco desfasado en titanio)
        ctx!.beginPath();
        ctx!.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx!.lineWidth = 1;
        for (let x = 0; x <= width; x += 6) {
          const normX = x / width;
          const sub = Math.sin(normX * 12 + step * 1.8 + 1) * 20 * Math.sin(normX * Math.PI);
          const y = centerY + sub;
          if (x === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.stroke();

        // Figura de Lissajous orbital interactiva con el mouse
        const lissCenterX = width * 0.78;
        const lissCenterY = height * 0.45;
        const lissRadius = 36;
        ctx!.beginPath();
        ctx!.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx!.lineWidth = 1.2;
        for (let t = 0; t <= Math.PI * 2; t += 0.05) {
          const lx = lissCenterX + Math.sin(t * 3 + step * 2) * lissRadius;
          const ly = lissCenterY + Math.cos(t * 2 + step * 1.5) * lissRadius * (mouse.y * 0.5 + 0.5);
          if (t === 0) ctx!.moveTo(lx, ly);
          else ctx!.lineTo(lx, ly);
        }
        ctx!.stroke();
      } else if (currentMode === 'radar') {
        // ── MODO 3: Radar Sonoro 3D y Ondas Concéntricas ──
        const rX = width * 0.5;
        const rY = height * 0.52;
        const maxRadius = Math.min(width, height) * 0.42;

        // Anillos concéntricos de rango
        for (let ring = 1; ring <= 5; ring++) {
          const r = (maxRadius / 5) * ring;
          ctx!.beginPath();
          ctx!.arc(rX, rY, r, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(255, 255, 255, ${(0.05 + ring * 0.03).toFixed(2)})`;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }

        // Cruz de retícula
        ctx!.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx!.beginPath();
        ctx!.moveTo(rX - maxRadius, rY);
        ctx!.lineTo(rX + maxRadius, rY);
        ctx!.moveTo(rX, rY - maxRadius);
        ctx!.lineTo(rX, rY + maxRadius);
        ctx!.stroke();

        // Haz de escaneo giratorio 360°
        const angle = step * 1.5;
        ctx!.beginPath();
        ctx!.moveTo(rX, rY);
        ctx!.arc(rX, rY, maxRadius, angle - 0.35, angle);
        ctx!.closePath();
        const sweepRadial = ctx!.createRadialGradient(rX, rY, 0, rX, rY, maxRadius);
        sweepRadial.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        sweepRadial.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx!.fillStyle = sweepRadial;
        ctx!.fill();

        // Línea principal de barrido
        ctx!.beginPath();
        ctx!.moveTo(rX, rY);
        ctx!.lineTo(rX + Math.cos(angle) * maxRadius, rY + Math.sin(angle) * maxRadius);
        ctx!.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        // Ondas de choque en expansión (pulso sonoro)
        const shockRadius = ((step * 60) % maxRadius);
        ctx!.beginPath();
        ctx!.arc(rX, rY, shockRadius, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(255, 255, 255, ${(1 - shockRadius / maxRadius) * 0.4})`;
        ctx!.lineWidth = 2;
        ctx!.stroke();
      }

      // ── Retícula del puntero con lectura táctica ──
      const tx = mouse.x * width;
      const ty = mouse.y * height;
      ctx!.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(tx, ty, 18, 0, Math.PI * 2);
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.arc(tx, ty, 3, 0, Math.PI * 2);
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
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
        aria-hidden="true"
      />

      {/* Selector táctico de modos 3D en la esquina inferior */}
      <div className="absolute bottom-3 right-4 z-20 hidden sm:flex items-center gap-1 rounded border border-white/15 bg-black/80 px-2 py-1 font-mono text-[9px] backdrop-blur-md">
        <span className="text-slate-400 font-bold mr-1">// 3D VIZ:</span>
        <button
          type="button"
          onClick={() => setMode('topography')}
          className={`rounded px-2 py-0.5 uppercase transition-all ${
            mode === 'topography'
              ? 'bg-white text-black font-black shadow-[0_0_8px_rgba(255,255,255,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          [TOPOGRAFÍA]
        </button>
        <button
          type="button"
          onClick={() => setMode('oscilloscope')}
          className={`rounded px-2 py-0.5 uppercase transition-all ${
            mode === 'oscilloscope'
              ? 'bg-white text-black font-black shadow-[0_0_8px_rgba(255,255,255,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          [OSCILOSCOPIO]
        </button>
        <button
          type="button"
          onClick={() => setMode('radar')}
          className={`rounded px-2 py-0.5 uppercase transition-all ${
            mode === 'radar'
              ? 'bg-white text-black font-black shadow-[0_0_8px_rgba(255,255,255,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          [SONAR RADAR]
        </button>
      </div>
    </>
  );
}
