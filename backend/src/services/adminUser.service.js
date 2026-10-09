'use strict';

const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { hashPassword } = require('../utils/password');
const { getPagination, buildPaginated } = require('../utils/pagination');

const adminSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  lockedUntil: true,
  createdAt: true,
  updatedAt: true,
};

async function list(query = {}) {
  const { page, limit, search, role, isActive } = query;
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  const { skip, take } = getPagination({ page, limit });

  const [data, total] = await Promise.all([
    prisma.adminUser.findMany({
      where,
      select: adminSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.adminUser.count({ where }),
  ]);

  return buildPaginated(data, total, { page, limit });
}

async function getById(id) {
  const admin = await prisma.adminUser.findUnique({
    where: { id },
    select: adminSelect,
  });

  if (!admin) {
    throw new AppError('Administrador no encontrado', 404, 'ADMIN_NOT_FOUND');
  }

  return admin;
}

async function create(data) {
  const passwordHash = await hashPassword(data.password);

  try {
    const admin = await prisma.adminUser.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        passwordHash,
      },
      select: adminSelect,
    });
    return admin;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError('Ese correo ya está registrado', 409, 'EMAIL_IN_USE');
    }
    throw err;
  }
}

async function update(actorId, id, data) {
  return prisma.$transaction(async (tx) => {
    const target = await tx.adminUser.findUnique({ where: { id } });
    if (!target) {
      throw new AppError('Administrador no encontrado', 404, 'ADMIN_NOT_FOUND');
    }

    const isDeactivatingSelf = data.isActive === false;
    const isChangingOwnRole = data.role !== undefined && data.role !== target.role;

    if (id === actorId && (isDeactivatingSelf || isChangingOwnRole)) {
      throw new AppError('No puedes desactivarte ni cambiar tu propio rol', 409, 'SELF_LOCKOUT');
    }

    const isTargetActiveSuperAdmin = target.role === 'SUPER_ADMIN' && target.isActive;
    const wouldDeactivate = data.isActive === false;
    const wouldDemote = data.role !== undefined && data.role !== 'SUPER_ADMIN';

    if (isTargetActiveSuperAdmin && (wouldDeactivate || wouldDemote)) {
      const otherSuperAdmins = await tx.adminUser.count({
        where: {
          role: 'SUPER_ADMIN',
          isActive: true,
          id: { not: id },
        },
      });

      if (otherSuperAdmins === 0) {
        throw new AppError('Debe existir al menos un SUPER_ADMIN activo', 409, 'LAST_SUPER_ADMIN');
      }
    }

    const roleChanged = data.role !== undefined && data.role !== target.role;
    if (data.isActive === false || roleChanged) {
      await tx.refreshToken.updateMany({
        where: { adminId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    try {
      const updated = await tx.adminUser.update({
        where: { id },
        data,
        select: adminSelect,
      });
      return updated;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError('Ese correo ya está registrado', 409, 'EMAIL_IN_USE');
      }
      throw err;
    }
  });
}

async function resetPassword(id, newPassword) {
  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) {
    throw new AppError('Administrador no encontrado', 404, 'ADMIN_NOT_FOUND');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.adminUser.update({
      where: { id },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await tx.refreshToken.updateMany({
      where: { adminId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  });
}

async function unlock(id) {
  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) {
    throw new AppError('Administrador no encontrado', 404, 'ADMIN_NOT_FOUND');
  }

  await prisma.adminUser.update({
    where: { id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
}

module.exports = {
  adminSelect,
  list,
  getById,
  create,
  update,
  resetPassword,
  unlock,
};
