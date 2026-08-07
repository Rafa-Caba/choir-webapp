<!-- docs/PHASES_10_12_IMPLEMENTATION.md -->

# Choir Web App — Implementación de fases 10, 11 y 12

## Alcance

Esta entrega completa el aislamiento de estado privado por coro, alinea la administración de usuarios tenant y termina de normalizar los contratos CRUD que seguían interpretando respuestas heredadas.

El repositorio del API se utilizó como fuente de verdad. **No fue necesario modificar ningún archivo del API**, porque los endpoints actuales ya contienen los contratos requeridos de forma compatible con Choir RN.

---

## Fase 10 — Aislamiento de stores privados por contexto tenant

### Nuevo control de alcance tenant

Se agregó:

```text
src/store/tenantStoreScope.ts
```

Este módulo mantiene:

- El `effectiveChoirId` vigente.
- Una generación monotónica para las solicitudes tenant.
- Un snapshot `{ choirId, generation }` por operación.
- Una validación antes de escribir cualquier respuesta en el store.

Cuando el usuario cambia del Coro A al Coro B, se incrementa la generación. Aunque una petición iniciada en A termine después, su snapshot deja de ser válido y no puede escribir sobre el estado de B.

### Registro del coro efectivo

`AuthProvider` registra el `effectiveChoirId` que ya utiliza la interfaz y Axios. Esto permite que todos los stores comparen sus respuestas contra el mismo contexto que aparece en el header administrativo.

### Reset coordinado

`resetTenantStores()` ahora:

1. Invalida todas las solicitudes tenant pendientes.
2. Desconecta Socket.IO.
3. Limpia chat, anuncios, blog, galería, instrumentos, logs, miembros, settings, cantos, tipos, temas y usuarios.
4. Restablece selecciones individuales, loading y paginación.

Se ejecuta al:

- Entrar a otro coro.
- Volver a la consola de plataforma.
- Cerrar sesión.
- Expirar o revocar la sesión.
- Detectar un coro inactivo.
- Fallar la restauración del target de plataforma.

### Stores protegidos

Los siguientes stores ahora guardan `activeChoirId` y validan la generación de cada respuesta:

```text
useAnnouncementStore
useBlogStore
useGalleryStore
useInstrumentsStore
useLogStore
useMemberStore
useSettingsStore
useSongStore
useSongTypeStore
useThemeStore
useUsersStore
```

### Chat

`useChatStore` dejó de persistir mensajes o directorios globalmente.

Ahora:

- Vive solamente en memoria.
- Guarda `currentChoirId`.
- Rechaza historiales, directorios, uploads, reacciones y eventos de otro coro.
- Limpia todos los datos al desconectarse o cambiar de contexto.
- Mantiene un único socket autenticado para el coro efectivo.

### Resultado

La Web ya no puede conservar o reinsertar datos privados del coro anterior al cambiar target.

---

## Fase 11 — Administración de usuarios y contraseñas temporales

### Roles tenant

Las operaciones tenant aceptan solamente:

```text
ADMIN
EDITOR
USER
VIEWER
```

`SUPER_ADMIN` no aparece como opción dentro de un coro y nunca se envía en los payloads del CRUD tenant.

### Contexto del coro

El frontend no envía `choirId` en body ni query para crear o modificar usuarios. El coro se resuelve mediante la sesión tenant o mediante `x-target-choir-id` cuando `SUPER_ADMIN` ha seleccionado un coro.

### Contratos implementados

```text
GET    /users
GET    /users/:id
POST   /users
PUT    /users/:id
PATCH  /users/:id/status
POST   /users/:id/reset-password
DELETE /users/:id
GET    /users/directory
PUT    /users/me
PUT    /users/me/theme
```

Respuestas consumidas:

```text
list   -> { users, currentPage, totalPages, totalUsers }
detail -> { user }
create -> { message, user, temporaryPassword }
update -> { message, user, sessionsRevoked }
status -> { user }
reset  -> { message, temporaryPassword }
```

### Contraseña temporal

Al crear un usuario:

- El campo es opcional.
- Si queda vacío, el API genera una contraseña segura.
- Si se proporciona, la Web valida la misma política del API:
  - 12 a 128 caracteres.
  - Mayúscula.
  - Minúscula.
  - Número.
  - Símbolo.
- La contraseña retornada se muestra una sola vez.
- La interfaz ofrece acción de copiar.
- El usuario queda marcado con `mustChangePassword`.

Al restablecer una contraseña:

- El API genera una nueva contraseña temporal.
- Las sesiones anteriores quedan revocadas.
- La tabla actualiza `mustChangePassword`.
- El valor se muestra en un diálogo de una sola ocasión.

### Estado y sesiones

La tabla muestra:

- Rol.
- Activo o suspendido.
- Contraseña configurada o cambio pendiente.
- Último acceso.

También permite:

- Editar.
- Suspender.
- Reactivar.
- Restablecer contraseña.
- Eliminar.

La Web evita suspender o eliminar la propia cuenta desde la tabla. El API sigue siendo la autoridad para las reglas del último administrador activo y la revocación de sesiones.

### Edición directa

La pantalla de edición ahora consulta `GET /users/:id`. Ya no depende de que el usuario se encuentre en la primera página cargada en memoria.

### Eliminación de UI duplicada

Se retiraron los formularios de usuarios duplicados dentro del módulo de coros:

```text
src/components/choirs/ChoirUserForm.tsx
src/components/choirs/ChoirUserEditForm.tsx
src/components/choirs/ChoirUsersTable.tsx
```

`SUPER_ADMIN` selecciona **Administrar coro** y utiliza el mismo CRUD tenant que `ADMIN`.

---

## Fase 12 — Alineación de contratos CRUD restantes

### Blog

- Create y update consumen el post directo.
- Like consume `{ likes, liked }`.
- Comment consume únicamente el comentario creado.
- El store actualiza post actual y colección sin volver a consultar todo.

### Galería

- Create y update consumen la imagen directa.
- Cada marker envía body `{ value }`.
- El método devuelve la imagen final del API.
- Los markers exclusivos se sincronizan en memoria para:
  - `imageStart`
  - `imageTopBar`
  - `imageUs`
  - `imageLogo`
  - `imageLeftMenu`
  - `imageRightMenu`
- `imageGallery` se mantiene como flag no exclusivo, igual que en el API.

### Coros

El service y store de coros quedaron limitados al CRUD de plataforma. Las respuestas se consumen directamente y una eliminación se representa como desactivación, respetando el soft delete del API.

### Recursos ya alineados y verificados

La auditoría confirmó que estos módulos ya usan los contratos actuales del API después de las fases anteriores:

```text
announcements
instruments
song types
themes
members
logs
settings
songs
```

No se agregaron wrappers ni endpoints ficticios.

---

## Compatibilidad con Choir RN

No se modificó el API.

Por lo tanto:

- No cambió ninguna ruta.
- No cambió ningún request body.
- No cambió ninguna forma de respuesta.
- No cambió auth, refresh, Socket.IO, uploads, push ni media.
- Choir RN puede seguir usando el mismo API sin un nuevo build provocado por esta entrega.

---

## Validación realizada

### Web

- 13 de 13 pruebas puras aprobadas.
- 256 archivos TypeScript/TSX validados sintácticamente.
- Cero errores sintácticos.
- Sin `any`, `as any`, `unknown` ni `@ts-ignore` en archivos nuevos o modificados.
- Chat sin persistencia global.
- Respuestas tardías entre coros cubiertas por prueba.

### API

Sin archivos modificados.

Pasaron las suites existentes:

- Phase 14–16 API contract tests.
- Phase 17–18 API contract tests.
- Production and performance regression tests.
- Multimedia and storage regression tests.

El typecheck/build completo de Web no pudo ejecutarse en el entorno de entrega porque la instalación disponible quedó incompleta y faltan definiciones de tipos de dependencias. Debe ejecutarse con el `node_modules` normal del repositorio local.
