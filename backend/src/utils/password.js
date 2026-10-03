'use strict';

const bcrypt = require('bcrypt');
const { z } = require('zod');
const env = require('../config/env');

// Política: 12+ caracteres, minúscula, mayúscula y número.
// bcrypt ignora todo lo que pase de 72 bytes, por eso se rechaza al final.
const passwordSchema = z
  .string()
  .min(12, 'La contraseña debe tener al menos 12 caracteres')
  .regex(/[a-z]/, 'Debe incluir una letra minúscula')
  .regex(/[A-Z]/, 'Debe incluir una letra mayúscula')
  .regex(/[0-9]/, 'Debe incluir un número')
  .refine((p) => Buffer.byteLength(p, 'utf8') <= 72, 'La contraseña es demasiado larga (máx. 72 bytes)');

const hashPassword = (plain) => bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS);
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

// Si subes BCRYPT_SALT_ROUNDS, los hashes viejos se actualizan solos en el próximo login
const needsRehash = (hash) => bcrypt.getRounds(hash) < env.BCRYPT_SALT_ROUNDS;

// Compara contra un hash falso cuando el usuario no existe: el tiempo de respuesta
// es el mismo y no se puede averiguar qué correos están registrados.
let dummyHashPromise;
async function dummyCompare(plain) {
  dummyHashPromise ??= bcrypt.hash('money-stack-dummy-password', env.BCRYPT_SALT_ROUNDS);
  await bcrypt.compare(plain, await dummyHashPromise);
}

module.exports = { passwordSchema, hashPassword, comparePassword, needsRehash, dummyCompare };