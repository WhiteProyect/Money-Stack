'use strict';

const { z } = require('zod');

// En login NO se aplica la política de contraseñas (solo en crear/cambiar contraseña)
const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Correo inválido').max(254),
    password: z.string().min(1, 'La contraseña es obligatoria').max(128),
  })
  .strict();

module.exports = { loginSchema };
