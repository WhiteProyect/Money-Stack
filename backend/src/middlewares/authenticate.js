'use strict';

const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/tokens');

// Verifica el JWT y además consulta la BD: si desactivas un admin o le cambias el rol,
// el efecto es inmediato (no hay que esperar a que expire su token).
const authenticate = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Autenticación requerida', 401, 'UNAUTHENTICATED');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError('Token inválido o expirado', 401, 'INVALID_TOKEN');
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
  if (!admin || !admin.isActive) {
    throw new AppError('Autenticación requerida', 401, 'UNAUTHENTICATED');
  }

  req.user = admin;
  next();
});

module.exports = authenticate;
