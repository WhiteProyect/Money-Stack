'use strict';

const env = require('../config/env');
const AppError = require('../utils/AppError');

// Defensa extra contra CSRF en endpoints que usan la cookie (refresh/logout):
// si el navegador envía Origin y no está en la lista blanca, se rechaza.
function requireTrustedOrigin(req, res, next) {
  const { origin } = req.headers;
  if (origin && !env.corsOrigins.includes(origin)) {
    return next(new AppError('Origen no permitido', 403, 'CORS_NOT_ALLOWED'));
  }
  return next();
}

module.exports = requireTrustedOrigin;
