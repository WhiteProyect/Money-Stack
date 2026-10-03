# 🎵 Money-Stack

Plataforma web y sistema de gestión integral para sello discográfico, catálogo de talentos y gestión de eventos & bookings musicales (Caucasia, Antioquia).

---

## 📌 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Estado y Progreso del Desarrollo](#-estado-y-progreso-del-desarrollo)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Modelo de Datos](#-modelo-de-datos)
- [Seguridad Implementada](#-seguridad-implementada)
- [Endpoints Disponibles](#-endpoints-disponibles)
- [Hoja de Ruta (Roadmap)](#-hoja-de-ruta-roadmap)
- [Guía de Instalación y Uso](#-guía-de-instalación-y-uso)

---

## 📖 Descripción General

**Money-Stack** es una solución digital concebida para profesionalizar y centralizar las operaciones de un sello musical y agencia de talentos:
- **Catálogo de Artistas:** Presencia digital de artistas firmados e invitados, con perfiles detallados, enlaces sociales y material promocional.
- **Eventos y Conciertos:** Publicación de cartelera, venta/redirección de boletas y detalles de venues.
- **Sistema de Bookings:** Recepción organizada de solicitudes de contratación para eventos privados, festivales y clubes con cumplimiento de tratamiento de datos (Ley 1581).
- **Panel Administrativo RBAC:** Gestión por niveles de acceso (`SUPER_ADMIN`, `ADMIN`, `EDITOR`).

---

## 🏛 Arquitectura del Proyecto

El repositorio está estructurado como un monorepo modular:

```text
Money-Stack/
├── backend/                   # API REST en Node.js + Express + Prisma
│   ├── prisma/
│   │   ├── migrations/        # Historial de migraciones SQL
│   │   ├── schema.prisma      # Esquema de base de datos relacional (PostgreSQL)
│   │   └── seed.js            # Semilla para el primer SUPER_ADMIN
│   ├── src/
│   │   ├── config/            # Variables de entorno y configuraciones
│   │   ├── controllers/       # Controladores de peticiones HTTP
│   │   ├── lib/               # Clientes e instancias compartidas (Prisma Client)
│   │   ├── middlewares/       # Auth, RBAC, Rate Limiting, Error Handler, CSRF
│   │   ├── routes/            # Definición de rutas y versionado (/api/v1)
│   │   ├── services/          # Lógica de negocio y persistencia
│   │   ├── utils/             # Utilidades de hashing, JWT, manejo de errores
│   │   ├── validators/        # Esquemas de validación con Zod
│   │   ├── app.js             # Configuración de Express, middlewares y CORS
│   │   └── server.js          # Entrada del servidor y graceful shutdown
│   ├── .env.example           # Plantilla de variables de entorno
│   └── package.json
├── frontend/                  # Aplicación cliente (Web pública + Panel de administración)
├── .gitignore                 # Configuración de exclusiones de Git
└── README.md                  # Documentación del proyecto
```

---

## 🚀 Estado y Progreso del Desarrollo

### ✅ Fase 1: Arquitectura Base y Módulo de Autenticación (Completada)

- [x] **Configuración del Servidor y Entorno:**
  - Servidor Express estructurado con separación limpia (`app.js` y `server.js`).
  - Validación rigurosa de variables de entorno al iniciar (`src/config/env.js`).
  - Apagado seguro (*graceful shutdown*) controlando señales `SIGTERM` y `SIGINT`.
  - Endpoint de estado `/health` para monitorización de uptime.
- [x] **Base de Datos y Modelado (Prisma ORM + PostgreSQL):**
  - Esquema relacional con tablas optimizadas e índices estratégicos.
  - Migración inicial generada y versionada (`20261002140122_init`).
  - Script de inicialización seguro (`npm run db:seed`) para crear el primer `SUPER_ADMIN`.
- [x] **Seguridad y Control de Accesos (RBAC):**
  - Roles jerárquicos: `SUPER_ADMIN`, `ADMIN`, `EDITOR`.
  - Autenticación híbrida: **Access Token (JWT)** de corta duración (15 min) en memoria/Authorization header + **Refresh Token criptográfico** de larga duración (7 días) en cookie `HttpOnly`, `SameSite=lax/none` y `Secure`.
  - Rotación obligatoria de refresh tokens por cada uso con detección de reutilización.
  - Almacenamiento seguro de refresh tokens mediante **hash SHA-256** (nunca en texto plano).
  - Bloqueo de cuentas por fuerza bruta tras intentos fallidos configurables (`MAX_FAILED_LOGINS`, `LOCK_MINUTES`).
  - Validación de esquemas con **Zod** (política de contraseñas robusta, emails normalizados).
  - Hasheo de contraseñas mediante **bcrypt** (12 rondas de salt).
  - Protección de cabeceras HTTP con **Helmet** (CSP estricto, HSTS, no-referrer).
  - Limitación de tasa de peticiones con **express-rate-limit** (límite global y límite estricto para rutas de autenticación).
  - Protección contra peticiones cruzadas maliciosas con verificación de origen (`requireTrustedOrigin`).

---

## 🛠 Tecnologías Utilizadas

### Backend
- **Node.js** (>= v20)
- **Express.js** (v4.21)
- **PostgreSQL**
- **Prisma ORM** (v6.0)
- **Zod** (Validación de tipos y esquemas)
- **JSON Web Tokens (JWT)** & **Bcrypt** (Seguridad y criptografía)
- **Helmet** & **CORS** (Seguridad HTTP)
- **Express Rate Limit** (Prevención de abusos y DoS)

---

## 🗄 Modelo de Datos

| Modelo | Descripción |
| :--- | :--- |
| `AdminUser` | Cuentas de administradores con roles, control de bloqueos y métricas de acceso. |
| `RefreshToken` | Registro de tokens de refresco activos con hash SHA-256, expiración y metadatos de sesión (IP, User-Agent). |
| `Artist` | Catálogo de artistas/talentos, enlaces sociales, estado de exclusividad (`isSigned`) y disponibilidad de booking. |
| `Event` | Conciertos y eventos con aforos, precios en COP, estados (`DRAFT`, `PUBLISHED`, `CANCELLED`, `FINISHED`). |
| `EventArtist` | Tabla intermedia para el lineup de eventos con orden en cartel y distinción de headliners. |
| `BookingRequest` | Solicitudes de contratación pública, presupuesto, aceptación legal de datos y seguimiento administrativo. |

---

## 🔒 Seguridad Implementada

1. **Tokens con Rotación y Hashing:** Los refresh tokens no se guardan en la base de datos en texto plano. Cada vez que se usa un refresh token, se destruye y se genera uno nuevo.
2. **Defensa Anti-Fuerza Bruta:** Al alcanzar 5 intentos erróneos, la cuenta queda temporalmente bloqueada por 15 minutos.
3. **Cookies Seguras:** La cookie de refresh token es `HttpOnly`, `SameSite=lax` (o `none` con HTTPS) impidiendo el acceso desde JavaScript del lado del cliente (mitigación XSS).
4. **Política de Cache Restrictiva:** Encabezados `Cache-Control: no-store` aplicados en rutas sensibles para evitar filtraciones de tokens en proxies o cachés de navegador.
5. **CORS con Lista Blanca:** Sólo los orígenes explícitamente listados en `CORS_ORIGINS` pueden realizar peticiones con credenciales.

---

## 📡 Endpoints Disponibles

### Sistema
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Público | Verificación de estado del servidor y uptime. |

### Autenticación (`/api/v1/auth`)
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Público (Rate Limited) | Inicia sesión con email y contraseña. Devuelve `accessToken` y establece cookie de `refreshToken`. |
| `POST` | `/api/v1/auth/refresh` | Con Cookie (Rate Limited) | Rota el refresh token y emite un nuevo `accessToken`. |
| `POST` | `/api/v1/auth/logout` | Con Cookie | Invalida el refresh token activo y elimina la cookie. |
| `POST` | `/api/v1/auth/logout-all` | Autenticado (`Bearer`) | Invalida todas las sesiones abiertas del usuario. |
| `GET` | `/api/v1/auth/me` | Autenticado (`Bearer`) | Obtiene la información del perfil del usuario autenticado. |

---

## 🗺 Hoja de Ruta (Roadmap)

- [x] **Fase 1: Core Backend & Autenticación**
- [ ] **Fase 2: Gestión de Usuarios Administradores** (`/api/v1/admin/users`)
  - Creación, edición, activación/suspensión y cambio de roles por parte del `SUPER_ADMIN`.
- [ ] **Fase 3: Módulo de Artistas** (`/api/v1/artists`)
  - CRUD administrativo y endpoints públicos de visualización de perfiles musicales.
- [ ] **Fase 4: Módulo de Eventos** (`/api/v1/events`)
  - Gestión de eventos, armado de lineups y publicación en cartelera.
- [ ] **Fase 5: Módulo de Booking Público** (`/api/v1/bookings`)
  - Formulario público de contratación y panel de revisión y seguimiento.
- [ ] **Fase 6: Desarrollo Frontend**
  - Portal web para el público y Dashboard privado administrativo.

---

## 💻 Guía de Instalación y Uso

### 1. Clonar el repositorio y acceder
```bash
git clone <url-del-repositorio>
cd Money-Stack/backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia la plantilla y ajusta los valores correspondientes:
```bash
cp .env.example .env
```

Genera claves secretas seguras para JWT:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Ejecutar migraciones de base de datos
Asegúrate de que PostgreSQL esté en ejecución y ejecuta:
```bash
npm run prisma:migrate
```

### 5. Crear el primer Super Administrador
Configura `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` y `SEED_ADMIN_NAME` en tu `.env`, luego ejecuta:
```bash
npm run db:seed
```
> **Nota de seguridad:** Una vez creado el usuario, elimina o limpia `SEED_ADMIN_PASSWORD` de tu `.env`.

### 6. Iniciar el servidor en modo desarrollo
```bash
npm run dev
```

El servidor estará escuchando por defecto en `http://localhost:4000`.
