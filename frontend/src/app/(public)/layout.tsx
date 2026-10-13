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
      <NightVisionOverlay />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
