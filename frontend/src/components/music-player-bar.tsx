'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { SHOWCASE_TRACKS } from '@/lib/showcase-data';
import AudioVisualizer from './audio-visualizer';

export default function MusicPlayerBar() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(25);
  const [isMuted, setIsMuted] = useState(false);
  const [bpm, setBpm] = useState(140);
  const [bassBoost, setBassBoost] = useState(true);
  const [activePad, setActivePad] = useState<string | null>(null);
  const [realFreqs, setRealFreqs] = useState<number[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const beatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const track = SHOWCASE_TRACKS[currentIdx] || SHOWCASE_TRACKS[0];

  // Inicializar Web Audio API bajo demanda
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.connect(ctx.destination);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return { ctx: audioCtxRef.current, analyser: analyserRef.current };
  };

  // Síntesis Web Audio de 808 Sub-Bass Kick
  const trigger808 = () => {
    if (isMuted) return;
    const { ctx, analyser } = getAudioContext();
    if (!ctx || !analyser) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Pitch drop característico del 808
      const startFreq = bassBoost ? 160 : 130;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.35);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(analyser);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Fallback
    }
  };

  // Síntesis Web Audio de Hi-Hat
  const triggerHiHat = () => {
    if (isMuted) return;
    const { ctx, analyser } = getAudioContext();
    if (!ctx || !analyser) return;

    try {
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7000;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(analyser);

      noise.start();
    } catch {
      // Fallback
    }
  };

  // Síntesis Web Audio de Snare
  const triggerSnare = () => {
    if (isMuted) return;
    const { ctx, analyser } = getAudioContext();
    if (!ctx || !analyser) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(analyser);
      osc.start(now);
      osc.stop(now + 0.15);
      triggerHiHat();
    } catch {
      // Fallback
    }
  };

  // Disparar pad interactivo con feedback visual
  const triggerPad = (pad: '808' | 'hihat' | 'snare') => {
    setActivePad(pad);
    setTimeout(() => setActivePad(null), 150);
    if (pad === '808') trigger808();
    if (pad === 'hihat') triggerHiHat();
    if (pad === 'snare') triggerSnare();
  };

  // Bucle de reproducción de ritmo callejero cuando isPlaying === true
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = (60 / bpm) * 500; // semicorcheas
      beatTimerRef.current = setInterval(() => {
        const step = stepRef.current % 8;
        stepRef.current += 1;

        // Patrón Drill / Trap:
        // Step 0: 808 Kick
        // Step 2: HiHat
        // Step 4: Snare + 808
        // Step 6: HiHat
        if (step === 0 || step === 3) trigger808();
        if (step === 4) triggerSnare();
        if (step === 2 || step === 6 || step === 7) triggerHiHat();
      }, intervalMs);

      // Progreso del tema
      progressTimerRef.current = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 700);

      // Loop de análisis de frecuencias en vivo
      const updateFreqs = () => {
        if (analyserRef.current) {
          const buffer = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(buffer);
          setRealFreqs(Array.from(buffer.slice(0, 16)));
        }
        animFrameRef.current = requestAnimationFrame(updateFreqs);
      };
      animFrameRef.current = requestAnimationFrame(updateFreqs);
    } else {
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, bpm, isMuted, bassBoost]);

  const togglePlay = () => {
    if (!isPlaying) {
      getAudioContext();
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % SHOWCASE_TRACKS.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + SHOWCASE_TRACKS.length) % SHOWCASE_TRACKS.length);
    setProgress(0);
  };

  return (
    <div className="w-full rounded-2xl border border-white/15 bg-gradient-to-b from-[#121620] to-[#080a0f] p-4 md:p-5 font-mono shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
      {/* Esquinas de precisión metálica */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
        {/* Track Info */}
        <div className="flex items-center gap-3.5 w-full lg:w-auto">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-white/20 bg-black shadow-md">
            <Image
              src={track.cover}
              alt={track.title}
              fill
              className={`object-cover filter grayscale contrast-125 transition-transform duration-300 ${
                isPlaying ? 'scale-105' : ''
              }`}
            />
            {isPlaying && (
              <span className="absolute inset-0 bg-white/10 mix-blend-overlay" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded bg-white/10 border border-white/20 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                {track.genre}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                {bpm} BPM
              </span>
              {bassBoost && (
                <span className="text-[9px] font-bold text-slate-300 border border-slate-700 rounded px-1.5 py-0.2">
                  +12dB SUB
                </span>
              )}
            </div>
            <p className="truncate font-black text-white text-sm md:text-base mt-0.5 tracking-wider">
              {track.title}
            </p>
            <p className="truncate text-xs text-slate-400 font-sans">{track.artist}</p>
          </div>
        </div>

        {/* Controles de reproducción y barra de progreso */}
        <div className="flex flex-1 flex-col items-center gap-2 max-w-md w-full">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Pista anterior"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-transform hover:scale-105 active:scale-95"
              aria-label={isPlaying ? 'Pausar reproductor' : 'Iniciar audio sintético'}
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
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Siguiente pista"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          {/* Barra de progreso de titanio */}
          <div className="flex items-center gap-2 w-full text-[10px] text-slate-400">
            <span className="text-white">0:{Math.floor((progress * 1.8) / 10).toString().padStart(2, '0')}</span>
            <div
              className="relative flex-1 h-2 rounded bg-black border border-white/20 cursor-pointer overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                setProgress(Math.round(pos * 100));
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-zinc-400 via-slate-200 to-white shadow-[0_0_10px_white]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>{track.duration}</span>
          </div>
        </div>

        {/* Módulo de Audio Deck Tecnológico: Pads interactivos y controles */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          {/* Pads interactivos de sonido */}
          <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => triggerPad('808')}
              className={`rounded px-2 py-1 text-[10px] font-bold transition-all ${
                activePad === '808'
                  ? 'bg-white text-black scale-95 shadow-[0_0_10px_white]'
                  : 'bg-zinc-800 text-slate-200 hover:bg-zinc-700'
              }`}
              title="Disparar 808 Sub-Bass"
            >
              808
            </button>
            <button
              type="button"
              onClick={() => triggerPad('snare')}
              className={`rounded px-2 py-1 text-[10px] font-bold transition-all ${
                activePad === 'snare'
                  ? 'bg-white text-black scale-95 shadow-[0_0_10px_white]'
                  : 'bg-zinc-800 text-slate-200 hover:bg-zinc-700'
              }`}
              title="Disparar Snare"
            >
              SNARE
            </button>
            <button
              type="button"
              onClick={() => triggerPad('hihat')}
              className={`rounded px-2 py-1 text-[10px] font-bold transition-all ${
                activePad === 'hihat'
                  ? 'bg-white text-black scale-95 shadow-[0_0_10px_white]'
                  : 'bg-zinc-800 text-slate-200 hover:bg-zinc-700'
              }`}
              title="Disparar Hi-Hat"
            >
              HAT
            </button>
          </div>

          {/* Selector de BPM */}
          <button
            type="button"
            onClick={() => setBpm((prev) => (prev === 128 ? 140 : prev === 140 ? 160 : 128))}
            className="rounded border border-white/15 bg-black px-2 py-1 text-[10px] font-bold text-slate-300 hover:border-white hover:text-white transition-all"
            title="Cambiar tempo BPM"
          >
            {bpm} BPM
          </button>

          {/* Sub-Bass Boost */}
          <button
            type="button"
            onClick={() => setBassBoost(!bassBoost)}
            className={`rounded px-2 py-1 text-[10px] font-bold border transition-all ${
              bassBoost
                ? 'border-white bg-white text-black shadow-[0_0_8px_white]'
                : 'border-white/10 bg-black text-slate-400'
            }`}
            title="Refuerzo de sub-graves"
          >
            BASS
          </button>

          {/* Visualizador de frecuencias */}
          <AudioVisualizer isPlaying={isPlaying} bars={10} freqData={realFreqs} className="hidden xl:flex" />

          {/* Silenciar */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? (
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
