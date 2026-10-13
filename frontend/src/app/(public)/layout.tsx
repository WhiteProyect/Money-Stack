import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import NightVisionOverlay from '@/components/night-vision-overlay';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--depth-0)]"
      >
        Saltar al contenido
      </a>
      <NightVisionOverlay />
      <SiteHeader />
      <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
