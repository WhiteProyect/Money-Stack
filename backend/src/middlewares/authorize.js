'use strict';

const AppError = require('../utils/AppError');

// authorize('ADMIN') -> permite ADMIN y SUPER_ADMIN (el SUPER_ADMIN siempre pasa)
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AppError('Autenticación requerida', 401, 'UNAUTHENTICATED'));
  if (req.user.role === 'SUPER_ADMIN' || roles.includes(req.user.role)) return next();
  return next(new AppError('No tienes permisos para esta acción', 403, 'FORBIDDEN'));
};

module.exports = authorize;
