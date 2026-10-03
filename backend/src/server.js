'use strict';

const env = require('./config/env'); // valida el entorno antes de cualquier otra cosa
const app = require('./app');
const prisma = require('./lib/prisma');

async function start() {
  await prisma.$connect();
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Money-Stack API en puerto ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Timeouts frente a conexiones lentas (slowloris)
  server.headersTimeout = 20_000;
  server.requestTimeout = 30_000;
  server.keepAliveTimeout = 65_000; // > timeout típico de balanceadores (60s)

  const shutdown = (signal) => {
    console.log(`${signal} recibido, cerrando…`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref(); // cierre forzado
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => console.error('unhandledRejection:', reason));
  process.on('uncaughtException', (err) => { console.error('uncaughtException:', err); shutdown('uncaughtException'); });
}

start().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});
