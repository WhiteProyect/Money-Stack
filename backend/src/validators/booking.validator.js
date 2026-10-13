'use strict';

const { z } = require('zod');

// La fecha futura se valida contra el momento de la petición (no contra el
// arranque del proceso: el backend puede estar días corriendo).
const futureDate = z
  .string()
  .trim()
  .refine((v) => {
    const d = new Date(v);
    return !isNaN(d.getTime()) && d.getTime() > Date.now();
  }, { message: 'La fecha del evento debe ser futura' });

const isoDate = z
  .string()
  .trim()
  .refine((v) => !isNaN(Date.parse(v)), { message: 'Fecha inválida' });

const messageSchema = z
  .string()
  .trim()
  .min(20, 'El mensaje debe tener al menos 20 caracteres')
  .max(2000, 'El mensaje no puede superar los 2000 caracteres');

// Presupuesto: acepta número o string numérico; ausente => undefined.
const budgetSchema = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((v, ctx) => {
    if (v === undefined || v === null || v === '') return v === null ? null : undefined;
    const cleaned = typeof v === 'number' ? String(v) : String(v).trim().replace(/[^\d.-]/g, '');
    const n = Number(cleaned);
    if (cleaned === '' || !Number.isFinite(n)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El presupuesto debe ser un número mayor o igual a 0' });
      return z.NEVER;
    }
    return n;
  })
  .refine((v) => v === undefined || v === null || v >= 0, {
    message: 'El presupuesto debe ser un número mayor o igual a 0',
    path: ['budget'],
  });

// Honeypot: debe venir vacío. Si viene con valor, se responde 201 igual y se
// descarta (no se rechaza la petición).
const honeypotSchema = z
  .string()
  .trim()
  .max(255)
  .optional()
  .default('');

const bookingCreateSchema = z
  .object({
    requesterName: z
      .string()
      .trim()
      .min(2, 'El nombre es obligatorio')
      .max(120),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Correo inválido')
      .max(254),
    phone: z
      .string()
      .trim()
      .min(7, 'El teléfono es obligatorio')
      .max(30),
    organization: z.string().trim().max(120).nullable().optional(),
    eventType: z
      .string()
      .trim()
      .min(2, 'El tipo de evento es obligatorio')
      .max(80),
    eventDate: futureDate,
    city: z
      .string()
      .trim()
      .min(2, 'La ciudad es obligatoria')
      .max(80),
    venue: z.string().trim().max(160).nullable().optional(),
    budget: budgetSchema,
    message: messageSchema,
    consentData: z.boolean().refine((v) => v === true, {
      message: 'Debes aceptar el tratamiento de datos (Ley 1581 de Colombia)',
      path: ['consentData'],
    }),
    artistId: z.string().uuid('ID de artista inválido').nullable().optional(),
    // honeypot: si viene lleno se descarta, pero no se rechaza la petición.
    website: honeypotSchema,
  })
  .strict();

// Admin: filtros y paginación.
const bookingListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(['PENDING', 'IN_REVIEW', 'ACCEPTED', 'REJECTED', 'CANCELLED']).optional(),
    artistId: z.string().uuid('ID de artista inválido').optional(),
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
    search: z.string().trim().max(120).optional(),
  })
  .strict();

const bookingIdParamSchema = z
  .object({
    id: z.string().uuid('ID inválido'),
  })
  .strict();

// Admin: PATCH (status + adminNotes).
const bookingStatusTransitionSchema = z
  .object({
    status: z.enum(['PENDING', 'IN_REVIEW', 'ACCEPTED', 'REJECTED', 'CANCELLED']),
    adminNotes: z.string().trim().max(4000).nullable().optional(),
  })
  .strict()
  .refine((d) => d.status !== undefined, { message: 'El campo status es obligatorio' });

module.exports = {
  bookingCreateSchema,
  bookingListQuerySchema,
  bookingIdParamSchema,
  bookingStatusTransitionSchema,
  messageSchema,
  honeypotSchema,
};
