'use strict';

const { z } = require('zod');

const SOCIAL_LINK_KEYS = [
  'instagram',
  'spotify',
  'youtube',
  'tiktok',
  'facebook',
  'soundcloud',
  'web',
];

const urlHttps = z
  .string()
  .trim()
  .refine((v) => !v || /^(https:\/\/)/.test(v), {
    message: 'Debe ser una URL HTTPS',
  });

const socialLinkEntry = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => !v || /^(https:\/\/)/.test(v), {
    message: 'Si se proporciona, debe ser una URL HTTPS',
  });

const socialLinksRecord = z.record(z.enum(SOCIAL_LINK_KEYS), socialLinkEntry);

// Respuesta pública: Prisma devuelve null en campos opcionales, por eso todos
// los campos opcionales aceptan null además de undefined.
const artistPublicStub = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  bio: z.string().trim().nullable().optional(),
  genres: z.array(z.string().trim().min(1)).default([]),
  imageUrl: urlHttps.nullable().optional(),
  coverUrl: urlHttps.nullable().optional(),
  socialLinks: socialLinksRecord.nullable().optional(),
  isSigned: z.boolean(),
  isBookable: z.boolean(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

// Campos aceptados tanto en create como en update; en update todos opcionales.
const artistFields = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120),
  bio: z.string().trim().max(4000).nullable().optional(),
  genres: z.array(z.string().trim().min(1).max(60)).max(12, 'Máximo 12 géneros').nullable().default([]),
  imageUrl: urlHttps.nullable().optional(),
  coverUrl: urlHttps.nullable().optional(),
  socialLinks: socialLinksRecord.nullable().optional(),
  isSigned: z.boolean().optional(),
  isBookable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).strict();

// Al crear name es obligatorio; el resto usa artistFields (opcional salvo name).
const createArtistSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(120),
  })
  .strict()
  .merge(artistFields)
  .refine((d) => Object.keys(d).length > 0, { message: 'Envía al menos un campo' });

// PATCH: todos los campos opcionales (incluido name), pero al menos uno debe venir.
const updateArtistSchema = artistFields
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Envía al menos un campo' });

// Público: lista con paginación.
const listArtistsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    genre: z.string().trim().max(60).optional(),
    featured: z
      .union([z.boolean(), z.enum(['true', 'false']).transform((v) => v === 'true')])
      .optional(),
    search: z.string().trim().max(120).optional(),
  })
  .strict();

// Admin: incluye el filtro isActive (ver inactivos/reactivar) y los campos
// internos que el público nunca ve.
const listAdminArtistsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    genre: z.string().trim().max(60).optional(),
    featured: z
      .union([z.boolean(), z.enum(['true', 'false']).transform((v) => v === 'true')])
      .optional(),
    search: z.string().trim().max(120).optional(),
    isActive: z
      .union([z.boolean(), z.enum(['true', 'false']).transform((v) => v === 'true')])
      .optional(),
  })
  .strict();

// Admin: detalle por ID.
const artistIdParamSchema = z
  .object({
    id: z.string().uuid('ID inválido'),
  })
  .strict();

// Público/admin: slug para rutas.
const artistSlugParamSchema = z
  .object({
    slug: z.string().trim().min(1).max(160),
  })
  .strict();

module.exports = {
  SOCIAL_LINK_KEYS,
  urlHttps,
  socialLinksSchema: socialLinksRecord,
  createArtistSchema,
  updateArtistSchema,
  listArtistsQuerySchema,
  listAdminArtistsQuerySchema,
  artistIdParamSchema,
  artistSlugParamSchema,
  artistPublicStub,
};
