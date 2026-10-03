'use strict';

// Crea el primer SUPER_ADMIN. Uso:  npm run db:seed
// Requiere en el .env: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD (y opcional SEED_ADMIN_NAME)

const { PrismaClient, Role } = require('@prisma/client');
const { passwordSchema, hashPassword } = require('../src/utils/password');

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || '';
  const name = (process.env.SEED_ADMIN_NAME || 'Super Admin').trim();

  if (!email || !password) {
    throw new Error('Define SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en tu .env');
  }

  const check = passwordSchema.safeParse(password);
  if (!check.success) {
    throw new Error(`SEED_ADMIN_PASSWORD no cumple la política:\n  - ${check.error.issues.map((i) => i.message).join('\n  - ')}`);
  }

  if (await prisma.adminUser.findUnique({ where: { email } })) {
    console.log(`ℹ️  ${email} ya existe: no se modificó nada.`);
    return;
  }

  await prisma.adminUser.create({
    data: { email, name, role: Role.SUPER_ADMIN, passwordHash: await hashPassword(password) },
  });
  console.log(`✅ SUPER_ADMIN creado: ${email}`);
  console.log('👉 Ahora borra SEED_ADMIN_PASSWORD de tu .env.');
}

main()
  .catch((err) => {
    console.error(`❌ ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
