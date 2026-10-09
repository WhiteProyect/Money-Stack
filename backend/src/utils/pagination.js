'use strict';

const { z } = require('zod');

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'La página debe ser al menos 1').default(1),
  limit: z.coerce.number().int().min(1, 'El límite debe ser al menos 1').max(100, 'El límite máximo es 100').default(20),
});

function getPagination({ page = 1, limit = 20 } = {}) {
  const p = Number(page) || 1;
  const l = Number(limit) || 20;
  return {
    skip: (p - 1) * l,
    take: l,
  };
}

function buildPaginated(data, total, { page = 1, limit = 20 } = {}) {
  const p = Number(page) || 1;
  const l = Number(limit) || 20;
  return {
    data,
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l),
    },
  };
}

module.exports = {
  paginationSchema,
  getPagination,
  buildPaginated,
};
