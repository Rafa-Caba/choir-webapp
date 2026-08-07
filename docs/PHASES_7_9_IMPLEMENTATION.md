<!-- docs/PHASES_7_9_IMPLEMENTATION.md -->

# Choir Web App — Implementación de fases 7, 8 y 9

## Alcance aplicado

Esta entrega alinea la navegación pública, los servicios públicos y el estado público de Choir Web App con el API multi-coro actual.

## Fase 7 — Routing público canónico

- La ruta pública principal de cada coro es `/:choirCode`.
- Las rutas internas conservan siempre el código activo:
  - `/:choirCode`
  - `/:choirCode/about`
  - `/:choirCode/members`
  - `/:choirCode/songs`
  - `/:choirCode/blog`
  - `/:choirCode/blog/:postId`
  - `/:choirCode/contact`
- Los códigos se normalizan a minúsculas y se validan antes de cargar datos.
- `/` solo redirige cuando existe `VITE_DEFAULT_PUBLIC_CHOIR_CODE`; de lo contrario muestra una pantalla neutral.
- No existe un coro hardcodeado como fallback.
- Un código inválido o un coro inexistente muestra un estado público explícito y no reutiliza contenido anterior.

## Fase 8 — Servicios públicos aislados

- Se agregó un cliente Axios público sin token, refresh ni `x-target-choir-id`.
- Todos los servicios públicos reciben `choirCode` explícitamente.
- Todas las llamadas públicas utilizan exclusivamente:
  - `/api/public/:choirCode/settings`
  - `/api/public/:choirCode/announcements`
  - `/api/public/:choirCode/blog`
  - `/api/public/:choirCode/blog/:postId`
  - `/api/public/:choirCode/gallery`
  - `/api/public/:choirCode/songs`
  - `/api/public/:choirCode/song-types`
  - `/api/public/:choirCode/themes`
  - `/api/public/:choirCode/members`
  - `/api/public/:choirCode/instruments`
- La respuesta especial de settings se interpreta como `{ choir, settings }`.
- Las demás colecciones públicas se interpretan como arreglos directos.
- El API incorpora el detalle público de blog por `postId`, filtrado por `choirId` e `isPublic`.

## Fase 9 — Estado público seguro

- `PublicGlobalContext` se crea por `choirCode` y se desmonta al cambiar de tenant.
- Todos los stores públicos registran `loadedChoirCode`.
- Al cambiar de código se limpian settings, galería, cantos, tipos, miembros, temas, instrumentos, anuncios y blog.
- Cada store cancela la petición anterior y descarta respuestas tardías.
- Un error deja el recurso vacío; nunca conserva datos de otro coro.
- Título, logo y favicon se cachean con namespace por código de coro.
- La UI distingue loading, vacío, error y coro no encontrado.

## Ajustes de integración adicionales

- `VITE_API_URL` se normaliza centralmente y puede configurarse como origen o como URL terminada en `/api`.
- Axios utiliza `API_BASE_URL`; Socket.IO utiliza `API_ORIGIN` y `path: /socket.io`.
- Se eliminó el socket global heredado que se conectaba sin autenticación.
- El chat envía únicamente `accessToken` y, para `SUPER_ADMIN`, `targetChoirId` explícito.
- Los uploads de chat conservan `mediaAssetId`, requerido por el API al crear mensajes.
- La búsqueda inexistente `/members/search` fue eliminada. Se consulta `/members` y se filtra localmente.
- Los filtros de logs se mapearon a los nombres reales del API; la búsqueda libre se ejecuta sobre la página cargada.
- Se corrigieron respuestas administrativas heredadas en anuncios, blog, galería, instrumentos, miembros, cantos, tipos, temas y chat.

## Variables de entorno

Desarrollo local:

```env
VITE_API_URL=http://localhost:10000
VITE_API_REQUEST_TIMEOUT_MS=12000
# VITE_DEFAULT_PUBLIC_CHOIR_CODE=coro-a
```

Producción:

```env
VITE_API_URL=https://DOMINIO-REAL-DEL-API
VITE_API_REQUEST_TIMEOUT_MS=12000
# VITE_DEFAULT_PUBLIC_CHOIR_CODE=CODIGO-PUBLICO-OPCIONAL
```

No es necesario agregar `/api`; si se agrega, la normalización evita duplicarlo. El dominio real debe configurarse en el proveedor donde se despliegue la Web App.

## Verificación manual multi-coro

1. Abrir `/coro-a` y confirmar branding y contenido de A.
2. Navegar directamente a `/coro-b` sin recargar.
3. Confirmar que no aparezca ningún frame, título, logo, post, canto o imagen de A.
4. Simular una respuesta lenta de A y cambiar a B; la respuesta tardía de A debe ignorarse.
5. Abrir un `postId` de A bajo `/coro-b/blog/:postId`; debe devolver 404 y no mostrar el post.
6. Confirmar que las peticiones públicas no llevan `Authorization` ni `x-target-choir-id`.
7. Confirmar que el chat conecta al origen del API, no a `/api/socket.io`.
