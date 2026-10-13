# 🎛 Money-Stack — Frontend

Aplicación web pública y panel administrativo para el sello discográfico independiente **Money-Stack** (Caucasia, Antioquia, Colombia), construida con **Next.js 16 (App Router) + TypeScript + Tailwind CSS**, bajo una estética de **Depth Map & Night Vision**.

---

## 🛠 Stack Tecnológico

- **Framework:** Next.js 16 (App Router con Turbopack y Server Components con ISR)
- **Lenguaje:** TypeScript 5
- **Estilos:** Tailwind CSS 4 con tokens de diseño en Variables CSS nativas
- **Estado Asíncrono:** TanStack Query v5 (React Query)
- **Animaciones:** Motion (framer-motion moderno, accesible con `prefers-reduced-motion`)
- **Renderizado 3D:** Three.js / Canvas para el mapa de profundidad en el hero (carga diferida)
- **Formularios y Validación:** React Hook Form + Zod

---

## 🎨 Dirección de Arte: Depth Map & Night Vision

El frontend materializa una identidad visual técnica y atmosférica:
- **Espectro de Profundidad:** El brillo codifica la proximidad:
  - `--depth-0` (`#05060a`): Fondo abisal de máxima lejanía.
  - `--depth-1` (`#0b0d14`): Superficie del viewport.
  - `--depth-2` (`#13161f`): Superficie de secciones elevadas y héroes.
  - `--depth-3` (`#1c2030`): Tarjetas de artistas y eventos.
  - `--depth-4` (`#272c40`): Bordes estructurales y divisiones HUD.
  - `--depth-5` (`#3a4057`): Estados interactivos y realces.
- **Acento Fosforescente Único:** `#7dffb3` (menta neón táctico) con sus variantes `--accent-soft` (12% opacidad) y `--accent-glow`.
- **Tipografía HUD:** Textos técnicos, códigos de estado y coordenadas en monoespaciada (`ui-monospace`, `JetBrains Mono`); narrativa editorial en sans-serif de alta legibilidad.
- **Marcos Visor Tácticos (`VisorFrame`):** Componente decorativo con corchetes en las 4 esquinas (`┌ ┐ └ ┘`), telemetría geográfica de Caucasia (`07°59'N 75°12'W`) y puntos de estado pulsantes.
- **Capas Ópticas Respetuosas:** Grano analógico, líneas de escaneo (*scanlines* en `::before`) y viñeta perimetral suave (*vignette* en `::after`). Desactivables con el conmutador `◉ FX` (`html.fx-off`) o automáticamente mediante `prefers-reduced-motion: reduce`.
- **Accesibilidad WCAG AA:** Contrastes superiores a 4.5:1 en todos los textos y enlaces (auditados en la página viva `/style-tile`).

---

## 📂 Estructura de Rutas

### 🌐 Portal Público (`src/app/(public)`)
- `/`: Portada con hero interactivo de mapa de profundidad, próximos eventos y artistas destacados.
- `/artistas`: Catálogo público con filtros dinámicos por género y destacados.
- `/artistas/[slug]`: Ficha multimedia del artista con biografía, enlaces a streaming y redes sociales.
- `/eventos`: Agenda de conciertos con filtros temporal (próximos/pasados) y por ciudad.
- `/eventos/[slug]`: Detalle del evento, estado de cartelera, lineup con headliners y enlace a boletería.
- `/booking`: Formulario público de contratación musical con honeypot anti-spam y consentimiento de Ley 1581.
- `/el-sello`: Manifiesto, misión y presencia cultural del sello en Caucasia.
- `/politica-de-datos`: Declaración de tratamiento de datos personales (Habeas Data).
- `/style-tile`: Documentación interactiva de tokens, contrastes WCAG AA y componentes HUD (F0).

### 🛡 Panel de Administración (`src/app/admin`)
- `/admin/login`: Inicio de sesión seguro con protección contra fuerza bruta.
- `/admin`: Dashboard central con métricas de reservas pendientes, próximos eventos y accesos directos.
- `/admin/artistas` y `/admin/artistas/[id]`: Gestión de catálogo, subida de metadatos, fotos y enlaces sociales.
- `/admin/eventos` y `/admin/eventos/[id]`: Creación de eventos, programación de fechas y editor de lineup.
- `/admin/bookings` y `/admin/bookings/[id]`: Bandeja de cotizaciones, notas internas y transiciones de estado.
- `/admin/administradores`: Gestión de usuarios, roles y suspensión de accesos (exclusivo `SUPER_ADMIN`).
- `/admin/mi-cuenta`: Actualización de perfil y cambio seguro de contraseña.

---

## 🔒 Contrato con la API Backend

1. **Tokens en Dos Niveles:**
   - **Access Token:** JWT de 15 minutos almacenado **únicamente en memoria** (`useAuth`).
   - **Refresh Token:** Cookie `ms_refresh` (`HttpOnly`, `SameSite=Lax`, `Path=/api/v1/auth`).
2. **Peticiones Autenticadas:**
   - Todas las llamadas al backend incluyen `credentials: 'include'`.
3. **Manejo de Condiciones de Carrera (`REFRESH_RACE`):**
   - El cliente API implementa un bloqueo de refresco único en vuelo. Si recibe un HTTP 409 (`REFRESH_RACE`), reintenta automáticamente la petición una vez antes de fallar.
4. **Sesión Segura sin Bucles:**
   - Las rutas públicas utilizan la bandera `ms:hasSession` para evitar peticiones de refresco innecesarias a visitantes no autenticados.
5. **Mapeo de Errores de Validación:**
   - Respuestas HTTP 400 con código `VALIDATION_ERROR` desglosan `error.details` directamente sobre los campos correspondientes del formulario.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configuración de entorno
Copia la plantilla `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

Verifica la URL del backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Comandos disponibles
- `npm run dev`: Inicia el servidor de desarrollo en `http://localhost:3000` con recarga rápida Turbopack.
- `npm run build`: Compila la aplicación para producción y valida rutas estáticas/dinámicas.
- `npm run start`: Inicia el servidor Node.js en modo producción.
- `npm run typecheck`: Ejecuta la verificación estática de tipos de TypeScript (`tsc --noEmit`).
