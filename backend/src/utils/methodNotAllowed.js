'use strict';

const AppError = require('./AppError');

// Middleware para rutas DELETE no permitidas ("nada se borra"): responde 405
// con un AppError para que el errorHandler no lo convierta en INTERNAL_ERROR.
const methodNotAllowed = (message) => (req, res, next) =>
  next(new AppError(message, 405, 'METHOD_NOT_ALLOWED'));

module.exports = methodNotAllowed;
