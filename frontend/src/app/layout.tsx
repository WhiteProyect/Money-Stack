import type { Metadata } from 'next';
import { SessionProvider } from '@/lib/session';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Money-Stack — Sello discográfico desde Caucasia',
    template: '%s — Money-Stack',
  },
  description:
    'Sello discográfico independiente desde Caucasia, Antioquia. Catálogo de artistas, agenda de eventos y sistema de bookings musicales.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Money-Stack',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {/* Aplica el estado de efectos ANTES del hidratare (sin parpadeo):
            fx-off si el usuario lo pidió o si el sistema pide reduced-motion. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var k='ms:fx',s=localStorage.getItem(k),r=matchMedia('(prefers-reduced-motion: reduce)').matches,e=s==='1'||(s===null&&!r);document.documentElement.classList.toggle('fx-off',!e)}catch(e){}",
          }}
        />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
