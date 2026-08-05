<!-- File: docs/PHASES_3_4_IMPLEMENTATION.md -->

# Choir Web App — Fases 3 y 4

## Alcance implementado

Esta entrega reemplaza el flujo heredado de autenticación por una sesión multi-coro alineada con `choirs-api`.

### Sesión y restauración

- Un solo `AuthProvider` envuelve toda la aplicación.
- La sesión se restaura con `GET /api/auth/me`.
- El perfil extendido se consulta con `GET /api/users/me` únicamente cuando la contraseña temporal ya fue cambiada.
- Access token, refresh token, session ID, usuario, coro y estado de contraseña se actualizan juntos.
- El refresh rotado se aplica mediante el bridge HTTP creado en la fase 2.
- Una sesión revocada, un usuario suspendido o un coro inactivo limpian el estado privado y los stores administrativos.
- El último código de coro usado se conserva como preferencia no sensible.

### Login tenant

Contrato:

```text
POST /api/auth/login
choirCode + identifier + password
```

La UI solicita explícitamente:

- Código del coro.
- Usuario o correo.
- Contraseña.

No existe ningún código de coro predeterminado o hardcodeado.

### Login de plataforma

Contrato:

```text
POST /api/auth/platform-login
identifier + password
```

Este modo no solicita ni inventa un `choirCode`. Después del acceso, `SUPER_ADMIN` entra por ahora a `/admin/choirs`, hasta que la fase 5 implemente la consola de plataforma y selección de tenant completa.

### Contraseña temporal

Contrato:

```text
POST /api/auth/change-password
currentPassword + newPassword
```

Reglas aplicadas:

- La ruta `/auth/change-password` requiere una sesión válida.
- Todo `/admin/*` redirige a cambio de contraseña cuando `requiresPasswordChange` es verdadero.
- La nueva contraseña requiere entre 12 y 128 caracteres, mayúscula, minúscula, número y símbolo.
- La sesión rotada devuelta por el API reemplaza completamente la sesión anterior.
- El perfil y el chat tenant solo se cargan después de completar el cambio.

### Registro público eliminado

Se eliminaron:

```text
src/pages/auth/Register.tsx
src/components/users/RegisterUser.tsx
```

También se eliminó la ruta `/auth/register` y cualquier llamada a `POST /auth/register`.

## Limpieza de estado

Al cerrar o expirar la sesión se limpian:

- Tokens y session ID.
- Usuario y coro autenticados.
- Modo de acceso.
- Target tenant de plataforma.
- Chat y almacenamiento persistido del chat.
- Stores administrativos de avisos, blog, coros, galería, instrumentos, logs, miembros, settings, cantos, tipos, temas y usuarios.

Se conserva:

```text
choir-web:preferences:last-choir-code
```

## Correcciones adicionales incluidas

- Se agregó `tsconfig.tests.json`, ausente en la entrega aplicada localmente.
- Se corrigió el acceso inseguro al primer nodo TipTap en `AdminChatGroup.tsx`.
- Los mensajes de autenticación se mapean por `ApiErrorResponse.code` y se muestran en español.
- Los archivos tocados no agregan `any`, `as any`, `unknown` ni `@ts-ignore`.

## Validación

Ejecutado en el entorno de entrega:

```text
npm test
PASS 9 test cases
```

La validación sintáctica independiente pasó para todos los archivos TypeScript y TSX modificados.

La instalación completa quedó bloqueada por el registro interno del entorno, que devolvió `404` para `zustand@5.0.6`. No se modificaron versiones para evadir esa limitación.
