<!-- docs/QA_MULTI_CHOIR_PHASE_16.md -->

# docs/QA_MULTI_CHOIR_PHASE_16.md

# QA multi-coro — Fase 16

Esta matriz cierra la validación funcional de Choir Web App antes de producción. Debe ejecutarse con dos coros independientes, por ejemplo Coro A y Coro B, y cuentas separadas por rol.

## Preparación

- Coro A activo.
- Coro B activo.
- Un `SUPER_ADMIN` de plataforma.
- Un `ADMIN`, `EDITOR` y `VIEWER` por coro.
- Al menos un recurso distintivo por coro: anuncio, blog, imagen, canto, tema y usuario.
- DevTools abierto para validar requests y headers.

## Autenticación y permisos

- [ ] Login tenant con el mismo identifier en Coro A y Coro B resuelve la cuenta correcta mediante `choirCode`.
- [ ] Login de plataforma no solicita `choirCode`.
- [ ] `SUPER_ADMIN` recién autenticado entra a `/admin/choirs` sin target tenant.
- [ ] Abrir manualmente `/admin/users` sin target muestra selección requerida y no consulta usuarios tenant.
- [ ] `ADMIN` puede administrar usuarios de su coro.
- [ ] `EDITOR` puede editar contenido permitido pero no usuarios, instrumentos, settings, miembros, tipos ni temas.
- [ ] `VIEWER` no ve acciones administrativas de escritura.
- [ ] Una contraseña temporal bloquea el resto de la consola hasta cambiarse.

## Flujo SUPER_ADMIN — Usuarios desde plataforma

- [ ] Abrir `/admin/choirs`.
- [ ] Pulsar **Usuarios** en Coro A.
- [ ] Confirmar navegación a `/admin/choirs/<choirId>/users`.
- [ ] Confirmar que el header y sidebar continúan mostrando **Choir Platform**, no el Admin normal del coro.
- [ ] Confirmar que no aparecen navegación tenant, avisos laterales ni chat del coro.
- [ ] Confirmar que `GET /api/users` envía `x-target-choir-id` de Coro A.
- [ ] Crear, editar, suspender/reactivar y resetear contraseña sin salir de la superficie Platform.
- [ ] Refrescar directamente `/admin/choirs/<choirId>/users` y confirmar restauración del target.
- [ ] Abrir Usuarios de Coro B y confirmar limpieza inmediata del store de usuarios de A.

## Flujo SUPER_ADMIN — Entrar al coro

- [ ] Desde `/admin/choirs`, pulsar **Entrar** o **Entrar al coro**.
- [ ] Confirmar navegación a `/admin`.
- [ ] Confirmar que ahora sí aparece la navegación tenant completa del coro.
- [ ] Confirmar que Socket.IO conecta con `accessToken + targetChoirId`.
- [ ] Pulsar **Volver a consola** y confirmar regreso a modo Platform sin mezclar layout tenant.

## Respuestas tardías y aislamiento tenant

- [ ] Con throttling, iniciar una carga en Coro A y cambiar a B antes de recibir la respuesta.
- [ ] Confirmar que la respuesta tardía de A no aparece bajo B.
- [ ] Repetir con galería, blog, cantos y usuarios.
- [ ] Desactivar el coro seleccionado y confirmar retorno seguro a plataforma.

## Web pública

- [ ] `/:coro-a` muestra únicamente branding y contenido A.
- [ ] `/:coro-b` muestra únicamente branding y contenido B.
- [ ] Navegar A → B con throttling nunca muestra A bajo la URL de B.
- [ ] Código inexistente muestra “Coro no encontrado”.
- [ ] Coro inactivo muestra “Coro no disponible”.
- [ ] Código inválido no consulta contenido tenant.
- [ ] Falla de carga pública no reutiliza el contenido anterior.
- [ ] El favicon y título del documento corresponden al coro activo.
- [ ] El detalle público de blog solo abre posts del mismo coro.
- [ ] Back/forward entre dos coros conserva el aislamiento.

## Socket.IO y chat

- [ ] Tenant A y Tenant B conectados simultáneamente solo reciben presencia y mensajes de su coro.
- [ ] `SUPER_ADMIN` sin target no conecta Socket.IO.
- [ ] Al seleccionar A, el handshake contiene `accessToken` y `targetChoirId=A`.
- [ ] Al cambiar A → B, el socket A se desconecta antes de conectar B.
- [ ] Un evento tardío del socket A no cambia la sesión B.
- [ ] Token inválido o sesión revocada lleva a la pantalla de sesión expirada.
- [ ] Reply usa `replyTo`.
- [ ] Adjuntos usan `mediaAssetId`.
- [ ] Chat persistido usa `choir-web:<choirId>:<userId>:chat`.

## Logout

- [ ] Logout con red disponible llama `/auth/logout` y limpia el contexto local.
- [ ] Logout con red caída también limpia el contexto local.
- [ ] Después del logout no queda frame, usuario, branding o chat del coro anterior.
- [ ] `lastChoirCode` puede conservarse.
- [ ] Una clave ajena a Choir Web App en `localStorage` permanece intacta.

## Refresh y deep links

- [ ] Refresh en `/coro-a/blog` vuelve a cargar correctamente.
- [ ] Refresh en `/admin/choirs/<choirId>/users` restaura sesión y target seleccionado sin entrar al layout tenant.
- [ ] Refresh en `/admin/choirs` mantiene modo plataforma cuando no existe target.
- [ ] Varias respuestas `401` concurrentes generan un solo refresh compartido.

## Cierre

La fase se considera aprobada únicamente con cero fugas entre Coro A y Coro B y con todas las rutas privadas alineadas con la matriz de permisos.
