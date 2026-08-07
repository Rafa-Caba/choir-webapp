<!-- docs/WEB_API_SERVICE_AUDIT_PHASES_7_9.md -->

# Auditoría Web ↔ API — Fases 7, 8 y 9

## Resolución de URL

| Consumidor | Base correcta |
|---|---|
| Axios autenticado | `${API_ORIGIN}/api` |
| Axios público | `${API_ORIGIN}/api` |
| Socket.IO | `API_ORIGIN`, path `/socket.io` |

`VITE_API_URL` es la única variable de origen usada en `src`. No existen URLs de Railway, localhost o API duplicadas dentro de los services.

## Autenticación y plataforma

| Web | API | Estado |
|---|---|---|
| `POST /auth/login` | `POST /api/auth/login` | Alineado |
| `POST /auth/platform-login` | `POST /api/auth/platform-login` | Alineado |
| `POST /auth/refresh` | `POST /api/auth/refresh` | Alineado |
| `POST /auth/change-password` | `POST /api/auth/change-password` | Alineado |
| `POST /auth/logout` | `POST /api/auth/logout` | Alineado |
| `GET /auth/me` | `GET /api/auth/me` | Alineado |
| CRUD `/choirs` | CRUD `/api/choirs` | Alineado; contexto plataforma |

## Recursos tenant administrativos

| Recurso | Rutas Web | Rutas API | Resultado |
|---|---|---|---|
| Usuarios | `/users`, `/users/:id`, `/users/directory`, `/users/me`, `/users/me/theme` | Coinciden | Alineado |
| Settings | `/settings` | Coincide | Alineado |
| Anuncios | `/announcements/admin`, `/announcements/:id` | Coinciden | Respuestas directas corregidas |
| Blog | `/blog`, `/blog/:id`, likes y comentarios | Coinciden | Respuestas directas corregidas |
| Galería | `/gallery`, `/gallery/:id`, flags por patch | Coinciden | Payload `{ value }` alineado |
| Instrumentos | `/instruments`, `/instruments/:id` | Coinciden | Sin `choirId` del cliente |
| Miembros | `/members`, `/members/:id` | Coinciden | `/members/search` eliminado |
| Cantos | `/songs`, `/songs/:id` | Coinciden | Respuestas directas corregidas |
| Tipos de canto | `/song-types`, `/song-types/:id` | Coinciden | Respuestas directas corregidas |
| Temas | `/themes`, `/themes/:id` | Coinciden | Sin query tenant heredada |
| Chat | `/chat/history`, `/chat`, uploads y reactions | Coinciden | `mediaAssetId` y envelopes alineados |
| Logs tenant | `/logs`, `/logs/user/:userId` | Coinciden | Nombres de filtros corregidos |
| Logs plataforma | `/logs/platform` | Coincide | Service tipado disponible |

## Recursos públicos

| Página/servicio | Endpoint exacto |
|---|---|
| Identidad y settings | `GET /api/public/:choirCode/settings` |
| Avisos | `GET /api/public/:choirCode/announcements` |
| Blog | `GET /api/public/:choirCode/blog` |
| Detalle de blog | `GET /api/public/:choirCode/blog/:postId` |
| Galería | `GET /api/public/:choirCode/gallery` |
| Cantos | `GET /api/public/:choirCode/songs` |
| Tipos de canto | `GET /api/public/:choirCode/song-types` |
| Temas | `GET /api/public/:choirCode/themes` |
| Miembros | `GET /api/public/:choirCode/members` |
| Instrumentos | `GET /api/public/:choirCode/instruments` |

Cada endpoint público resuelve primero un coro activo por código y filtra su colección por el `choirId` resuelto. El detalle de blog además exige `isPublic: true`.

## Hallazgos retirados

- Query pública heredada `choirKey`.
- Endpoints públicos que apuntaban a rutas privadas.
- `/members/search`, inexistente en el API.
- Query libre `search` para logs, inexistente en el API.
- Socket construido con una URL que podía terminar en `/api`.
- Identidad completa enviada desde el cliente durante el handshake Socket.IO.
- Mensajes de chat creados con URL de upload en vez de `mediaAssetId`.
- Socket global no autenticado y sin consumidores.
