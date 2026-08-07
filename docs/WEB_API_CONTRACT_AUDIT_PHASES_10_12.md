<!-- docs/WEB_API_CONTRACT_AUDIT_PHASES_10_12.md -->

# Auditoría Web ↔ API — Fases 10, 11 y 12

## Resultado general

El API actualizado ya soporta todos los requerimientos de estas fases. La implementación Web se alineó a los contratos existentes y **no requirió cambios del servidor**.

## Usuarios tenant

| Operación Web | Endpoint API verificado | Respuesta usada |
|---|---|---|
| Lista paginada | `GET /api/users` | `{ users, currentPage, totalPages, totalUsers }` |
| Detalle | `GET /api/users/:id` | `{ user }` |
| Crear | `POST /api/users` | `{ message, user, temporaryPassword }` |
| Actualizar | `PUT /api/users/:id` | `{ message, user, sessionsRevoked }` |
| Suspender/reactivar | `PATCH /api/users/:id/status` | `{ user }` |
| Reset de contraseña | `POST /api/users/:id/reset-password` | `{ message, temporaryPassword }` |
| Eliminar | `DELETE /api/users/:id` | `{ message }` |
| Directorio | `GET /api/users/directory` | `{ users }` |
| Perfil propio | `PUT /api/users/me` | `{ user }` |
| Tema propio | `PUT /api/users/me/theme` | `{ user }` |

### Autoridad tenant

Todas las operaciones anteriores pasan por `verifyTenantToken`. Para `SUPER_ADMIN`, el target se resuelve mediante `x-target-choir-id`; para un usuario tenant se obtiene de su sesión. La Web no envía `choirId` en los payloads.

### Reglas que permanecen en el API

- No crear o promover a `SUPER_ADMIN` desde un coro.
- No suspender/eliminar al último `ADMIN` activo.
- Revocar sesiones al cambiar rol, suspender, resetear contraseña o eliminar.
- Forzar `mustChangePassword` después de crear o resetear contraseña.
- Validar contraseña temporal de 12–128 caracteres con mayúscula, minúscula, número y símbolo.

## Blog

| Operación | Endpoint | Respuesta |
|---|---|---|
| Lista | `GET /api/blog` | `BlogPost[]` |
| Detalle | `GET /api/blog/:id` | `BlogPost` |
| Crear | `POST /api/blog` | `BlogPost` |
| Actualizar | `PUT /api/blog/:id` | `BlogPost` |
| Like | `PUT /api/blog/:id/like` | `{ likes, liked }` |
| Comentar | `POST /api/blog/:id/comment` | comentario creado |

## Galería

| Operación | Endpoint | Respuesta |
|---|---|---|
| Lista | `GET /api/gallery` | `GalleryImage[]` |
| Detalle | `GET /api/gallery/:id` | `GalleryImage` |
| Crear | `POST /api/gallery` | `GalleryImage` |
| Actualizar | `PUT /api/gallery/:id` | `GalleryImage` |
| Marker | `PATCH /api/gallery/mark/:field/:id` con `{ value }` | `GalleryImage` |
| Eliminar | `DELETE /api/gallery/:id` | `{ message }` |

El API hace exclusivos todos los markers salvo `imageGallery`. El store Web refleja esa misma regla.

## Coros

| Operación | Endpoint | Respuesta |
|---|---|---|
| Lista | `GET /api/choirs` | `{ choirs, currentPage, totalPages, totalChoirs }` |
| Detalle | `GET /api/choirs/:id` | `Choir` |
| Crear | `POST /api/choirs` | `Choir` |
| Actualizar | `PUT /api/choirs/:id` | `Choir` |
| Desactivar | `DELETE /api/choirs/:id` | `{ message }` |

## Otros recursos revisados

Los services actuales de anuncios, instrumentos, tipos de canto, temas, miembros, logs, settings y cantos ya estaban alineados con las rutas del API entregado. No se cambiaron endpoints para estos recursos.

## Archivos del API modificados

```text
Ninguno.
```

## Impacto en React Native

```text
API antes de esta entrega = API después de esta entrega
```

No existe cambio de contrato que requiera actualización, rebuild o nueva distribución de Choir RN.
