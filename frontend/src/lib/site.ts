// URLs canónicas del sitio (SEO): única fuente para sitemap, robots y JSON-LD.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/+$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
