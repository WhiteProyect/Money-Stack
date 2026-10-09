'use strict';

const prisma = require('../lib/prisma');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { comparePassword, hashPassword, needsRehash, dummyCompare } = require('../utils/password');
const { signAccessToken, generateRefreshToken, hashRefreshToken } = require('../utils/tokens');

// Ventana en la que reusar un refresh token recién rotado se considera una carrera
// legítima (dos pestañas refrescando a la vez) y no un robo de token.
const REUSE_GRACE_MS = 10_000;

// Mismo mensaje para "no existe", "contraseña mala", "inactivo" y "bloqueado":
// no se revela qué cuentas existen.
const invalidCredentials = () =>
  new AppError('Credenciales inválidas o cuenta bloqueada temporalmente', 401, 'INVALID_CREDENTIALS');
const sessionExpired = () => new AppError('Sesión inválida o expirada', 401, 'SESSION_EXPIRED');

const publicUser = (a) => ({ id: a.id, email: a.email, name: a.name, role: a.role });

async function issueSession(admin, meta, db = prisma) {
  const refreshToken = generateRefreshToken();
  await db.refreshToken.create({
    data: {
      tokenHash: hashRefreshToken(refreshToken),
      adminId: admin.id,
      expiresAt: new Date(Date.now() + env.refreshTtlMs),
      userAgent: meta.userAgent ? meta.userAgent.slice(0, 255) : null,
      ipAddress: meta.ip || null,
    },
  });
  return { accessToken: signAccessToken(admin), refreshToken, user: publicUser(admin) };
}

async function login(email, password, meta) {
  const admin = await prisma.adminUser.findUnique({ where: { email } });

  const locked = admin && admin.lockedUntil && admin.lockedUntil > new Date();
  if (!admin || !admin.isActive || locked) {
    await dummyCompare(password); // iguala tiempos de respuesta
    throw invalidCredentials();
  }

  if (!(await comparePassword(password, admin.passwordHash))) {
    // Incremento atómico: varios intentos simultáneos no se "pierden"
    const { failedLoginAttempts } = await prisma.adminUser.update({
      where: { id: admin.id },
      data: { failedLoginAttempts: { increment: 1 } },
      select: { failedLoginAttempts: true },
    });
    if (failedLoginAttempts >= env.MAX_FAILED_LOGINS) {
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: new Date(Date.now() + env.LOCK_MINUTES * 60_000),
        },
      });
    }
    throw invalidCredentials();
  }

  const data = { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() };
  if (needsRehash(admin.passwordHash)) data.passwordHash = await hashPassword(password);
  await prisma.adminUser.update({ where: { id: admin.id }, data });

  return issueSession(admin, meta);
}

// Rotación: cada refresh invalida el token usado y entrega uno nuevo.
async function refresh(rawToken, meta) {
  if (!rawToken) throw sessionExpired();

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashRefreshToken(rawToken) },
    include: { admin: true },
  });
  if (!stored) throw sessionExpired();

  if (stored.revokedAt) {
    // Un token ya usado reapareció: posible robo -> se cierran TODAS las sesiones de esa cuenta
    if (Date.now() - stored.revokedAt.getTime() > REUSE_GRACE_MS) {
      await prisma.refreshToken.updateMany({
        where: { adminId: stored.adminId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw sessionExpired();
    }
    throw new AppError('Refresco en curso, reintenta', 409, 'REFRESH_RACE');
  }

  if (stored.expiresAt <= new Date() || !stored.admin.isActive) throw sessionExpired();

  return prisma.$transaction(async (tx) => {
    // Revocación condicional: si otra petición ganó la carrera, count será 0
    const { count } = await tx.refreshToken.updateMany({
      where: { id: stored.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (count !== 1) throw new AppError('Refresco en curso, reintenta', 409, 'REFRESH_RACE');
    return issueSession(stored.admin, meta, tx);
  });
}

// Idempotente: cerrar una sesión ya cerrada no es un error
async function logout(rawToken) {
  if (!rawToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashRefreshToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function logoutAll(adminId) {
  await prisma.refreshToken.updateMany({
    where: { adminId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

function getProfile(adminId) {
  return prisma.adminUser.findUniqueOrThrow({
    where: { id: adminId },
    select: { id: true, email: true, name: true, role: true, lastLoginAt: true, createdAt: true },
  });
}

// Para la limpieza programada (Fase 6): borra vencidos y revocados con más de 30 días
async function purgeExpiredTokens() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
  const { count } = await prisma.refreshToken.deleteMany({
    where: { OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { lt: thirtyDaysAgo } }] },
  });
  return count;
}

async function changePassword(adminId, currentPassword, newPassword) {
  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) {
    throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
  }

  const isValid = await comparePassword(currentPassword, admin.passwordHash);
  if (!isValid) {
    throw new AppError('Contraseña actual incorrecta', 401, 'INVALID_CREDENTIALS');
  }

  const newHash = await hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.adminUser.update({
      where: { id: adminId },
      data: { passwordHash: newHash },
    });

    await tx.refreshToken.updateMany({
      where: { adminId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  });
}

module.exports = {
  login,
  refresh,
  logout,
  logoutAll,
  getProfile,
  purgeExpiredTokens,
  changePassword,
};
