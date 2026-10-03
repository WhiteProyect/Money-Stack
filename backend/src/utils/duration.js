'use strict';

const UNITS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

// '15m' -> 900000 | '7d' -> 604800000
function parseDuration(str) {
  const match = /^(\d+)([smhd])$/.exec(str);
  if (!match) throw new Error(`Duración inválida: "${str}" (usa formatos como 15m, 12h, 7d)`);
  return Number(match[1]) * UNITS[match[2]];
}

module.exports = { parseDuration };
