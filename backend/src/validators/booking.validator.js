'use strict';

const { z } = require('zod');

const now = new Date();
const futureDate = z
  .string()
  .trim()
  .refine((v) => {
    const d = new Date(v);
    return !isNaN(d.getTime()) && d > now;
  }, { message: 'La fecha del evento debe ser futura' });

const messageSchema = z
  .string()
  .trim()
  .min(20, 'El mensaje debe tener al menos 20 caracteres')
  .max(2000, 'El mensaje no puede superar los 2000 caracteres');

// Honeypot: debe venir vacío. Si viene con valor, lo capturamos pero
// no rechazamos — el AGENTS.md pide responder 201 igual y descartar.
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
    organization: z.string().trim().max(120).optional(),
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
    venue: z.string().trim().max(160).optional(),
    budget: z
      .string()
      .trim()
      .optional()
      .transform((v) => {
        if (!v) return null;
        const n = Number(v.replace(/[^\\d.-]/g, ''));
        if (!Number.isFinite(n) || n < 0) return null;
        return n;
      })
      .refine((v) => v === null || v >= 0, {
        message: 'El presupuesto debe ser un número mayor o igual a 0',
        path: ['budget'],
      }),
    message: messageSchema,
    consentData: z.boolean().refine((v) => v === true, {
      message: 'Debes aceptar el tratamiento de datos (Ley 1581 de Colombia)',
      path: ['consentData'],
    }),
    artistId: z.string().uuid('ID de artista inválido').optional(),
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
    startDate: z.string().trim().max(100).optional(),
    endDate: z.string().trim().max(100).optional(),
    search: z.string().trim().max(120).optional(),
  })
  .strict();

const bookingIdParamSchema = z
  .object({
    id: z.string().uuid('ID inválido'),
  })
  .strict();

// Admin: PATCH (status + adminNotes). status es el campo principal; adminNotes opcional.
const bookingStatusTransitionSchema = z
  .object({
    status: z.enum(['PENDING', 'IN_REVIEW', 'ACCEPTED', 'REJECTED', 'CANCELLED']),
    adminNotes: z.string().trim().max(4000).optional(),
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
