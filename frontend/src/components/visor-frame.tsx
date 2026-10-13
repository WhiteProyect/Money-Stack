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
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-5 h-5',
  }[cornerSize];

  return (
    <Component
      className={`group relative rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] ${
        glow ? 'shadow-[0_0_24px_rgba(125,255,179,0.08)]' : ''
      } ${className}`}
    >
      {/* Tactical corner brackets (┌ ┐ └ ┘) */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -top-px -left-px border-t-2 border-l-2 border-[var(--accent)] ${sizeClasses} opacity-80 transition-all duration-200 group-hover:opacity-100 group-hover:scale-105`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -top-px -right-px border-t-2 border-r-2 border-[var(--accent)] ${sizeClasses} opacity-80 transition-all duration-200 group-hover:opacity-100 group-hover:scale-105`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-px -left-px border-b-2 border-l-2 border-[var(--accent)] ${sizeClasses} opacity-80 transition-all duration-200 group-hover:opacity-100 group-hover:scale-105`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-px -right-px border-b-2 border-r-2 border-[var(--accent)] ${sizeClasses} opacity-80 transition-all duration-200 group-hover:opacity-100 group-hover:scale-105`}
      />

      {/* Header HUD telemetry bar if label or telemetry provided */}
      {(label || telemetry) && (
        <div
          className="flex items-center justify-between border-b border-[var(--depth-4)] px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]"
          aria-hidden="true"
        >
          <div className="flex items-center gap-2">
            {statusDot && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse shadow-[0_0_6px_var(--accent)]" />
            )}
            {label && <span className="font-semibold text-[var(--accent)]">{label}</span>}
          </div>
          {telemetry && (
            <span className="text-[10px] text-[var(--text-secondary)] opacity-80">
              {telemetry}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className={contentClassName}>{children}</div>
    </Component>
  );
}
