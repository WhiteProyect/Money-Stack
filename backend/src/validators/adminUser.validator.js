'use strict';

const { z } = require('zod');
const { Role } = require('@prisma/client');
const { paginationSchema } = require('../utils/pagination');
const { passwordSchema } = require('../utils/password');

const idParamSchema = z
  .object({
    id: z.string().uuid('ID inválido'),
  })
  .strict();

const listQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(100, 'El término de búsqueda no puede superar los 100 caracteres').optional(),
  role: z.nativeEnum(Role, { errorMap: () => ({ message: 'Rol inválido' }) }).optional(),
  isActive: z
    .union([
      z.boolean(),
      z.enum(['true', 'false']).transform((v) => v === 'true'),
    ])
    .optional(),
});

const createAdminSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Correo inválido').max(254),
    name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    role: z.nativeEnum(Role, { errorMap: () => ({ message: 'Rol inválido' }) }),
    password: passwordSchema,
  })
  .strict();

const updateAdminSchema = z
  .object({
    name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).optional(),
    role: z.nativeEnum(Role, { errorMap: () => ({ message: 'Rol inválido' }) }).optional(),
    isActive: z.boolean().optional(),
    email: z.string().trim().toLowerCase().email('Correo inválido').max(254).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envía al menos un campo',
  });

const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
  })
  .strict();

module.exports = {
  idParamSchema,
  listQuerySchema,
  createAdminSchema,
  updateAdminSchema,
  resetPasswordSchema,
};
