// Tactical Street Night Vision HUD Overlay
// Elementos visuales auténticos de visión nocturna militar y callejera:
// Telemetría HUD, retículas ópticas, indicador REC ● y fósforo verde sin oscurecer el contenido.

export default function NightVisionOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden font-mono text-[10px] uppercase tracking-wider text-[var(--accent-nv)]"
    >
      {/* ── Retículas en las cuatro esquinas (Night Vision Brackets) ── */}
      <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-[#00ff87] opacity-60" />
      <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-[#00ff87] opacity-60" />
      <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-[#00ff87] opacity-60" />
      <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-[#00ff87] opacity-60" />

      {/* ── Telemetría Superior ── */}
      <div className="absolute top-4 left-12 hidden sm:flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded border border-[#00ff87]/30 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00ff87] animate-pulse" />
        <span className="font-bold text-[#00ff87]">NVG-OPTICS // STREET SECTOR</span>
      </div>

      <div className="absolute top-4 right-12 hidden sm:flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded border border-red-500/40 backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-rec" />
        <span className="font-bold text-red-400">REC ●</span>
        <span className="text-slate-400 font-mono">07°59&apos;N</span>
      </div>

      {/* ── Ticks centrales de retícula táctica ── */}
      <div className="absolute top-1/2 left-3 -translate-y-1/2 h-4 w-1 bg-[#00ff87] opacity-40" />
      <div className="absolute top-1/2 right-3 -translate-y-1/2 h-4 w-1 bg-[#00ff87] opacity-40" />
      <div className="absolute left-1/2 top-3 -translate-x-1/2 w-4 h-1 bg-[#00ff87] opacity-40" />
      <div className="absolute left-1/2 bottom-3 -translate-x-1/2 w-4 h-1 bg-[#00ff87] opacity-40" />

      {/* ── Telemetría Inferior ── */}
      <div className="absolute bottom-4 left-12 hidden md:flex items-center gap-3 bg-black/60 px-2.5 py-1 rounded border border-[#00ff87]/20 backdrop-blur-sm text-slate-400">
        <span>LOC: CAUCASIA, ANT</span>
        <span className="text-[#00ff87]">808 SUB-BASS CARTEL</span>
      </div>

      <div className="absolute bottom-4 right-12 hidden md:flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded border border-[#00ff87]/20 backdrop-blur-sm text-slate-400">
        <span className="text-[#facc15]">STATUS: 100% CALLE</span>
      </div>

      {/* ── Viñeta sutil en los bordes con tinte verde fósforo nocturno ── */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 75%, rgba(0,255,135,0.06) 95%, rgba(4,5,7,0.7) 100%)',
        }}
      />
    </div>
  );
}
