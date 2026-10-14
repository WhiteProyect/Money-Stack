'use client';

// Titanium Silver VU-Meter & Frequency Spectrum Visualizer
// Barras metálicas en plata y cromo pulido con pico de señal en blanco puro.

interface AudioVisualizerProps {
  isPlaying?: boolean;
  className?: string;
  bars?: number;
  freqData?: number[]; // Frecuencias reales si están disponibles
}

export default function AudioVisualizer({
  isPlaying = true,
  className = '',
  bars = 16,
  freqData,
}: AudioVisualizerProps) {
  return (
    <div className={`flex items-end gap-1 h-6 ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        // Si hay datos reales de Web Audio Analyser
        let heightPct = 20;
        if (freqData && freqData.length > 0) {
          const sample = freqData[i % freqData.length] || 0;
          heightPct = Math.max(15, Math.min(100, Math.round((sample / 255) * 100)));
        }

        const animationClass = ['vu-s-1', 'vu-s-2', 'vu-s-3', 'vu-s-4'][i % 4];

        return (
          <div
            key={i}
            className={`w-1 rounded-sm bg-gradient-to-t from-zinc-600 via-slate-300 to-white transition-all shadow-[0_0_6px_rgba(255,255,255,0.2)] ${
              freqData ? '' : isPlaying ? animationClass : 'h-1.5 opacity-30'
            }`}
            style={{
              animationDelay: `${(i * 0.07).toFixed(2)}s`,
              minHeight: '3px',
              ...(freqData ? { height: `${heightPct}%` } : {}),
            }}
          />
        );
      })}
    </div>
  );
}
