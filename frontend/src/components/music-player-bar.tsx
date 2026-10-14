'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { SHOWCASE_TRACKS } from '@/lib/showcase-data';
import AudioVisualizer from './audio-visualizer';

export default function MusicPlayerBar() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const track = SHOWCASE_TRACKS[currentIdx] || SHOWCASE_TRACKS[0];

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      try {
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) audioContextRef.current = new AudioContextClass();
        }
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      } catch {
        // Fallback silencioso
      }
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 600);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % SHOWCASE_TRACKS.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + SHOWCASE_TRACKS.length) % SHOWCASE_TRACKS.length);
    setProgress(0);
  };

  return (
    <div className="w-full rounded-xl border border-[#00ff87]/30 bg-[#080b11] p-4 font-mono shadow-[0_15px_40px_rgba(0,0,0,0.9)]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Track info con estilo de cinta de casete callejera */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded border border-[#00ff87]/40 bg-black">
            <Image
              src={track.cover}
              alt={track.title}
              fill
              className={`object-cover filter grayscale contrast-125 ${isPlaying ? 'scale-105' : ''}`}
            />
            {isPlaying && <span className="absolute inset-0 bg-[#00ff87]/20 mix-blend-color" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded bg-[#00ff87]/15 border border-[#00ff87]/40 px-2 py-0.5 text-[9px] font-bold text-[#00ff87]">
                {track.genre}
              </span>
              <span className="text-[10px] text-[#facc15] font-bold">
                {track.bpm} BPM // SUB-808
              </span>
            </div>
            <p className="truncate font-black text-white text-sm md:text-base mt-0.5 tracking-wider">
              {track.title}
            </p>
            <p className="truncate text-xs text-slate-400">{track.artist}</p>
          </div>
        </div>

        {/* Controles de reproducción tácticos */}
        <div className="flex flex-1 flex-col items-center gap-2 max-w-md w-full">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              className="text-slate-400 hover:text-[#00ff87] transition-colors p-1"
              aria-label="Pista anterior"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#00ff87] text-black shadow-[0_0_20px_rgba(0,255,135,0.5)] transition-transform hover:scale-105 active:scale-95"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 fill-current translate-x-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="text-slate-400 hover:text-[#00ff87] transition-colors p-1"
              aria-label="Siguiente pista"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          {/* Barra de progreso de fósforo verde */}
          <div className="flex items-center gap-2 w-full text-[10px] text-slate-400">
            <span className="text-[#00ff87]">0:{Math.floor((progress * 1.8) / 10).toString().padStart(2, '0')}</span>
            <div
              className="relative flex-1 h-2 rounded bg-black border border-[#00ff87]/30 cursor-pointer overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                setProgress(Math.round(pos * 100));
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-[#00ff87] to-[#00e5ff] shadow-[0_0_10px_#00ff87]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>{track.duration}</span>
          </div>
        </div>

        {/* Visualizador y volumen */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <AudioVisualizer isPlaying={isPlaying} bars={12} className="hidden sm:flex" />
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-[#00ff87] transition-colors p-1.5"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-[#00ff87]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
          <a
            href="https://open.spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded bg-black border border-[#00ff87]/40 px-3 py-1.5 text-xs font-bold text-[#00ff87] hover:bg-[#00ff87] hover:text-black transition-all"
          >
            <span>SPOTIFY</span>
          </a>
        </div>
      </div>
    </div>
  );
}
