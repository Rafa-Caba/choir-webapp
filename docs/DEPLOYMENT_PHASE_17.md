# docs/DEPLOYMENT_PHASE_17.md

# Ambientes, CORS y despliegue — Fase 17

## Archivos de ejemplo

```text
.env.development.example
.env.staging.example
.env.production.example
```

No subir `.env`, `.env.production` ni credenciales reales al repositorio.

## Variables Web

```env
VITE_API_URL=https://YOUR_CHOIRS_API_DOMAIN
VITE_SOCKET_URL=https://YOUR_CHOIRS_API_DOMAIN
VITE_DEFAULT_PUBLIC_CHOIR_CODE=
VITE_API_REQUEST_TIMEOUT_MS=12000
```

`VITE_API_URL` puede incluir `/api`; la Web lo elimina antes de volver a construir `API_BASE_URL`, evitando `/api/api`.

`VITE_SOCKET_URL` es independiente. Si se deja vacío, se utiliza el origen del API.

## CORS del API

El API actual lee:

```env
CORS_ORIGINS=https://YOUR_WEB_DOMAIN
```

Para varios orígenes:

```env
CORS_ORIGINS=https://staging.example.com,https://www.example.com
```

La allowlist se aplica tanto a Express como a Socket.IO. Usa únicamente orígenes completos y aprobados; no uses `*` en producción.

## Vercel

`vercel.json` incluye:

- rewrite SPA para deep links;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `X-Frame-Options: DENY`;
- `Permissions-Policy` sin cámara, micrófono ni geolocalización.

Validar después del deploy:

```text
/:choirCode
/:choirCode/blog/:postId
/admin/choirs
/admin/users
/auth/login
```

Cada ruta debe cargar correctamente al abrirse directamente y después de refresh.

## Orden recomendado

1. Desplegar API compatible.
2. Confirmar `CORS_ORIGINS` del dominio Web nuevo.
3. Configurar variables Web.
4. Ejecutar `npm run verify:qa`.
5. Desplegar Web a staging.
6. Ejecutar `docs/QA_MULTI_CHOIR_PHASE_16.md` con Coro A y Coro B.
7. Promover a producción.

## Verificación rápida

```bash
npm ci
npm run verify:qa
```

En DevTools confirmar:

- HTTP usa `${VITE_API_URL}/api` una sola vez.
- Socket.IO usa `VITE_SOCKET_URL` o el fallback del API.
- Las rutas tenant de `SUPER_ADMIN` envían `x-target-choir-id`.
- Rutas `/choirs`, `/auth` y `/public` no reciben ese header.
