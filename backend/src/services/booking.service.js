'use strict';

const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { getPagination, buildPaginated } = require('../utils/pagination');
const { parseColombiaDate } = require('../utils/parsers');

// Transiciones de estado permitidas (de -> a). No se permite bajar de estado
// arbitrariamente: el flujo es PENDING -> IN_REVIEW -> (ACCEPTED|REJECTED|CANCELLED).
// CANCELLED puede aplicarse desde IN_REVIEW o desde PENDING si el admin lo desea.
// Clave "DE->A": un Set de arrays no funcionaría (los arrays se comparan por
// referencia y has() siempre daría false).
const ALLOWED_TRANSITIONS = new Set([
  'PENDING->IN_REVIEW',
  'IN_REVIEW->ACCEPTED',
  'IN_REVIEW->REJECTED',
  'IN_REVIEW->CANCELLED',
  'PENDING->CANCELLED',
  'PENDING->ACCEPTED',
  'PENDING->REJECTED',
  'ACCEPTED->CANCELLED', // una solicitud aceptada aún puede cancelarse
]);

function allowedTransition(current, next) {
  if (current === next) return true; // reaffirma sin cambio real
  return ALLOWED_TRANSITIONS.has(`${current}->${next}`);
}

function bookingPublicShape(b) {
  return {
    id: b.id,
    requesterName: b.requesterName,
    email: b.email,
    phone: b.phone,
    organization: b.organization ?? null,
    eventType: b.eventType,
    eventDate: b.eventDate.toISOString(),
    city: b.city,
    venue: b.venue ?? null,
    budget: b.budget != null ? Number(b.budget) : null,
    message: b.message,
    artistId: b.artistId ?? null,
    artist: b.artist
      ? { id: b.artist.id, name: b.artist.name, slug: b.artist.slug }
      : null,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

// Shape admin: agrega campos internos que NUNCA van en respuestas públicas
// (notas internas y quién atendió la solicitud).
function bookingAdminShape(b) {
  return {
    ...bookingPublicShape(b),
    adminNotes: b.adminNotes ?? null,
    handledBy: b.handledBy
      ? { id: b.handledBy.id, name: b.handledBy.name }
      : null,
    handledById: b.handledById ?? null,
  };
}

// Público: crear booking. El honeypot se descarta, consentData debe ser true,
// eventDate futura, mensaje 20..2000, se guarda la IP.
async function createPublic(data, ip) {
  // Normalizar campos de texto
  const safe = {
    requesterName: data.requesterName.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    organization: data.organization ? data.organization.trim() : null,
    eventType: data.eventType.trim(),
    eventDate: parseColombiaDate(data.eventDate),
    city: data.city.trim(),
    venue: data.venue ? data.venue.trim() : null,
    budget: data.budget != null ? data.budget : null,
    message: data.message.trim(),
    consentData: data.consentData === true,
    artistId: data.artistId || null,
    ipAddress: ip || null,
  };

  // consentData debe ser true (ya validado en zod, pero confirmamos)
  if (!safe.consentData) {
    throw new AppError('Debes aceptar el tratamiento de datos (Ley 1581 de Colombia)', 400, 'CONSENT_REQUIRED');
  }

  // eventDate debe ser futura (ya validada en zod, pero confirmamos)
  if (safe.eventDate <= new Date()) {
    throw new AppError('La fecha del evento debe ser futura', 400, 'EVENT_DATE_FUTURE');
  }

  // mensaje longitud (ya validada en zod)
  if (safe.message.length < 20 || safe.message.length > 2000) {
    throw new AppError('El mensaje debe tener entre 20 y 2000 caracteres', 400, 'MESSAGE_LENGTH');
  }

  const booking = await prisma.bookingRequest.create({
    data: safe,
    include: {
      artist: { select: { id: true, name: true, slug: true } },
    },
  });

  return { id: booking.id };
}

// Admin: listar con filtros y paginación. No devuelve campos internos
// más allá de lo definido en bookingPublicShape.
async function listAdmin(query = {}) {
  const { page, limit, status, artistId, startDate, endDate, search } = query;

  const where = {};

  if (status) where.status = status;

  if (artistId) {
    where.artistId = artistId;
  }

  if (startDate || endDate) {
    where.eventDate = {};
    if (startDate) where.eventDate.gte = parseColombiaDate(startDate);
    if (endDate) where.eventDate.lte = parseColombiaDate(endDate, { endOfDay: true });
  }

  if (search) {
    where.OR = [
      { requesterName: { contains: search.trim(), mode: 'insensitive' } },
      { email: { contains: search.trim(), mode: 'insensitive' } },
      { phone: { contains: search.trim(), mode: 'insensitive' } },
      { city: { contains: search.trim(), mode: 'insensitive' } },
      { eventType: { contains: search.trim(), mode: 'insensitive' } },
      { message: { contains: search.trim(), mode: 'insensitive' } },
      { organization: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  const { skip, take } = getPagination({ page, limit });

  const [raw, total] = await Promise.all([
    prisma.bookingRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        artist: { select: { id: true, name: true, slug: true } },
        handledBy: { select: { id: true, name: true } },
      },
    }),
    prisma.bookingRequest.count({ where }),
  ]);

  const data = raw.map((b) => bookingAdminShape(b));
  return buildPaginated(data, total, { page, limit });
}

async function getById(id) {
  const booking = await prisma.bookingRequest.findUnique({
    where: { id },
    include: {
      artist: { select: { id: true, name: true, slug: true } },
      handledBy: { select: { id: true, name: true } },
    },
  });

  if (!booking) {
    throw new AppError('Solicitud de booking no encontrada', 404, 'BOOKING_NOT_FOUND');
  }

  return bookingAdminShape(booking);
}

async function update(id, data, adminId) {
  const existing = await prisma.bookingRequest.findUnique({
    where: { id },
    include: { artist: { select: { id: true, name: true, slug: true } } },
  });

  if (!existing) {
    throw new AppError('Solicitud de booking no encontrada', 404, 'BOOKING_NOT_FOUND');
  }

  const nextStatus = data.status;

  // Validar transición de estado
  if (!allowedTransition(existing.status, nextStatus)) {
    throw new AppError(
      `No se puede cambiar de ${existing.status} a ${nextStatus}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  const updatePayload = {};

  if (nextStatus && nextStatus !== existing.status) {
    updatePayload.status = nextStatus;
  }

  if (data.adminNotes !== undefined) {
    updatePayload.adminNotes = data.adminNotes ? data.adminNotes.trim() : null;
  }

  // handledById: quien procesa la solicitud (solo si hay cambio real o notes)
  if (updatePayload.status || updatePayload.adminNotes) {
    updatePayload.handledById = adminId;
  }

  const updated = await prisma.bookingRequest.update({
    where: { id },
    data: updatePayload,
    include: {
      artist: { select: { id: true, name: true, slug: true } },
      handledBy: { select: { id: true, name: true } },
    },
  });

  return bookingAdminShape(updated);
}

module.exports = {
  createPublic,
  listAdmin,
  getById,
  update,
  bookingPublicShape,
};
