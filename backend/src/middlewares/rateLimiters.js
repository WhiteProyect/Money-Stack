'use strict';

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const handler = (message) => (req, res) =>
  res.status(429).json({ error: { code: 'TOO_MANY_REQUESTS', message } });

// Límite global para toda la API
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: handler('Demasiadas solicitudes, intenta más tarde.'),
});

// Login: muy estricto contra fuerza bruta
const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true, // solo cuentan los intentos fallidos
  handler: handler('Demasiados intentos de acceso. Intenta de nuevo más tarde.'),
});

// Refresh de sesión
const refreshLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: handler('Demasiados intentos de refresco. Intenta de nuevo más tarde.'),
});

// Formulario público de booking: evita spam
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.BOOKING_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: handler('Has enviado demasiadas solicitudes. Intenta más tarde.'),
});

module.exports = { globalLimiter, authLimiter, refreshLimiter, bookingLimiter };
