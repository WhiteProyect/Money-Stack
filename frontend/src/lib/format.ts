// Formato de fechas y precios para el sitio público (es-CO).

const dateOpts: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};

const timeOpts: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
};

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', dateOpts).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', timeOpts).format(new Date(iso));
}

export function formatDateRange(startIso: string, endIso?: string | null): string {
  if (!endIso) return `${formatDate(startIso)} · ${formatTime(startIso)}`;
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${formatDate(startIso)} · ${formatTime(startIso)} – ${formatTime(endIso)}`;
  }
  return `${formatDate(startIso)} ${formatTime(startIso)} – ${formatDate(endIso)} ${formatTime(endIso)}`;
}

// 25000 -> "$25.000 COP" | null -> "Consultar"
export function formatPrice(cop?: number | null): string {
  if (cop === null || cop === undefined) return 'Consultar';
  if (cop === 0) return 'Entrada libre';
  return `${new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(cop)}`;
}
