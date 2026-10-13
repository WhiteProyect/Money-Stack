// Formato de fechas y precios para el sitio público (es-CO).

// Siempre hora de Colombia: el servidor (SSR) puede correr en UTC y el navegador
// del admin en otra zona; sin esto las fechas salen desfasadas.
const TZ = 'America/Bogota';

const dateOpts: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: TZ,
};

const timeOpts: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TZ,
};

const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: TZ });

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', dateOpts).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', timeOpts).format(new Date(iso));
}

export function formatDateRange(startIso: string, endIso?: string | null): string {
  if (!endIso) return `${formatDate(startIso)} · ${formatTime(startIso)}`;
  const sameDay = dayKey.format(new Date(startIso)) === dayKey.format(new Date(endIso));
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
