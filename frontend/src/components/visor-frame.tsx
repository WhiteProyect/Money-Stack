import type { ReactNode } from 'react';

interface VisorFrameProps {
  children: ReactNode;
  label?: string;
  telemetry?: string;
  className?: string;
  contentClassName?: string;
  as?: 'div' | 'section' | 'article';
  cornerSize?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  statusDot?: boolean;
}

export default function VisorFrame({
  children,
  label,
  telemetry,
  className = '',
  contentClassName = '',
  as: Component = 'div',
  cornerSize = 'md',
  glow = false,
  statusDot = false,
}: VisorFrameProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[cornerSize];

  return (
    <Component
      className={`group relative rounded-xl border border-[#00ff87]/25 bg-[#090c12] font-mono ${
        glow ? 'shadow-[0_0_30px_rgba(0,255,135,0.2)]' : ''
      } ${className}`}
    >
      {/* Esquinas tácticas Night Vision */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -top-px -left-px border-t-2 border-l-2 border-[#00ff87] ${sizeClasses} opacity-80 group-hover:opacity-100 transition-opacity`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -top-px -right-px border-t-2 border-r-2 border-[#00ff87] ${sizeClasses} opacity-80 group-hover:opacity-100 transition-opacity`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-px -left-px border-b-2 border-l-2 border-[#00ff87] ${sizeClasses} opacity-80 group-hover:opacity-100 transition-opacity`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-px -right-px border-b-2 border-r-2 border-[#00ff87] ${sizeClasses} opacity-80 group-hover:opacity-100 transition-opacity`}
      />

      {/* Barra superior HUD */}
      {(label || telemetry) && (
        <div
          className="flex items-center justify-between border-b border-[#00ff87]/20 bg-black/60 px-4 py-2 text-[10px] uppercase tracking-wider text-slate-400"
          aria-hidden="true"
        >
          <div className="flex items-center gap-2">
            {statusDot && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ff87] animate-pulse shadow-[0_0_6px_#00ff87]" />
            )}
            {label && (
              <span className="font-bold text-[#00ff87]">
                {label}
              </span>
            )}
          </div>
          {telemetry && (
            <span className="text-[10px] font-mono text-[#facc15]">
              {telemetry}
            </span>
          )}
        </div>
      )}

      {/* Contenido */}
      <div className={contentClassName}>{children}</div>
    </Component>
  );
}
