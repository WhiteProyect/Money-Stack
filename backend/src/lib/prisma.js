'use strict';

const { PrismaClient } = require('@prisma/client');
const { isProd } = require('../config/env');

const prisma = new PrismaClient({
  log: isProd ? ['error'] : ['warn', 'error'],
});

module.exports = prisma;
