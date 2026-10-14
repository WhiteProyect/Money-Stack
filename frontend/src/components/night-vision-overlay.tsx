// Tactical Titanium HUD Overlay
// Telemetría metálica, retículas de titanio y esquinas de precisión en gris/plata.

export default function NightVisionOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden font-mono text-[10px] uppercase tracking-wider text-slate-400"
    >
      {/* ── Retículas en las cuatro esquinas (Titanium Brackets) ── */}
      <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-white/40 opacity-70" />
      <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-white/40 opacity-70" />
      <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-white/40 opacity-70" />
      <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-white/40 opacity-70" />

      {/* ── Telemetría Superior ── */}
      <div className="absolute top-4 left-12 hidden sm:flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded border border-white/15 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        <span className="font-bold text-white tracking-widest">MONEY-STACK // CAUCASIA HQ</span>
      </div>

      <div className="absolute top-4 right-12 hidden sm:flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded border border-red-500/40 backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-rec" />
        <span className="font-bold text-red-400">REC ●</span>
        <span className="text-slate-400 font-mono">48kHz / 24-BIT</span>
      </div>

      {/* ── Ticks centrales de retícula táctica ── */}
      <div className="absolute top-1/2 left-3 -translate-y-1/2 h-4 w-1 bg-white opacity-20" />
      <div className="absolute top-1/2 right-3 -translate-y-1/2 h-4 w-1 bg-white opacity-20" />
      <div className="absolute left-1/2 top-3 -translate-x-1/2 w-4 h-1 bg-white opacity-20" />
      <div className="absolute left-1/2 bottom-3 -translate-x-1/2 w-4 h-1 bg-white opacity-20" />

      {/* ── Telemetría Inferior ── */}
      <div className="absolute bottom-4 left-12 hidden md:flex items-center gap-3 bg-black/80 px-2.5 py-1 rounded border border-white/10 backdrop-blur-sm text-slate-400">
        <span>LOC: CAUCASIA, ANT</span>
        <span className="text-white font-bold">07°59&apos;N 75°12&apos;W</span>
      </div>

      <div className="absolute bottom-4 right-12 hidden md:flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded border border-white/10 backdrop-blur-sm text-slate-400">
        <span className="text-slate-300 font-bold">STATUS: STUDIO ACTIVE</span>
      </div>

      {/* ── Viñeta oscura profunda ── */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 75%, rgba(4,5,7,0.7) 100%)',
        }}
      />
    </div>
  );
}
