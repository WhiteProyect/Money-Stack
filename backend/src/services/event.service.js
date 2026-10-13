'use strict';

const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { getPagination, buildPaginated } = require('../utils/pagination');
const { eventPublicFields } = require('../validators/event.validator');

function slugify(title) {
  let base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);

  if (!base) base = 'evento';
  return base;
}

async function uniqueSlug(base, excludeId = null) {
  let candidate = base;
  let idx = 2;
  while (true) {
    const where = { slug: candidate };
    if (excludeId) where.id = { not: excludeId };
    const existing = await prisma.event.findUnique({ where, select: { id: true } });
    if (!existing) return candidate;
    candidate = `${base}-${idx}`;
    idx += 1;
  }
}

// Resuelve el orden máximo actual del cartel para asignar ordenes secuenciales.
async function nextOrder(eventId) {
  const last = await prisma.eventArtist.findFirst({
    where: { eventId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });
  return (last ? last.order + 1 : 0);
}

async function listPublic(query = {}) {
  const { page, limit, upcoming, past, city, artistSlug } = query;

  // Filtro base: publicados.
  const where = { status: 'PUBLISHED' };

  // Filtro temporal desde startsAt
  const now = new Date();
  if (upcoming === true) {
    where.startsAt = { gte: now };
  } else if (past === true) {
    where.startsAt = { lt: now };
  }

  if (city) {
    where.city = city.trim();
  }

  if (artistSlug) {
    // Eventos que tienen al menos un artista con ese slug y que esté activo.
    where.artists = {
      some: {
        artist: {
          slug: artistSlug.trim(),
          isActive: true,
        },
      },
    };
  }

  const { skip, take } = getPagination({ page, limit });

  const [raw, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        artists: {
          where: { artist: { isActive: true } },
          orderBy: { order: 'asc' },
          include: { artist: { select: { id: true, name: true, slug: true } } },
        },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { startsAt: 'asc' },
      skip,
      take,
    }),
    prisma.event.count({ where }),
  ]);

  const data = raw.map((e) => publicShape(e));
  return buildPaginated(data, total, { page, limit });
}

async function getBySlug(slug) {
  const event = await prisma.event.findUnique({
    where: { slug: slug.trim() },
    include: {
      artists: {
        where: { artist: { isActive: true } },
        orderBy: { order: 'asc' },
        include: { artist: { select: { id: true, name: true, slug: true } } },
      },
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!event) {
    throw new AppError('Evento no encontrado', 404, 'EVENT_NOT_FOUND');
  }

  if (event.status === 'CANCELLED') {
    throw new AppError('Este evento fue cancelado', 410, 'EVENT_CANCELLED');
  }

  return publicShape(event);
}

async function getById(id) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      artists: {
        where: { artist: { isActive: true } },
        orderBy: { order: 'asc' },
        include: { artist: { select: { id: true, name: true, slug: true } } },
      },
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!event) {
    throw new AppError('Evento no encontrado', 404, 'EVENT_NOT_FOUND');
  }

  return publicShape(event);
}

async function create(data, actorId) {
  const startsAt = new Date(data.startsAt);
  const endsAt = data.endsAt ? new Date(data.endsAt) : null;

  // Reglas de negocio
  if (endsAt && endsAt <= startsAt) {
    throw new AppError('endsAt debe ser posterior a startsAt', 400, 'INVALID_DATES');
  }

  if (data.price !== null && data.price !== undefined && typeof data.price === 'number' && data.price < 0) {
    throw new AppError('El precio no puede ser negativo', 400, 'INVALID_PRICE');
  }

  const baseSlug = data.slug ? data.slug.trim() : slugify(data.title);
  const slug = await uniqueSlug(baseSlug);

  const event = await prisma.event.create({
    data: {
      title: data.title.trim(),
      slug,
      description: data.description ? data.description.trim() : null,
      venueName: data.venueName.trim(),
      address: data.address ? data.address.trim() : null,
      city: data.city || 'Caucasia',
      startsAt,
      endsAt: endsAt || null,
      coverUrl: data.coverUrl || null,
      ticketUrl: data.ticketUrl || null,
      price: data.price != null ? data.price : null,
      capacity: data.capacity || null,
      status: data.status || 'DRAFT',
      createdById: actorId,
    },
    include: {
      artists: {
        where: { artist: { isActive: true } },
        orderBy: { order: 'asc' },
        include: { artist: { select: { id: true, name: true, slug: true } } },
      },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return publicShape(event);
}

async function update(id, data, actorId) {
  const existing = await prisma.event.findUnique({
    where: { id },
    include: {
      artists: { include: { artist: true } },
    },
  });

  if (!existing) {
    throw new AppError('Evento no encontrado', 404, 'EVENT_NOT_FOUND');
  }

  const updatePayload = {};

  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.description !== undefined) updatePayload.description = data.description ? data.description.trim() : null;
  if (data.venueName !== undefined) updatePayload.venueName = data.venueName.trim();
  if (data.address !== undefined) updatePayload.address = data.address ? data.address.trim() : null;
  if (data.city !== undefined) updatePayload.city = data.city || 'Caucasia';
  if (data.coverUrl !== undefined) updatePayload.coverUrl = data.coverUrl || null;
  if (data.ticketUrl !== undefined) updatePayload.ticketUrl = data.ticketUrl || null;
  if (data.capacity !== undefined) updatePayload.capacity = data.capacity || null;
  if (data.status !== undefined) updatePayload.status = data.status;

  // Dates: solo si vienen explícitamente
  if (data.startsAt !== undefined) {
    const startsAt = new Date(data.startsAt);
    const endsAt = data.endsAt !== undefined ? new Date(data.endsAt) : existing.endsAt ? new Date(existing.endsAt) : null;
    if (endsAt && endsAt <= startsAt) {
      throw new AppError('endsAt debe ser posterior a startsAt', 400, 'INVALID_DATES');
    }
    updatePayload.startsAt = startsAt;
    if (data.endsAt !== undefined) updatePayload.endsAt = endsAt;
  } else if (data.endsAt !== undefined) {
    const endsAt = new Date(data.endsAt);
    if (endsAt <= existing.startsAt) {
      throw new AppError('endsAt debe ser posterior a startsAt', 400, 'INVALID_DATES');
    }
    updatePayload.endsAt = endsAt;
  }

  if (data.price !== undefined) {
    const price = data.price != null ? data.price : null;
    if (price !== null && price < 0) throw new AppError('El precio no puede ser negativo', 400, 'INVALID_PRICE');
    updatePayload.price = price;
  }

  // Slug: solo si se envía y cambia
  if (data.slug !== undefined) {
    const candidate = data.slug.trim();
    if (candidate !== existing.slug) {
      updatePayload.slug = await uniqueSlug(candidate, id);
    }
  }

  const updated = await prisma.event.update({
    where: { id },
    data: updatePayload,
    include: {
      artists: { include: { artist: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return publicShape(updated);
}

// Reemplaza el cartel completo. Solo artists activos pueden estar en el cartel.
async function setLineup(eventId, entries) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });
  if (!event) throw new AppError('Evento no encontrado', 404, 'EVENT_NOT_FOUND');

  // Verifica que los artists existan y estén activos
  const artistIds = entries.map((e) => e.artistId);
  const artists = await prisma.artist.findMany({
    where: { id: { in: artistIds } },
    select: { id: true, isActive: true },
  });
  const active = new Set(artists.filter((a) => a.isActive).map((a) => a.id));
  const inactive = artistIds.filter((id) => !active.has(id));
  if (inactive.length > 0) {
    throw new AppError('Algunos artistas no están activos', 400, 'INACTIVE_ARTIST');
  }

  // No más de un headliner por evento
  if (entries.filter((e) => e.isHeadliner).length > 1) {
    throw new AppError('Solo un headliner por evento', 400, 'MULTIPLE_HEADLINERS');
  }

  await prisma.$transaction(async (tx) => {
    // Reordenar: si no vienen orders, asignar secuencial a partir del máximo actual
    let orderOffset = 0;
    if (entries.every((e) => typeof e.order === 'number')) {
      orderOffset = await nextOrder(eventId);
      // Normalizar orders para evitar huecos; el orden del payload se mantiene relativo
    } else {
      orderOffset = await nextOrder(eventId);
    }

    const ordered = entries.map((e, i) => ({
      eventId,
      artistId: e.artistId,
      order: typeof e.order === 'number' ? e.order : orderOffset + i,
      isHeadliner: e.isHeadliner,
    }));

    await tx.eventArtist.deleteMany({ where: { eventId } });
    await tx.eventArtist.createMany({ data: ordered, skipDuplicates: false });
  });

  // Recargar para respuesta
  const withLineup = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      artists: {
        orderBy: { order: 'asc' },
        include: { artist: { select: { id: true, name: true, slug: true } } },
      },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return publicShape(withLineup);
}

function publicShape(event) {
  return eventPublicFields.parse({
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description ?? null,
    venueName: event.venueName,
    address: event.address ?? null,
    city: event.city ?? 'Caucasia',
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt ? event.endsAt.toISOString() : null,
    coverUrl: event.coverUrl ?? null,
    ticketUrl: event.ticketUrl ?? null,
    price: event.price != null ? Number(event.price) : null,
    capacity: event.capacity ?? null,
    status: event.status,
    artists: event.artists
      .map((ea) => ({
        artistId: ea.artist.id,
        name: ea.artist.name,
        slug: ea.artist.slug,
        isHeadliner: ea.isHeadliner,
        order: ea.order,
      }))
      .sort((a, b) => a.order - b.order),
    createdBy: event.createdBy
      ? { id: event.createdBy.id, name: event.createdBy.name }
      : null,
  });
}

module.exports = {
  listPublic,
  getBySlug,
  getById,
  create,
  update,
  setLineup,
};
