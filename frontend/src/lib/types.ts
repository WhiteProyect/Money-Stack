// Tipos compartidos del contrato con la API (coinciden con las respuestas
// { data } / { data, pagination } del backend).

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export type SocialLinkKey =
  | 'instagram'
  | 'spotify'
  | 'youtube'
  | 'tiktok'
  | 'facebook'
  | 'soundcloud'
  | 'web';

export interface Artist {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  genres: string[];
  imageUrl?: string | null;
  coverUrl?: string | null;
  socialLinks?: Partial<Record<SocialLinkKey, string>> | null;
  isSigned: boolean;
  isBookable: boolean;
  isFeatured: boolean;
  isActive: boolean;
}

export interface EventArtistRef {
  artistId: string;
  name: string;
  slug: string;
  isHeadliner: boolean;
  order: number;
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'FINISHED';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  venueName: string;
  address?: string | null;
  city?: string | null;
  startsAt: string;
  endsAt?: string | null;
  coverUrl?: string | null;
  ticketUrl?: string | null;
  price?: number | null;
  capacity?: number | null;
  status: EventStatus;
  artists: EventArtistRef[];
  createdBy?: { id: string; name: string } | null;
}

export type BookingStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED';

export interface Booking {
  id: string;
  requesterName: string;
  email: string;
  phone: string;
  organization?: string | null;
  eventType: string;
  eventDate: string;
  city: string;
  venue?: string | null;
  budget?: number | null;
  message: string;
  artistId?: string | null;
  artist?: { id: string; name: string; slug: string } | null;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  // Solo en respuestas admin (GET/PATCH /admin/bookings):
  adminNotes?: string | null;
  handledById?: string | null;
  handledBy?: { id: string; name: string } | null;
}
