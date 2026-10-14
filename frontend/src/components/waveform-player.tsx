'use client';

// Interactive Audio Waveform Scrubber
// Visualización interactiva de forma de onda de audio con scrubbing, medidor de tiempo y reproducción de snippets.

import { useState, useRef, useEffect, type MouseEvent } from 'react';

interface WaveformPlayerProps {
  title?: string;
  artistName?: string;
  durationSeconds?: number;
  barCount?: number;
  onPlayStateChange?: (playing: boolean) => void;
  className?: string;
}

export default function WaveformPlayer({
  title = 'SNIPPET OFICIAL',
  artistName = 'MONEY-STACK',
  durationSeconds = 30,
  barCount = 36,
  onPlayStateChange,
  className = '',
}: WaveformPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generar alturas de onda pseudo-aleatorias consistentes
  const [bars] = useState(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const sinVal = Math.abs(Math.sin((i / barCount) * Math.PI * 3));
      const rand = Math.sin(i * 999) * 0.3 + 0.7;
      return Math.max(0.18, Math.min(1, sinVal * rand));
    });
  });

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playSynthesizedSnippet = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now); // A2
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.4);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  };

  const togglePlay = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (onPlayStateChange) onPlayStateChange(nextState);

    if (nextState) {
      playSynthesizedSnippet();
    }
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            setIsPlaying(false);
            if (onPlayStateChange) onPlayStateChange(false);
            return 0;
          }
          return prev + 0.02;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, onPlayStateChange]);

  const handleWaveformClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    setProgress(newProgress);
    playSynthesizedSnippet();
  };

  const currentSeconds = Math.floor(progress * durationSeconds);
  const formattedTime = `0:${currentSeconds.toString().padStart(2, '0')}`;
  const totalTime = `0:${durationSeconds.toString().padStart(2, '0')}`;

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={`rounded-lg border border-white/15 bg-black/90 p-3 font-mono ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2 text-[10px]">
        <div className="flex items-center gap-1.5 truncate">
          <span className={`h-1.5 w-1.5 rounded-full ${isPlaying ? 'bg-white animate-ping' : 'bg-slate-500'}`} />
          <span className="font-bold text-white uppercase truncate">{title}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400 truncate">{artistName}</span>
        </div>
        <span className="text-slate-300 font-bold shrink-0">
          {formattedTime} / {totalTime}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-all active:scale-95 ${
            isPlaying
              ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.6)]'
              : 'border border-white/20 bg-slate-900 text-white hover:border-white'
          }`}
          aria-label={isPlaying ? 'Pausar snippet' : 'Reproducir snippet'}
        >
          {isPlaying ? (
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5 fill-current translate-x-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Waveform Bars Scrubber */}
        <div
          onClick={handleWaveformClick}
          className="group/wave relative flex flex-1 items-end gap-[2px] h-8 cursor-pointer select-none py-1"
          title="Haz clic para avanzar o retroceder"
        >
          {bars.map((heightPct, idx) => {
            const barProgress = idx / barCount;
            const isPassed = barProgress <= progress;

            return (
              <div
                key={idx}
                className={`flex-1 rounded-sm transition-all duration-150 ${
                  isPassed
                    ? 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.5)]'
                    : 'bg-slate-700/80 group-hover/wave:bg-slate-600'
                }`}
                style={{
                  height: `${Math.round(heightPct * 100)}%`,
                  minHeight: '4px',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
