'use client';

// Componentes de animación con Motion.
// Reglas:
// - Respetar prefers-reduced-motion automáticamente.
// - Respetar el interruptor .fx-off del sitio.
// - Animaciones sutiles, atmosféricas y no intrusivas.

import React, { useEffect, useState } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

export function MotionFade({
  children,
  delay = 0,
  duration = 0.4,
  className,
  ...props
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
} & HTMLMotionProps<'div'>) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const isFxOff = document.documentElement.classList.contains('fx-off');
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduceMotion(isFxOff || isReduced);
  }, []);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionStagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
