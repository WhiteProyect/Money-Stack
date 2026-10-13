'use strict';

const { z } = require('zod');

const urlHttps = z
  .string()
  .trim()
  .refine((v) => !v || /^(https:\/\/)/.test(v), {
    message: 'Debe ser una URL HTTPS',
  });

// Precio en COP: opcional, pero si se envía debe ser >= 0.
const priceSchema = z
  .string()
  .trim()
  .optional()
  .transform((v) => {
    if (!v) return null;
    const s = v.replace(/[^\d.-]/g, '');
    const n = Number(s);
    if (!Number.isFinite(n) || n < 0) return null; // permitido: el transform no debe fallar; la regla la aplica refine
    return n;
  })
  .refine((v) => v === null || v >= 0, {
    message: 'El precio debe ser un número mayor o igual a 0',
    path: ['price'],
  });

const dateTime = z
  .string()
  .trim()
  .refine((v) => !isNaN(Date.parse(v)), { message: 'Fecha inválida' });

const eventPublicFields = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  description: z.string().trim().optional(),
  venueName: z.string().trim().min(1),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  startsAt: z.string(),
  endsAt: z.string().optional(),
  coverUrl: urlHttps.optional(),
  ticketUrl: urlHttps.optional(),
  price: z.number().optional(),
  capacity: z.number().int().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'FINISHED']),
  artists: z
    .array(
      z.object({
        artistId: z.string().uuid(),
        name: z.string().trim().min(1),
        slug: z.string().trim().min(1),
        isHeadliner: z.boolean(),
        order: z.number().int(),
      })
    )
    .default([]),
  createdBy: z
    .object({
      id: z.string().uuid(),
      name: z.string().trim().min(1),
    })
    .optional(),
});

// Campos aceptados en create/update (admin). Todos opcionales salvo los obligatorios.
const eventFields = z.object({
  title: z.string().trim().min(2, 'El título debe tener al menos 2 caracteres').max(160),
  slug: z.string().trim().min(2, 'El slug debe tener al menos 2 caracteres').max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede tener letras, números y guiones'),
  description: z.string().trim().max(6000).optional(),
  venueName: z.string().trim().min(2, 'El nombre del venue es obligatorio').max(160),
  address: z.string().trim().max(240).optional(),
  city: z.string().trim().max(80).optional(),
  startsAt: dateTime,
  endsAt: dateTime.optional(),
  coverUrl: urlHttps.optional(),
  ticketUrl: urlHttps.optional(),
  price: priceSchema,
  capacity: z.number().int().min(1).max(10_000_000).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'FINISHED']).optional(),
});

// At least one field for PATCH.
const updateEventSchema = eventFields.partial().refine((d) => Object.keys(d).length > 0, { message: 'Envía al menos un campo' });

// Create: slug opcional, pero si no viene se genera desde title.
const createEventSchema = eventFields.partial().refine(
  (d) => d.title && d.venueName && d.startsAt,
  { message: 'title, venueName y startsAt son obligatorios al crear' }
);

// Lineup: reemplazo completo del cartel.
const lineupEntrySchema = z.object({
  artistId: z.string().uuid('ID de artista inválido'),
  order: z.number().int().min(0),
  isHeadliner: z.boolean(),
});

const lineupSchema = z
  .array(lineupEntrySchema)
  .min(1, 'El cartel debe tener al menos un artista')
  .max(24, 'Máximo 24 artistas en el cartel');

const lineupRequestSchema = z
  .object({
    lineup: lineupSchema,
  })
  .strict();

// Público: filtros y paginación.
const listEventsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    upcoming: z
      .union([z.boolean(), z.enum(['true', 'false']).transform((v) => v === 'true')])
      .optional(),
    past: z
      .union([z.boolean(), z.enum(['true', 'false']).transform((v) => v === 'true')])
      .optional(),
    city: z.string().trim().max(80).optional(),
    artistSlug: z.string().trim().max(160).optional(),
  })
  .strict();

const eventIdParamSchema = z
  .object({
    id: z.string().uuid('ID inválido'),
  })
  .strict();

const eventSlugParamSchema = z
  .object({
    slug: z.string().trim().min(1).max(160),
  })
  .strict();

module.exports = {
  urlHttps,
  eventPublicFields,
  createEventSchema,
  updateEventSchema,
  lineupEntrySchema,
  lineupSchema,
  lineupRequestSchema,
  listEventsQuerySchema,
  eventIdParamSchema,
  eventSlugParamSchema,
};
