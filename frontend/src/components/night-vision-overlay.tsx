import { grainSvg } from '@/lib/grain';

// Overlay night vision global (F3): grano + líneas de escaneo + viñeta sobre
// todo el sitio público. Capas decorativas, pointer-events none, y anuladas
// por .fx-off / prefers-reduced-motion (ver globals.css).

export default function NightVisionOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {/* Grano */}
      <div
        className="absolute inset-0 opacity-[var(--grain-opacity)] mix-blend-overlay"
        style={{ backgroundImage: `url("${grainSvg}")`, backgroundSize: '256px 256px' }}
      />
      {/* Líneas de escaneo */}
      <div
        className="absolute inset-0 opacity-[var(--scanline-opacity)]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)',
        }}
      />
      {/* Viñeta */}
      <div
        className="absolute inset-0 opacity-[var(--vignette-opacity)]"
        style={{
          background:
            'radial-gradient(circle at center, transparent 55%, rgba(0,0,0,0.9) 100%)',
        }}
      />
    </div>
  );
}
