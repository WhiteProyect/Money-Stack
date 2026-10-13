'use strict';

const { z } = require('zod');

const urlHttps = z
  .string()
  .trim()
  .refine((v) => !v || /^(https:\/\/)/.test(v), {
    message: 'Debe ser una URL HTTPS',
  });

const dateTime = z
  .string()
  .trim()
  .refine((v) => !isNaN(Date.parse(v)), { message: 'Fecha inválida' });

// Precio en COP: acepta número o string numérico. Si no viene (undefined o '')
// devuelve undefined para que PATCH no lo borre; si viene inválido, error.
const priceSchema = z
  .union([z.string(), z.number()])
  .optional()
  .transform((v, ctx) => {
    if (v === undefined || v === '') return undefined;
    const cleaned = typeof v === 'number' ? String(v) : String(v).trim().replace(/[^\d.-]/g, '');
    const n = Number(cleaned);
    if (cleaned === '' || !Number.isFinite(n)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El precio debe ser un número mayor o igual a 0' });
      return z.NEVER;
    }
    return n;
  })
  .refine((v) => v === undefined || v >= 0, {
    message: 'El precio debe ser un número mayor o igual a 0',
  });

// Respuesta pública: acepta null en campos opcionales (los servicios normalizan a null).
const eventPublicFields = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
  venueName: z.string().trim().min(1),
  address: z.string().trim().nullable().optional(),
  city: z.string().trim().nullable().optional(),
  startsAt: z.string(),
  endsAt: z.string().nullable().optional(),
  coverUrl: urlHttps.nullable().optional(),
  ticketUrl: urlHttps.nullable().optional(),
  price: z.number().nullable().optional(),
  capacity: z.number().int().nullable().optional(),
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
    .nullable()
    .optional(),
});

// Campos aceptados en create/update (admin).
const eventFields = z.object({
  title: z.string().trim().min(2, 'El título debe tener al menos 2 caracteres').max(160),
  slug: z
    .string()
    .trim()
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede tener letras, números y guiones'),
  description: z.string().trim().max(6000).nullable().optional(),
  venueName: z.string().trim().min(2, 'El nombre del venue es obligatorio').max(160),
  address: z.string().trim().max(240).nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
  startsAt: dateTime,
  endsAt: dateTime.optional(),
  coverUrl: urlHttps.nullable().optional(),
  ticketUrl: urlHttps.nullable().optional(),
  price: priceSchema,
  capacity: z.number().int().min(1).max(10_000_000).nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'FINISHED']).optional(),
});

// PATCH: al menos un campo.
const updateEventSchema = eventFields
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Envía al menos un campo' });

// Create: title, venueName y startsAt obligatorios (slug opcional: se genera).
const createEventSchema = eventFields
  .partial()
  .refine((d) => d.title && d.venueName && d.startsAt, {
    message: 'title, venueName y startsAt son obligatorios al crear',
  });

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
