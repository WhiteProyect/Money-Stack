'use strict';

require('dotenv').config();
const { z } = require('zod');
const { parseDuration } = require('../utils/duration');

const duration = (def) =>
  z.string().regex(/^\d+[smhd]$/, 'Formato inválido: usa 15m, 12h o 7d').default(def);

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().min(1),

    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET debe tener al menos 32 caracteres'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET debe tener al menos 32 caracteres'),
    JWT_ACCESS_EXPIRES_IN: duration('15m'),
    JWT_REFRESH_EXPIRES_IN: duration('7d'),

    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

    // Seguridad de sesión
    MAX_FAILED_LOGINS: z.coerce.number().int().min(3).max(20).default(5),
    LOCK_MINUTES: z.coerce.number().int().min(1).max(1440).default(15),
    COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    COOKIE_DOMAIN: z.string().optional().transform((v) => v || undefined),

    CORS_ORIGINS: z.string().min(1, 'CORS_ORIGINS es obligatorio'),
    TRUST_PROXY: z.coerce.number().int().min(0).default(1),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
    BOOKING_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  })
  .refine((e) => e.JWT_ACCESS_SECRET !== e.JWT_REFRESH_SECRET, {
    message: 'JWT_ACCESS_SECRET y JWT_REFRESH_SECRET deben ser distintos',
    path: ['JWT_REFRESH_SECRET'],
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1); // fail fast: nunca arrancar mal configurado
}

const env = parsed.data;

module.exports = {
  ...env,
  isProd: env.NODE_ENV === 'production',
  corsOrigins: env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
  accessTtlSeconds: parseDuration(env.JWT_ACCESS_EXPIRES_IN) / 1000,
  refreshTtlMs: parseDuration(env.JWT_REFRESH_EXPIRES_IN),
};
