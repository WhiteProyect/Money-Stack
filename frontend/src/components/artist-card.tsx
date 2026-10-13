import Image from 'next/image';
import Link from 'next/link';
import type { Artist } from '@/lib/types';

export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link
      href={`/artistas/${artist.slug}`}
      className="group block rounded-xl border border-[var(--depth-4)] bg-[var(--depth-3)] p-4 transition-transform duration-200 hover:-translate-y-1 hover:border-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[var(--depth-2)]">
        {artist.imageUrl ? (
          <Image
            src={artist.imageUrl}
            alt={artist.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-[var(--text-muted)]"
            aria-hidden="true"
          >
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25}>
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 1 0-16 0" />
            </svg>
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="font-medium text-[var(--text-primary)]">{artist.name}</p>
        {artist.isFeatured && (
          <span className="mt-1 flex items-center gap-1 text-xs text-[var(--accent)]">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Destacado
          </span>
        )}
        {artist.genres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {artist.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="hud hud-accent inline-block rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px]"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
