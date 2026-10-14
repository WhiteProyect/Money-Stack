'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { SHOWCASE_TRACKS } from '@/lib/showcase-data';
import AudioVisualizer from './audio-visualizer';

type StepGrid = {
  bass: boolean[];
  snare: boolean[];
  hihat: boolean[];
  perc: boolean[];
};

const PRESETS: Record<string, StepGrid> = {
  drill: {
    bass: [true, false, false, true, false, false, false, true, false, false, true, false, false, false, true, false],
    snare: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, true],
    hihat: [true, true, true, false, true, true, true, false, true, true, true, false, true, true, true, true],
    perc: [false, false, true, false, false, false, true, false, false, false, true, false, false, true, false, false],
  },
  trap: {
    bass: [true, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    perc: [false, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false],
  },
  afrobeat: {
    bass: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    perc: [false, false, true, false, false, true, false, true, false, false, true, false, false, true, false, true],
  },
};

export default function MusicPlayerBar() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(25);
  const [isMuted, setIsMuted] = useState(false);
  const [bpm, setBpm] = useState(140);
  const [bassBoost, setBassBoost] = useState(true);
  const [activePad, setActivePad] = useState<string | null>(null);
  const [realFreqs, setRealFreqs] = useState<number[]>([]);
  const [showSequencer, setShowSequencer] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [grid, setGrid] = useState<StepGrid>(PRESETS.drill);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const beatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);
  const gridRef = useRef<StepGrid>(grid);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

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
      const startFreq = bassBoost ? 170 : 135;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      gain.gain.setValueAtTime(0.55, now);
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
      filter.frequency.value = 7500;

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
      osc.frequency.setValueAtTime(190, now);
      gain.gain.setValueAtTime(0.35, now);
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

  // Síntesis Web Audio de Rimshot / Percusión ribereña
  const triggerPerc = () => {
    if (isMuted) return;
    const { ctx, analyser } = getAudioContext();
    if (!ctx || !analyser) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.07);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(analyser);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Fallback
    }
  };

  // Disparar pad interactivo con feedback visual
  const triggerPad = (pad: '808' | 'hihat' | 'snare' | 'perc') => {
    setActivePad(pad);
    setTimeout(() => setActivePad(null), 150);
    if (pad === '808') trigger808();
    if (pad === 'hihat') triggerHiHat();
    if (pad === 'snare') triggerSnare();
    if (pad === 'perc') triggerPerc();
  };

  // Conmutar un paso de la rejilla
  const toggleStep = (instrument: keyof StepGrid, index: number) => {
    setGrid((prev) => {
      const row = [...prev[instrument]];
      row[index] = !row[index];
      return { ...prev, [instrument]: row };
    });
    // Pre-escucha táctil al encender
    if (!grid[instrument][index]) {
      if (instrument === 'bass') trigger808();
      if (instrument === 'snare') triggerSnare();
      if (instrument === 'hihat') triggerHiHat();
      if (instrument === 'perc') triggerPerc();
    }
  };

  // Cargar preset rítmico
  const loadPreset = (name: 'drill' | 'trap' | 'afrobeat') => {
    setGrid(PRESETS[name]);
  };

  const clearGrid = () => {
    setGrid({
      bass: Array(16).fill(false),
      snare: Array(16).fill(false),
      hihat: Array(16).fill(false),
      perc: Array(16).fill(false),
    });
  };

  // Bucle de reproducción del Secuenciador de 16 pasos
  useEffect(() => {
    if (isPlaying) {
      // Tiempo por semicorchea (16th note)
      const intervalMs = (60 / bpm) * 250;
      beatTimerRef.current = setInterval(() => {
        const step = stepRef.current % 16;
        setCurrentStep(step);
        stepRef.current += 1;

        const currentG = gridRef.current;
        if (currentG.bass[step]) trigger808();
        if (currentG.snare[step]) triggerSnare();
        if (currentG.hihat[step]) triggerHiHat();
        if (currentG.perc[step]) triggerPerc();
      }, intervalMs);

      progressTimerRef.current = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 700);

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
    <div className="w-full rounded-2xl border border-white/15 bg-gradient-to-b from-[#10141d] to-[#07090e] p-4 md:p-5 font-mono shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
      {/* ── Fila Principal: Track, Controles, Pads y Ecualizador ── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
        {/* Track Info */}
        <div className="flex items-center gap-3.5 w-full lg:w-auto">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-white/20 bg-black shadow-md">
            <Image
              src={track.cover}
              alt={track.title}
              fill
              className="object-cover filter grayscale contrast-125"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-white animate-ping" />
              </div>
            )}
          </div>

          <div className="overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="rounded bg-black border border-white/20 px-1.5 py-0.5 text-[8px] font-bold text-slate-300">
                808 HARDWARE
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {bpm} BPM
              </span>
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider truncate">
              {track.title}
            </h4>
            <p className="text-xs text-slate-400 font-sans truncate">
              {track.artist}
            </p>
          </div>
        </div>

        {/* Reproductor Central y Barra de Progreso */}
        <div className="flex flex-col items-center gap-2.5 w-full lg:max-w-md">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Track anterior"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-all active:scale-95 ${
                isPlaying
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.5)]'
                  : 'bg-white text-black hover:bg-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
              }`}
              aria-label={isPlaying ? 'Pausar beat' : 'Reproducir beat'}
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
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Track siguiente"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="w-full flex items-center gap-3 text-[10px] text-slate-400">
            <span>0:{Math.floor((progress * 1.8) / 10).toString().padStart(2, '0')}</span>
            <div
              className="relative h-1.5 flex-1 bg-black/60 rounded-full overflow-hidden border border-white/10 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                setProgress(Math.round((clickX / rect.width) * 100));
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-slate-400 via-white to-slate-200 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>{track.duration}</span>
          </div>
        </div>

        {/* Drum Pads Táctiles & Botón del Secuenciador */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 w-full lg:w-auto">
          {/* Drum Pad 808 */}
          <button
            type="button"
            onClick={() => triggerPad('808')}
            className={`flex flex-col items-center justify-center h-12 w-14 rounded border transition-all active:scale-90 ${
              activePad === '808'
                ? 'border-white bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.6)]'
                : 'border-white/20 bg-black/80 text-white hover:border-white/50'
            }`}
          >
            <span className="text-[10px] font-black">808</span>
            <span className="text-[7px] text-slate-400">SUB-BASS</span>
          </button>

          {/* Drum Pad Snare */}
          <button
            type="button"
            onClick={() => triggerPad('snare')}
            className={`flex flex-col items-center justify-center h-12 w-14 rounded border transition-all active:scale-90 ${
              activePad === 'snare'
                ? 'border-white bg-slate-200 text-black shadow-[0_0_15px_rgba(226,232,240,0.6)]'
                : 'border-white/20 bg-black/80 text-slate-300 hover:border-white/50'
            }`}
          >
            <span className="text-[10px] font-black">SNARE</span>
            <span className="text-[7px] text-slate-400">PUNCH</span>
          </button>

          {/* Drum Pad Hi-Hat */}
          <button
            type="button"
            onClick={() => triggerPad('hihat')}
            className={`flex flex-col items-center justify-center h-12 w-14 rounded border transition-all active:scale-90 ${
              activePad === 'hihat'
                ? 'border-white bg-slate-300 text-black shadow-[0_0_15px_rgba(203,213,225,0.6)]'
                : 'border-white/20 bg-black/80 text-slate-300 hover:border-white/50'
            }`}
          >
            <span className="text-[10px] font-black">HI-HAT</span>
            <span className="text-[7px] text-slate-400">ROLL</span>
          </button>

          {/* Botón Drawer del Secuenciador de 16 Pasos */}
          <button
            type="button"
            onClick={() => setShowSequencer(!showSequencer)}
            className={`flex items-center gap-1.5 h-12 rounded border px-3 text-[10px] font-black uppercase transition-all ${
              showSequencer
                ? 'border-white bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'border-white/20 bg-black text-slate-200 hover:border-white/50 hover:bg-white/10'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${showSequencer ? 'bg-black animate-pulse' : 'bg-white'}`} />
            <span>BEATMAKER 16-PASOS</span>
          </button>
        </div>
      </div>

      {/* ── Desplegable del Secuenciador de Beats de 16 Pasos (TR-808) ── */}
      {showSequencer && (
        <div className="mt-5 pt-4 border-t border-white/10 space-y-3.5 animate-fadeIn">
          {/* Cabecera del Beatmaker con presets y BPM */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">// PRESETS:</span>
              <button
                type="button"
                onClick={() => loadPreset('drill')}
                className="rounded border border-white/20 bg-black px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:border-white hover:text-white"
              >
                DRILL CAUCASIA
              </button>
              <button
                type="button"
                onClick={() => loadPreset('trap')}
                className="rounded border border-white/20 bg-black px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:border-white hover:text-white"
              >
                TRAP RAW
              </button>
              <button
                type="button"
                onClick={() => loadPreset('afrobeat')}
                className="rounded border border-white/20 bg-black px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:border-white hover:text-white"
              >
                AFROBEAT RÍO
              </button>
              <button
                type="button"
                onClick={clearGrid}
                className="rounded border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/20"
              >
                LIMPIAR
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-[10px]">TEMPO:</span>
              <div className="flex items-center gap-1">
                {[130, 140, 150].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBpm(val)}
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      bpm === val
                        ? 'bg-white text-black'
                        : 'border border-white/10 bg-black text-slate-400 hover:text-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setBassBoost(!bassBoost)}
                className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all ${
                  bassBoost
                    ? 'border border-white bg-white/15 text-white'
                    : 'border border-white/10 text-slate-500'
                }`}
              >
                BASS BOOST: {bassBoost ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Rejilla de 16 Pasos por Canal */}
          <div className="space-y-2 overflow-x-auto pb-1">
            {(['bass', 'snare', 'hihat', 'perc'] as const).map((inst) => {
              const label =
                inst === 'bass'
                  ? '808 SUB'
                  : inst === 'snare'
                  ? 'SNARE'
                  : inst === 'hihat'
                  ? 'HI-HAT'
                  : 'PERC/RIM';

              return (
                <div key={inst} className="flex items-center gap-2 min-w-[580px]">
                  <span className="w-20 text-[10px] font-bold text-slate-300 tracking-wider">
                    {label}
                  </span>

                  <div
                    className="grid flex-1 gap-1"
                    style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
                  >
                    {grid[inst].map((active, stepIdx) => {
                      const isCurrentStep = isPlaying && currentStep === stepIdx;
                      const isQuarter = stepIdx % 4 === 0;

                      return (
                        <button
                          key={stepIdx}
                          type="button"
                          onClick={() => toggleStep(inst, stepIdx)}
                          className={`h-8 rounded-sm text-[8px] font-mono transition-all border ${
                            active
                              ? isCurrentStep
                                ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.8)] scale-105'
                                : 'bg-slate-200 text-black border-slate-300 shadow-[0_0_6px_rgba(255,255,255,0.2)]'
                              : isCurrentStep
                              ? 'bg-white/20 border-white/50 text-white'
                              : isQuarter
                              ? 'bg-black/90 border-white/20 text-slate-500 hover:border-white/50'
                              : 'bg-black/60 border-white/10 text-slate-600 hover:border-white/30'
                          }`}
                          title={`${label} - Paso ${stepIdx + 1}`}
                        >
                          {stepIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barra inferior de análisis de espectro FFT real */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] text-slate-500">
            <span>SECUENCIADOR HARDWARE // 16-STEP TIME RESOLUTION</span>
            <AudioVisualizer isPlaying={isPlaying} bars={16} freqData={realFreqs} className="h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
