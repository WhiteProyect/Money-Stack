import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // El panel admin y el formulario no aportan al indexado.
        disallow: ['/admin', '/booking'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
