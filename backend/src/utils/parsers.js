'use strict';

// Zona horaria del negocio: Colombia (UTC-5, sin horario de verano).
const COLOMBIA_OFFSET = '-05:00';
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// Fechas sin hora ("2026-12-24") se interpretan a las 00:00 de Colombia, no de UTC.
// Con hora/zona explícita se respeta tal cual.
function parseColombiaDate(value, { endOfDay = false } = {}) {
  const v = String(value).trim();
  if (DATE_ONLY.test(v)) {
    return new Date(`${v}T${endOfDay ? '23:59:59.999' : '00:00:00'}${COLOMBIA_OFFSET}`);
  }
  return new Date(v);
}

// Montos en COP escritos a la colombiana: "50.000", "1.250.000,50", "$ 50000".
// Devuelve NaN si no se puede interpretar.
function parseCop(value) {
  if (typeof value === 'number') return value;
  let s = String(value).trim().replace(/[\s$]/g, '');
  if (!/^-?[\d.,]+$/.test(s)) return NaN;
  const negative = s.startsWith('-');
  if (negative) s = s.slice(1);

  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  if (lastDot !== -1 && lastComma !== -1) {
    // El último separador es el decimal; el otro es de miles.
    const dec = Math.max(lastDot, lastComma);
    const intPart = s.slice(0, dec).replace(/[.,]/g, '');
    s = `${intPart}.${s.slice(dec + 1)}`;
  } else if (lastDot !== -1 || lastComma !== -1) {
    const sep = lastDot !== -1 ? '.' : ',';
    const parts = s.split(sep);
    const isThousands = parts.length > 2 || (parts.length === 2 && parts[1].length === 3);
    s = isThousands ? parts.join('') : `${parts[0]}.${parts[1]}`;
  }
  const n = Number(s);
  return negative ? -n : n;
}

module.exports = { parseColombiaDate, parseCop };
