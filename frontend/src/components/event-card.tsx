import Image from 'next/image';
import Link from 'next/link';
import type { EventItem } from '@/lib/types';
import { formatDate } from '@/lib/format';

export default function EventCard({ event }: { event: EventItem }) {
  const headliner = event.artists.find((a) => a.isHeadliner);
  const others = event.artists.filter((a) => !a.isHeadliner);

  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group block rounded-xl border border-[var(--depth-4)] bg-[var(--depth-3)] p-4 transition-transform duration-200 hover:-translate-y-1 hover:border-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-[var(--depth-2)]">
        {event.coverUrl ? (
          <Image
            src={event.coverUrl}
            alt={`Portada de ${event.title}`}
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
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <time dateTime={event.startsAt}>{formatDate(event.startsAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{event.city ?? 'Caucasia'}</span>
          {event.status === 'CANCELLED' && (
            <span className="rounded-full bg-[rgba(255,125,139,0.15)] px-2 py-0.5 text-[var(--color-error,#ff7d8b)]">
              Cancelado
            </span>
          )}
        </div>
        <h3 className="mt-1 font-medium text-[var(--text-primary)]">{event.title}</h3>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{event.venueName}</p>
        {event.artists.length > 0 && (
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">
            {headliner && <span className="text-[var(--accent)]">{headliner.name}</span>}
            {others.length > 0 && (
              <>
                {headliner && <span className="mx-1 opacity-50">·</span>}
                {others.map((a, i) => (
                  <span key={a.artistId}>
                    {i > 0 && <span className="mx-1 opacity-50">·</span>}
                    {a.name}
                  </span>
                ))}
              </>
            )}
          </p>
        )}
      </div>
    </Link>
  );
}
