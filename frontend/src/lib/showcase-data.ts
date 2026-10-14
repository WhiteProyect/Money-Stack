import type { Artist, EventItem } from './types';

export const SHOWCASE_ARTISTS: Artist[] = [
  {
    id: 'art-01',
    name: 'Migg Flow',
    slug: 'migg-flow',
    bio: 'Pionero del sonido Bajo Cauca Drill y Trap Latino. Letras crudas, producción pesada y una energía arrolladora en tarima que representa a Caucasia en toda Colombia.',
    genres: ['Trap Latino', 'Drill', 'Urbano'],
    imageUrl:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
    coverUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1400&auto=format&fit=crop',
    socialLinks: {
      spotify: 'https://open.spotify.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      tiktok: 'https://tiktok.com',
    },
    isSigned: true,
    isBookable: true,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'art-02',
    name: 'Valen Luna',
    slug: 'valen-luna',
    bio: 'Voz sensual y envolvente fusionando Afrobeat contemporáneo con neo-perreo y percusión tradicional del Caribe colombiano. Más de 4M de streams en su debut.',
    genres: ['Afrobeat', 'Neo-Perreo', 'Dancehall'],
    imageUrl:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop',
    coverUrl:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1400&auto=format&fit=crop',
    socialLinks: {
      spotify: 'https://open.spotify.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
    },
    isSigned: true,
    isBookable: true,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'art-03',
    name: 'K-Ozz',
    slug: 'k-ozz',
    bio: 'Rap directo de la Calle 20. Rimas filosas con estética club y bajos 808 que retumban en los parlantes de toda la ribera del río Cauca.',
    genres: ['Urbano', 'Hip-Hop', 'Trap Latino'],
    imageUrl:
      'https://images.unsplash.com/photo-1520523839898-50712825e3a7?q=80&w=1200&auto=format&fit=crop',
    coverUrl:
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1400&auto=format&fit=crop',
    socialLinks: {
      spotify: 'https://open.spotify.com',
      instagram: 'https://instagram.com',
    },
    isSigned: true,
    isBookable: true,
    isFeatured: true,
    isActive: true,
  },
  {
    id: 'art-04',
    name: 'Sintética',
    slug: 'sintetica',
    bio: 'DJ y productora insignia de la noche electrónica en Caucasia. Sus sets mezclan Latin Electronic, Deep Tech y polirritmias tropicales hipnóticas.',
    genres: ['Electrónica', 'Latin Club', 'Tech House'],
    imageUrl:
      'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=1200&auto=format&fit=crop',
    coverUrl:
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1400&auto=format&fit=crop',
    socialLinks: {
      spotify: 'https://open.spotify.com',
      soundcloud: 'https://soundcloud.com',
      instagram: 'https://instagram.com',
    },
    isSigned: true,
    isBookable: true,
    isFeatured: false,
    isActive: true,
  },
  {
    id: 'art-05',
    name: 'El Negro Rey',
    slug: 'el-negro-rey',
    bio: 'Perreo clásico con aderezos modernos. Especialista en encender discotecas y tarimas con coros pegadizos y flow caribeño inconfundible.',
    genres: ['Reggaeton', 'Urbano', 'Dancehall'],
    imageUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
    coverUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1400&auto=format&fit=crop',
    socialLinks: {
      spotify: 'https://open.spotify.com',
      instagram: 'https://instagram.com',
      tiktok: 'https://tiktok.com',
    },
    isSigned: true,
    isBookable: true,
    isFeatured: false,
    isActive: true,
  },
  {
    id: 'art-06',
    name: 'Yuri Beats',
    slug: 'yuri-beats',
    bio: 'El arquitecto sonoro detrás de los éxitos de Money-Stack. Productor multipremiado, beatmaker e ingeniero de mezcla con base en nuestro estudio central.',
    genres: ['Producción', 'Trap Latino', 'Afrobeat'],
    imageUrl:
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop',
    coverUrl:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1400&auto=format&fit=crop',
    socialLinks: {
      youtube: 'https://youtube.com',
      instagram: 'https://instagram.com',
    },
    isSigned: true,
    isBookable: true,
    isFeatured: true,
    isActive: true,
  },
];

export const SHOWCASE_EVENTS: EventItem[] = [
  {
    id: 'evt-01',
    title: 'Caucasia Fest 2026 // Edición Fuego',
    slug: 'caucasia-fest-2026-edicion-fuego',
    description:
      'El festival de música urbana y alternativa más esperado del Bajo Cauca. Tarima principal con pirotecnia, sonido envolvente y todo el roster del sello Money-Stack en vivo.',
    venueName: 'Estadio Municipal Orlando Aníbal Monroy',
    address: 'Av. El Pajonal, Caucasia',
    city: 'Caucasia',
    startsAt: '2026-11-15T18:00:00.000Z',
    endsAt: '2026-11-16T04:00:00.000Z',
    coverUrl:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    ticketUrl: 'https://tuboleta.com',
    price: 45000,
    capacity: 6500,
    status: 'PUBLISHED',
    artists: [
      { artistId: 'art-01', name: 'Migg Flow', slug: 'migg-flow', isHeadliner: true, order: 1 },
      { artistId: 'art-02', name: 'Valen Luna', slug: 'valen-luna', isHeadliner: false, order: 2 },
      { artistId: 'art-03', name: 'K-Ozz', slug: 'k-ozz', isHeadliner: false, order: 3 },
    ],
  },
  {
    id: 'evt-02',
    title: 'Bajo Cauca Sound System Club Night',
    slug: 'bajo-cauca-sound-system-club-night',
    description:
      'Una sesión de clubbing caliente: Afrobeat, Dancehall y Reggaeton hasta el amanecer con invitados sorpresa de la costa y el río.',
    venueName: 'Club Babylon Vip',
    address: 'Cra 20 # 14-32, Zona Rosa',
    city: 'Caucasia',
    startsAt: '2026-10-28T21:00:00.000Z',
    endsAt: '2026-10-29T05:00:00.000Z',
    coverUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    ticketUrl: 'https://tuboleta.com',
    price: 30000,
    capacity: 600,
    status: 'PUBLISHED',
    artists: [
      { artistId: 'art-02', name: 'Valen Luna', slug: 'valen-luna', isHeadliner: true, order: 1 },
      { artistId: 'art-04', name: 'Sintética', slug: 'sintetica', isHeadliner: false, order: 2 },
    ],
  },
  {
    id: 'evt-03',
    title: 'Money-Stack Showcase // Medellín Takeover',
    slug: 'money-stack-showcase-medellin-takeover',
    description:
      'Llevamos la energía de Caucasia a la capital de la montaña. Presentación exclusiva del catálogo, networking con programadores y firma de autógrafos.',
    venueName: 'Teatro Matacandelas',
    address: 'Calle 47 # 43-47, Centro',
    city: 'Medellín',
    startsAt: '2026-12-05T19:30:00.000Z',
    endsAt: '2026-12-06T01:30:00.000Z',
    coverUrl:
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1200&auto=format&fit=crop',
    ticketUrl: 'https://tuboleta.com',
    price: 55000,
    capacity: 450,
    status: 'PUBLISHED',
    artists: [
      { artistId: 'art-01', name: 'Migg Flow', slug: 'migg-flow', isHeadliner: true, order: 1 },
      { artistId: 'art-03', name: 'K-Ozz', slug: 'k-ozz', isHeadliner: false, order: 2 },
      { artistId: 'art-06', name: 'Yuri Beats', slug: 'yuri-beats', isHeadliner: false, order: 3 },
    ],
  },
  {
    id: 'evt-04',
    title: 'Secret Warehouse Session 04',
    slug: 'secret-warehouse-session-04',
    description:
      'Ubicación secreta revelada 2 horas antes a los compradores de entradas. Una inmersión de 8 horas en música electrónica y bajos oscuros.',
    venueName: 'Bodega 07 Caucasia',
    address: 'Sector Industrial',
    city: 'Caucasia',
    startsAt: '2026-12-19T22:00:00.000Z',
    endsAt: '2026-12-20T06:00:00.000Z',
    coverUrl:
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1200&auto=format&fit=crop',
    ticketUrl: 'https://tuboleta.com',
    price: 35000,
    capacity: 350,
    status: 'PUBLISHED',
    artists: [
      { artistId: 'art-04', name: 'Sintética', slug: 'sintetica', isHeadliner: true, order: 1 },
      { artistId: 'art-05', name: 'El Negro Rey', slug: 'el-negro-rey', isHeadliner: false, order: 2 },
    ],
  },
];

export const SHOWCASE_TRACKS = [
  {
    id: 'trk-1',
    title: 'Oro y Cemento',
    artist: 'Migg Flow ft. Yuri Beats',
    genre: 'Bajo Cauca Drill',
    duration: '2:54',
    bpm: 142,
    cover:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'trk-2',
    title: 'Río Arriba',
    artist: 'Valen Luna',
    genre: 'Afrobeat Latino',
    duration: '3:18',
    bpm: 104,
    cover:
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'trk-3',
    title: 'Bajo Cauca Anthem',
    artist: 'K-Ozz',
    genre: 'Trap Latino',
    duration: '2:45',
    bpm: 130,
    cover:
      'https://images.unsplash.com/photo-1520523839898-50712825e3a7?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'trk-4',
    title: 'Nocturna Caucasia (Extended)',
    artist: 'Sintética',
    genre: 'Latin Tech',
    duration: '4:12',
    bpm: 126,
    cover:
      'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=200&auto=format&fit=crop',
  },
];
