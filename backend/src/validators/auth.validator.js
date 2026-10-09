'use strict';

const { z } = require('zod');

const { passwordSchema } = require('../utils/password');

// En login NO se aplica la política de contraseñas (solo en crear/cambiar contraseña)
const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Correo inválido').max(254),
    password: z.string().min(1, 'La contraseña es obligatoria').max(128),
  })
  .strict();

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria').max(128),
    newPassword: passwordSchema,
  })
  .strict()
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'La nueva contraseña debe ser distinta de la actual',
    path: ['newPassword'],
  });

module.exports = { loginSchema, changePasswordSchema };
