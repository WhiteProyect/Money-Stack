'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const { globalLimiter } = require('./middlewares/rateLimiters');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

// Detrás de Nginx/Cloudflare/PaaS: necesario para que rate-limit vea la IP real
app.set('trust proxy', env.TRUST_PROXY);
app.disable('x-powered-by');

// ── Seguridad de cabeceras ──
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: { 'default-src': ["'none'"], 'frame-ancestors': ["'none'"] }, // API pura
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
    hsts: env.isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    referrerPolicy: { policy: 'no-referrer' },
  })
);

// ── CORS con lista blanca ──
app.use(
  cors({
    origin(origin, cb) {
      // Sin Origin = curl/servidor-a-servidor/health checks; los navegadores siempre lo envían
      if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('CORS_NOT_ALLOWED'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 600,
  })
);

// ── Rate limit global + parsers con límite de tamaño ──
app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());

// ── Health check (para el balanceador / uptime monitor) ──
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));

// ── API ──
app.use('/api/v1', routes);

// ── 404 y manejo centralizado de errores (siempre al final) ──
app.use(notFound);
app.use(errorHandler);

module.exports = app;
