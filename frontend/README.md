# Money-Stack — Frontend

Sitio público + panel de administración construidos con **Next.js (App Router) + TypeScript + Tailwind CSS**,
siguiendo la dirección visual oscura / night vision / depth map definida en el AGENTS.md.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- React 19

## Primeros pasos

```bash
cd frontend
npm install
cp .env.example .env.local
# edita NEXT_PUBLIC_API_URL si cambia la URL de la API en dev
npm run dev
```

El sitio arranca en `http://localhost:3000`. La API corre en `http://localhost:4000` por defecto
en desarrollo (cookie `ms_refresh` se comparte porque SameSite=Lax + origen localhost).

## Consumo de la API

- Peticiones con `credentials: 'include'`.
- Access token **solo en memoria** (nunca localStorage).
- Refresh: una sola petición a la vez; ante `REFRESH_RACE` (409) reintentar una vez;
  ante 401 `SESSION_EXPIRED` ir a login.
- Error de validación (`code === VALIDATION_ERROR`) se muestra por campo en los formularios.

## Dirección visual

- Paleta oscura con un solo acento fosforescente.
- Tipografía HUD en monoespaciada; cuerpo en sans.
- Contraste AA en textos.
- Efectos (grano, scanlines, viñeta, night vision) desactivables y respetuosos de
  `prefers-reduced-motion`.
- Panel admin usa los mismos tokens pero sin efectos, priorizando usabilidad.

## Fases (ver AGENTS.md)

- F0 style tile (tokens, tipografía, componentes clave) — **hecho**
- F1 cimientos (proyecto, layout, cliente API con refresh, estado de sesión) — **en curso**
- F2 sitio público con datos reales — **próximo**
- F3 efectos firma (hero depth map + overlay night vision) — **próximo**
- F4 formulario de booking — **próximo**
- F5 panel admin — **próximo**

## Secreto

No versionar `.env.local`. Ver `.env.example`.
