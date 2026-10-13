import Link from 'next/link';
import type { Pagination as PaginationType } from '@/lib/types';

function pageHref(basePath: string, page: number, filters: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v) sp.set(k, v);
  }
  if (page > 1) sp.set('page', String(page));
  else sp.delete('page');
  const qsStr = sp.toString();
  return qsStr ? `${basePath}?${qsStr}` : basePath;
}

export default function Pagination({
  pagination,
  basePath,
  filters = {},
}: {
  pagination: PaginationType;
  basePath: string;
  filters?: Record<string, string | undefined>;
}) {
  if (pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;
  const prev = page > 1 ? pageHref(basePath, page - 1, filters) : null;
  const next = page < totalPages ? pageHref(basePath, page + 1, filters) : null;

  const btn =
    'inline-flex items-center gap-1 rounded-full border border-[var(--depth-4)] px-4 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)]';

  return (
    <nav aria-label="Paginación" className="mt-8 flex items-center justify-center gap-4">
      {prev ? (
        <Link href={prev} rel="prev" className={`${btn} text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]`}>
          ← Anteriores
        </Link>
      ) : (
        <span className={`${btn} cursor-not-allowed text-[var(--text-muted)] opacity-40`} aria-disabled="true">
          ← Anteriores
        </span>
      )}

      <span className="hud text-xs">
        Página {page} de {totalPages} · {total} en total
      </span>

      {next ? (
        <Link href={next} rel="next" className={`${btn} text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]`}>
          Siguientes →
        </Link>
      ) : (
        <span className={`${btn} cursor-not-allowed text-[var(--text-muted)] opacity-40`} aria-disabled="true">
          Siguientes →
        </span>
      )}
    </nav>
  );
}
