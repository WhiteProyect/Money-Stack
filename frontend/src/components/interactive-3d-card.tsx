'use client';

import { useState, useRef, type ReactNode, type MouseEvent } from 'react';

interface Interactive3DCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  maxTilt?: number;
}

export default function Interactive3DCard({
  children,
  className = '',
  glowColor = 'rgba(255, 255, 255, 0.15)',
  maxTilt = 8,
}: Interactive3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const pctX = Math.round((x / rect.width) * 100);
    const pctY = Math.round((y / rect.height) * 100);

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`);
    setGlarePosition({ x: pctX, y: pctY, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Reflejo especular que sigue al cursor */}
      <div
        className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 240px at ${glarePosition.x}% ${glarePosition.y}%, ${glowColor}, transparent 70%)`,
          opacity: glarePosition.opacity,
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
