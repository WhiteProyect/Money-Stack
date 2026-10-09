# Money-Stack: contexto para agentes

Plataforma de un sello discográfico (artistas, eventos, bookings) en Caucasia, Colombia.
Este archivo es la fuente de verdad del proyecto. Léelo completo antes de tocar código.

## 1. Stack y arquitectura del backend (obligatoria)
Node.js 20+, Express 4 (CommonJS, 'use strict'), PostgreSQL + Prisma 6, zod, bcrypt,
jsonwebtoken, helmet, cors, express-rate-limit, cookie-parser.

- Capas: routes -> controllers -> services. SOLO los services usan Prisma.
- Validación con zod en `src/validators` + middleware `validate()`; esquemas `.strict()`.
- Controllers envueltos en `asyncHandler`. Errores con `AppError` (mensajes en español).
- Formato de respuestas: éxito `{ data }`, listados `{ data, pagination: { page, limit, total, totalPages } }`,
  error `{ error: { code, message, details? } }`.
- Paginación con `src/utils/pagination.js` (page>=1, limit 1..100, default 20).
- Nada se borra: admins, artistas y eventos se desactivan o cancelan.
- Roles: SUPER_ADMIN (todo, siempre pasa authorize), ADMIN (contenido + bookings),
  EDITOR (crea y edita artistas y eventos; NO bookings ni usuarios).

## 2. Seguridad (no negociable)
- Nunca devolver `passwordHash` ni tokens en respuestas ni logs.
- Refresh token solo en cookie httpOnly `ms_refresh` (path /api/v1/auth), guardado como HMAC
  en la BD, con rotación y detección de reuso. El access token (JWT, 15 min) va en memoria del cliente.
- Rutas admin: `authenticate` ANTES de `authorize(...)`. `authenticate` consulta la BD en cada petición.
- Todo input pasa por zod. No agregar dependencias sin avisar y justificar.
- No leer ni imprimir `.env` (solo `.env.example`). No ejecutar comandos destructivos sin preguntar.
- Datos personales de bookings: se pide consentimiento explícito (Ley 1581 de Colombia).

## 3. Estado actual
Hecho: Fase 1 (auth: login, refresh rotativo, logout, logout-all, /me, bloqueo de cuenta),
Fase 2 (gestión de admins, cambio de contraseña, paginación reutilizable).

### Pendientes inmediatos (verificar si ya están aplicados; si no, aplicarlos primero)
Lote A:
1. Refresh: en la ventana de gracia (REUSE_GRACE_MS) o si la revocación condicional falla,
   lanzar `AppError('Refresco en curso, reintenta', 409, 'REFRESH_RACE')`. En el controller,
   `clearRefreshCookie` SOLO si `err.code === 'SESSION_EXPIRED'`.
2. Limitadores separados: `authLimiter` solo para /login; `refreshLimiter` (límite 30,
   skipSuccessfulRequests true) para /refresh.
3. errorHandler: mapear Prisma P2023 a 400 `INVALID_ID`. NO mapear PrismaClientValidationError a 400.
4. `expiresIn` numérico en segundos del ACCESS token (`env.accessTtlSeconds`), no del refresh.
Lote B:
5. schema.prisma: `@@index([handledById])` en BookingRequest y `@@index([createdById])` en Event.
   Migración: `npx prisma migrate dev --name add_fk_indexes`.
6. server.js: ejecutar `authService.purgeExpiredTokens()` al arrancar y cada 24 h con
   `setInterval(...).unref()`, dentro de try/catch.
Pendientes de Fase 2:
7. `resetPassword(actorId, id, newPassword)`: si `id === actorId`, 409 `USE_CHANGE_PASSWORD`.
8. `adminUser.service.update()`: transacción con aislamiento Serializable; mapear Prisma P2034
   a 409 `CONCURRENT_UPDATE` en errorHandler.

## 4. Backend: fases que faltan (NO empezar hasta que el usuario lo pida)
**Fase 3, Artistas.** Público: `GET /artists` (solo activos; filtros genre, featured, search; paginado),
`GET /artists/:slug`. Admin (EDITOR+): `POST|GET /admin/artists`, `GET|PATCH /admin/artists/:id`
(desactivar con `isActive`, sin DELETE). Slug único generado desde el nombre (sin tildes; sufijo -2 si repite).
`socialLinks`: solo claves permitidas (instagram, spotify, youtube, tiktok, facebook, soundcloud, web),
URLs https. `imageUrl`/`coverUrl`: solo https. Las respuestas públicas no exponen campos internos.

**Fase 4, Eventos.** Público: `GET /events` (solo PUBLISHED; filtros upcoming/past, city, artistSlug;
orden por startsAt), `GET /events/:slug` con cartel (artistas activos ordenados por `order`,
`isHeadliner`). Admin (EDITOR+): CRUD en `/admin/events` (cancelar con `status`, sin DELETE),
`PUT /admin/events/:id/lineup` que reemplaza el cartel `[{ artistId, order, isHeadliner }]`.
Reglas: `endsAt > startsAt`, `price >= 0`, slug único, `ticketUrl` https.

**Fase 5, Bookings.** Público: `POST /bookings` (con `bookingLimiter`; `consentData` debe ser true;
`eventDate` futura; mensaje 20..2000 caracteres; campo honeypot `website` que debe venir vacío: si viene
lleno, responder 201 igual y descartar; guardar IP). Responde `201 { data: { id } }`.
Admin (ADMIN+): `GET /admin/bookings` (filtros status, artistId, rango de fechas, search; paginado),
`GET /admin/bookings/:id`, `PATCH /admin/bookings/:id` (`status`, `adminNotes`; registra `handledById`;
valida transiciones de estado). Sin DELETE.

**Fase 6, Cierre antes de desplegar.** Tests (Vitest/Jest + supertest) de auth y bookings; README y
colección Postman; OpenAPI con zod-to-openapi (no expuesto en producción sin protección); logs
estructurados (pino) con request id y secretos redactados; endpoint `/ready` que consulta la BD;
política de retención de bookings (anonimizar datos personales tras un plazo); subida de imágenes
(decisión pendiente: Cloudinary u otro); opcional `passwordChangedAt` para invalidar access tokens;
checklist de producción (HTTPS, `prisma migrate deploy`, backups, rotación de secretos, CORS y cookies finales).

## 5. Frontend (PROPUESTA: confirmar con el usuario antes de implementar)
**Stack propuesto:** Next.js (App Router) + TypeScript + Tailwind CSS con variables CSS para los tokens,
TanStack Query, React Hook Form + zod, Motion (animaciones), three.js u ogl solo para el efecto de
profundidad (carga diferida). Un solo proyecto con sitio público y panel en `/admin`.
Motivo: SEO y vistas previas al compartir enlaces (WhatsApp, Instagram) necesitan HTML renderizado en servidor.

**Contrato con la API:**
- Peticiones con `credentials: 'include'`. Access token SOLO en memoria (nunca localStorage).
- Un solo refresh a la vez; ante `REFRESH_RACE` (409) reintentar una vez; ante 401 `SESSION_EXPIRED`
  ir a login. Programar el refresh con `expiresIn` (segundos).
- Frontend y API deben compartir sitio (tudominio.com y api.tudominio.com) por la cookie SameSite=Lax.
- Mostrar `error.details` por campo en los formularios (código `VALIDATION_ERROR`).

**Dirección visual:** oscura y atmosférica, entre "depth map" (el brillo codifica la cercanía: lo cercano
más claro y nítido, lo lejano más oscuro y desenfocado, capas con parallax y niebla) y "night vision"
(monocromo con tinte fosforescente, grano, líneas de escaneo, viñeta, marcos tipo visor y textos tipo HUD
en monoespaciada). Paleta: negros, grises grafito y colores oscuros, con UN acento fosforescente.
Reglas: contraste AA en textos, efectos desactivables y respetar `prefers-reduced-motion`; el panel `/admin`
usa los mismos tokens pero sin efectos, con prioridad en la usabilidad.

**Páginas públicas:** Inicio, Artistas (filtro por género), Artista (`/artistas/[slug]`), Eventos
(próximos y pasados), Evento (`/eventos/[slug]`), Booking (formulario con consentimiento de datos),
El sello, política de datos, 404.
**Panel admin:** login, dashboard (bookings pendientes y próximos eventos), bookings, artistas, eventos
y cartel, administradores (solo SUPER_ADMIN), mi cuenta (cambio de contraseña).

**Fases del frontend:** F0 definición visual (tokens, tipografía, componentes clave, "style tile");
F1 cimientos (proyecto, tokens, layout, cliente API con refresh, estado de sesión); F2 sitio público con
datos reales; F3 efectos firma (hero con mapa de profundidad, overlay night vision); F4 formulario de
booking; F5 panel admin; F6 pulido (accesibilidad, rendimiento, SEO); F7 despliegue.

## 6. Forma de trabajar
Cambios mínimos y acotados a lo pedido. Un commit por tarea. No refactorizar por iniciativa propia.
Al terminar, responder solo con la lista de archivos tocados y las decisiones tomadas fuera de lo pedido.
