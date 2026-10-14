'use client';

// Night Vision & Analog Studio VU-Meter Audio Visualizer
// Barras de fósforo verde con pico clipping en amarillo/rojo para estética analógica callejera.

interface AudioVisualizerProps {
  isPlaying?: boolean;
  className?: string;
  bars?: number;
}

export default function AudioVisualizer({
  isPlaying = true,
  className = '',
  bars = 16,
}: AudioVisualizerProps) {
  return (
    <div className={`flex items-end gap-1 h-6 ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const heightClasses = ['vu-1', 'vu-2', 'vu-3', 'vu-4'][i % 4];

        return (
          <div
            key={i}
            className={`w-1 rounded-sm bg-gradient-to-t from-[#00ff87] via-[#00ff87] to-[#facc15] transition-all shadow-[0_0_6px_rgba(0,255,135,0.4)] ${
              isPlaying ? heightClasses : 'h-1.5 opacity-30'
            }`}
            style={{
              animationDelay: `${(i * 0.07).toFixed(2)}s`,
              minHeight: '3px',
            }}
          />
        );
      })}
    </div>
  );
}
