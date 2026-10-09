'use strict';

const { Prisma } = require('@prisma/client');
const { isProd } = require('../config/env');

function notFound(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Recurso no encontrado' } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let code = err.isOperational ? err.code : 'INTERNAL_ERROR'; // nunca filtrar códigos internos
  let message = err.isOperational ? err.message : 'Error interno del servidor';

  if (err.type === 'entity.parse.failed') {
    status = 400; code = 'INVALID_JSON'; message = 'JSON inválido';
  } else if (err.type === 'entity.too.large') {
    status = 413; code = 'PAYLOAD_TOO_LARGE'; message = 'Cuerpo de la petición demasiado grande';
  } else if (err.message === 'CORS_NOT_ALLOWED') {
    status = 403; code = 'CORS_NOT_ALLOWED'; message = 'Origen no permitido';
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') { status = 409; code = 'CONFLICT'; message = 'El registro ya existe'; }
    else if (err.code === 'P2025') { status = 404; code = 'NOT_FOUND'; message = 'Registro no encontrado'; }
    else if (err.code === 'P2023') { status = 400; code = 'INVALID_ID'; message = 'Identificador inválido'; }
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401; code = 'INVALID_TOKEN'; message = 'Token inválido o expirado';
  }

  if (status >= 500) console.error(err); // 5xx siempre al log, nunca al cliente

  res.status(status).json({
    error: {
      code,
      message,
      ...(err.isOperational && err.details ? { details: err.details } : {}),
      ...(isProd ? {} : { stack: err.stack }),
    },
  });
}

module.exports = { notFound, errorHandler };
