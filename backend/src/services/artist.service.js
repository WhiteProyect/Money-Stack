'use strict';

const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { getPagination, buildPaginated } = require('../utils/pagination');
const { artistPublicStub } = require('../validators/artist.validator');

// Síncrona: genera un slug candidato desde el nombre (sin acentos, minúsculas, etc.)
function slugify(name) {
  let base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);

  if (!base) base = 'artista';
  return base;
}

// Busca el primer sufijo libre para un slug base dado.
async function uniqueSlug(base) {
  let candidate = base;
  let idx = 2;
  while (true) {
    const existing = await prisma.artist.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}-${idx}`;
    idx += 1;
  }
}

async function listPublic(query = {}, options = {}) {
  const { page, limit, genre, featured, search } = query;
  const admin = options.admin === true;

  // Base: el público solo ve activos; el admin puede ver y filtrar ambos.
  const where = {};
  if (admin) {
    if (query.isActive === true) where.isActive = true;
    else if (query.isActive === false) where.isActive = false;
  } else {
    where.isActive = true;
  }

  if (genre) {
    where.genres = { hasSome: [genre.trim()] };
  }

  if (featured === true) {
    where.isFeatured = true;
  } else if (featured === false) {
    where.isFeatured = false;
  }

  if (search) {
    where.OR = [
      { name: { contains: search.trim(), mode: 'insensitive' } },
      { bio: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  const { skip, take } = getPagination({ page, limit });

  const [raw, total] = await Promise.all([
    prisma.artist.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
      skip,
      take,
    }),
    prisma.artist.count({ where }),
  ]);

  const data = raw.map((a) => artistPublicStub.parse(a));
  return buildPaginated(data, total, { page, limit });
}

async function getBySlug(slug) {
  const artist = await prisma.artist.findUnique({
    where: { slug: slug.trim() },
    include: { _count: { select: { bookings: true } } },
  });

  if (!artist || !artist.isActive) {
    throw new AppError('Artista no encontrado', 404, 'ARTIST_NOT_FOUND');
  }

  return artistPublicStub.parse(artist);
}

async function getById(id) {
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: { _count: { select: { bookings: true } } },
  });

  if (!artist) {
    throw new AppError('Artista no encontrado', 404, 'ARTIST_NOT_FOUND');
  }

  // En admin se pueden ver inactivos, pero el modelo público sigue siendo elStub
  return {
    ...artistPublicStub.parse(artist),
    _count: { bookings: artist._count?.bookings ?? 0 },
  };
}

async function create(data) {
  const baseSlug = slugify(data.name);
  const slug = await uniqueSlug(baseSlug);

  // Aplicar defaults explícitos para campos no enviados
  const safeData = {
    name: data.name.trim(),
    slug,
    bio: data.bio ? data.bio.trim() : null,
    genres: data.genres ?? [],
    imageUrl: data.imageUrl ?? null,
    coverUrl: data.coverUrl ?? null,
    socialLinks: data.socialLinks ?? null,
    isSigned: data.isSigned ?? true,
    isBookable: data.isBookable ?? true,
    isFeatured: data.isFeatured ?? false,
    isActive: true,
  };

  try {
    const created = await prisma.artist.create({ data: safeData });
    return artistPublicStub.parse(created);
  } catch (err) {
    if (err.code === 'P2002') {
      throw new AppError('El slug ya está en uso', 409, 'ARTIST_SLUG_IN_USE');
    }
    throw err;
  }
}

async function update(id, data) {
  // Verificar existencia (activo o no)
  const existing = await prisma.artist.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Artista no encontrado', 404, 'ARTIST_NOT_FOUND');
  }

  const updatePayload = { ...data };

  // Si cambia el nombre, regenerar slug manteniendo unicidad
  if (data.name && data.name.trim() !== existing.name) {
    updatePayload.slug = await uniqueSlug(slugify(data.name));
  }

  // Normalizar campos de texto
  if (updatePayload.bio !== undefined) {
    updatePayload.bio = updatePayload.bio ? updatePayload.bio.trim() : null;
  }
  if (updatePayload.genres !== undefined) {
    updatePayload.genres = (updatePayload.genres || []).map((g) => g.trim());
  }

  try {
    const updated = await prisma.artist.update({
      where: { id },
      data: updatePayload,
    });
    return artistPublicStub.parse(updated);
  } catch (err) {
    if (err.code === 'P2002') {
      throw new AppError('El slug ya está en uso', 409, 'ARTIST_SLUG_IN_USE');
    }
    throw err;
  }
}

module.exports = {
  listPublic,
  getBySlug,
  getById,
  create,
  update,
};
