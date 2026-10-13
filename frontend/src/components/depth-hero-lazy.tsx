'use client';

// Carga diferida del efecto de profundidad (F3): el canvas solo se monta en
// el cliente y después del primer render, para no retrasar el LCP del hero.

import dynamic from 'next/dynamic';

const DepthHero = dynamic(() => import('./depth-hero'), {
  ssr: false,
  loading: () => null,
});

export default function DepthHeroLazy() {
  return <DepthHero />;
}
