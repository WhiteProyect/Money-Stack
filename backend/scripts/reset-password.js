'use strict';

// Script seguro para restablecer la contraseña de un administrador
// Uso: node scripts/reset-password.js <email> <nueva_contraseña>

const prisma = require('../src/lib/prisma');
const { passwordSchema, hashPassword } = require('../src/utils/password');

async function main() {
  const emailArg = process.argv[2];
  const newPasswordArg = process.argv[3];

  if (!emailArg) {
    console.log('Uso: node scripts/reset-password.js <email> <nueva_contraseña>');
    console.log('\nAdmins registrados actualmente:');
    const admins = await prisma.adminUser.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    console.table(admins);
    return;
  }

  const email = emailArg.trim().toLowerCase();
  const admin = await prisma.adminUser.findUnique({ where: { email } });

  if (!admin) {
    console.error(`❌ No se encontró ningún administrador con el correo: ${email}`);
    console.log('\nAdmins existentes:');
    const admins = await prisma.adminUser.findMany({
      select: { email: true, name: true, role: true },
    });
    console.table(admins);
    process.exitCode = 1;
    return;
  }

  if (!newPasswordArg) {
    console.error('❌ Falta indicar la nueva contraseña.');
    console.log('Requisitos: mín. 12 caracteres, al menos una mayúscula, una minúscula y un número.');
    console.log(`Ejemplo: node scripts/reset-password.js ${email} "MiPasswordSeguro2026!"`);
    process.exitCode = 1;
    return;
  }

  const validation = passwordSchema.safeParse(newPasswordArg);
  if (!validation.success) {
    console.error('❌ La contraseña no cumple con la política de seguridad:');
    validation.error.issues.forEach((issue) => console.error(`  - ${issue.message}`));
    process.exitCode = 1;
    return;
  }

  const newHash = await hashPassword(newPasswordArg);

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash: newHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  // Revocar sesiones activas anteriores
  const revoked = await prisma.refreshToken.deleteMany({
    where: { adminId: admin.id },
  });

  console.log(`✅ Contraseña restablecida exitosamente para ${admin.name} (${admin.email}).`);
  console.log(`🔒 Se revocaron ${revoked.count} sesiones previas.`);
  console.log('👉 Ya puedes iniciar sesión con tu nueva contraseña.');
}

main()
  .catch((err) => {
    console.error('❌ Error inesperado:', err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
