<!-- docs/PHASES_5_6_IMPLEMENTATION.md -->

# Choir Web App — Implementación de fases 5 y 6

## Alcance

Esta entrega implementa la separación entre la consola global de plataforma y la administración tenant, junto con permisos específicos y guards aplicados a cada ruta administrativa.

No modifica API ni React Native. Tampoco implementa todavía la administración avanzada de usuarios y contraseñas temporales de la fase 11.

---

## Fase 5 — Consola de plataforma y selección explícita de coro

### Store de contexto de plataforma

Se agregó:

```text
src/store/platform/useTargetChoirStore.ts
```

El store mantiene:

```text
selectedChoir
viewMode: platform | tenant
status: idle | restoring | ready
errorMessage
```

Responsabilidades:

- Persistir únicamente el identificador del coro objetivo.
- Restaurar el coro seleccionado contra `GET /choirs/:id`.
- Rechazar coros inactivos.
- Limpiar stores tenant antes de cambiar de coro.
- Exponer el `choirId` seleccionado al interceptor HTTP.
- Abandonar completamente el contexto tenant al volver a plataforma.

### Integración con sesión

`AuthContext` ahora diferencia:

```text
accessMode: tenant | platform
viewMode: platform | tenant
targetChoir
effectiveChoirId
hasTenantContext
```

Comportamiento:

- Un usuario tenant utiliza el coro entregado por su sesión.
- `SUPER_ADMIN` inicia en modo plataforma.
- `SUPER_ADMIN` solo obtiene contexto tenant después de seleccionar un coro activo.
- Al restaurar una sesión de plataforma se valida nuevamente el coro objetivo.
- Logout, expiración y nuevo login eliminan cualquier selección anterior.

### Header tenant

El interceptor existente consume el bridge de contexto y agrega:

```http
x-target-choir-id: <selectedChoir.id>
```

solo para endpoints tenant.

No se agrega a:

```text
/auth/*
/choirs/*
/users/me
/logs/platform
/public/*
```

### Consola de coros

La lista y el detalle de coros permiten:

- Crear.
- Editar.
- Consultar detalles.
- Desactivar.
- Entrar al contexto administrativo de un coro activo.

La desactivación conserva el registro en la tabla con estado `Inactivo`, porque el API realiza soft delete.

### Prevención de fugas visuales

El branding administrativo dejó de usar una caché global compartida.

Ahora título y logo se almacenan con namespace por coro:

```text
choir-web:brand-title:<choirId>
choir-web:brand-logo:<choirId>
```

Al cambiar de Coro A a Coro B:

- se limpian settings, galería, usuarios, chat y demás stores tenant;
- la caché visual de A no se reutiliza para B;
- el favicon vuelve temporalmente al icono neutral de la aplicación;
- solo se muestra branding cuyo namespace coincide con el coro actual.

---

## Fase 6 — Permisos centralizados y guards de rutas

### Permisos específicos

La superficie activa quedó basada en:

```text
isSuperAdmin
isEditor
canManageChoirs
canManageUsers
canManageContent
canManageSettings
canManageInstruments
canManageMembers
canManageSongTypes
canManageThemes
canViewTenantLogs
canViewPlatformLogs
```

Se retiraron de la superficie activa los aliases genéricos:

```text
isAdmin
canEdit
canViewAuditLogs
```

### Matriz Web aplicada

| Recurso | SUPER_ADMIN con target | ADMIN | EDITOR | USER / VIEWER |
|---|---:|---:|---:|---:|
| Coros de plataforma | Sí, en modo plataforma | No | No | No |
| Usuarios tenant | Sí | Sí | No | No |
| Cantos | CRUD | CRUD | CRUD | Lectura |
| Galería | CRUD | CRUD | CRUD | Lectura |
| Blog | CRUD | CRUD | CRUD | Lectura |
| Avisos | CRUD | CRUD | CRUD | Lectura disponible donde corresponda |
| Instrumentos | CRUD | CRUD | No | No |
| Miembros | CRUD | CRUD | No | No |
| Tipos de canto | CRUD | CRUD | No | No |
| Temas | CRUD | CRUD | No | No |
| Settings | CRUD | CRUD | No | No |
| Logs tenant | Sí | Sí | No | No |
| Logs plataforma | Sí, en modo plataforma | No | No | No |

### Guards agregados

```text
AccessDenied
RoleGuard
TenantContextGuard
PlatformContextGuard
AdminEntryRoute
```

Responsabilidades:

- `PrivateRoute`: autenticación y contraseña temporal.
- `RoleGuard`: permiso o rol requerido.
- `TenantContextGuard`: impide montar pantallas tenant sin coro válido.
- `PlatformContextGuard`: reserva rutas globales para `SUPER_ADMIN` y abandona cualquier target previo.
- `AdminEntryRoute`: envía a `SUPER_ADMIN` sin target a la consola de coros y muestra dashboard únicamente con tenant válido.

### Routing protegido

Cada ruta de `/admin` declara su permiso y contexto requerido en `App.tsx`.

Escribir manualmente una URL restringida:

- no monta el formulario;
- no ejecuta sus efectos de carga;
- muestra una pantalla de acceso denegado;
- mantiene al API como autoridad final.

### Dashboard y perfil

- El dashboard solo consulta usuarios cuando existe `canManageUsers`.
- El dashboard solo consulta temas cuando existe `canManageThemes`.
- La consola tenant de `SUPER_ADMIN` no vuelve a cargar la lista global de coros.
- El perfil de plataforma no solicita instrumentos ni envía campos tenant sin un coro seleccionado.

---

## Archivos principales

```text
src/App.tsx
src/auth/permissions.ts
src/components/auth/*
src/components/choirs/AdminChoirDetail.tsx
src/components/choirs/AdminChoirList.tsx
src/components/components-admin/AdminHeader.tsx
src/components/components-admin/AdminNav.tsx
src/components/components-admin/DashboardPanel.tsx
src/components/user-menu/UserMenu.tsx
src/components/user-menu/UserSettings.tsx
src/context/AuthContext.tsx
src/layouts/admin/AdminLayout.tsx
src/services/admin/choirs.ts
src/store/admin/useChoirsStore.ts
src/store/platform/useTargetChoirStore.ts
src/store/resetAuthenticatedStores.ts
tests/run.ts
```

---

## QA manual recomendada

### SUPER_ADMIN

1. Iniciar sesión mediante acceso de plataforma.
2. Confirmar redirect a `/admin/choirs`.
3. Confirmar que no se cargan settings, galería, chat ni contenido tenant.
4. Seleccionar Coro A mediante `Administrar coro`.
5. Confirmar el nombre/código persistente en header y drawer.
6. Confirmar que llamadas tenant contienen `x-target-choir-id` de A.
7. Pulsar `Volver a consola`.
8. Seleccionar Coro B.
9. Confirmar que no aparece por un instante branding ni contenido de A.
10. Abrir manualmente `/admin/choirs` desde contexto B y confirmar salida limpia a plataforma.
11. Confirmar que un coro inactivo no puede seleccionarse.

### ADMIN

1. Confirmar acceso a usuarios, settings, instrumentos, miembros, tipos, temas y logs tenant.
2. Abrir manualmente `/admin/choirs` y confirmar acceso denegado.
3. Abrir `/admin/public-test` y confirmar acceso denegado.

### EDITOR

1. Confirmar creación/edición de cantos, galería, blog y avisos.
2. Confirmar que usuarios, settings, instrumentos, miembros, tipos, temas y logs no aparecen.
3. Abrir manualmente una de esas rutas y confirmar acceso denegado sin cargar datos.

### USER / VIEWER

1. Confirmar lectura de cantos, galería y blog.
2. Confirmar ausencia de botones de creación/edición/eliminación.
3. Abrir manualmente rutas de escritura y confirmar acceso denegado.
4. Confirmar que el dashboard no solicita `/users` ni `/themes`.

---

## Validación realizada en la entrega

- Compilación de la suite pura con TypeScript 5.8.3.
- 10 de 10 pruebas aprobadas.
- Parseo sintáctico de 244 archivos TypeScript/TSX sin diagnósticos.
- Revisión estructural sin parámetros, propiedades o atributos JSX duplicados.
- Archivos tocados sin `any`, `as any`, `unknown` ni `@ts-ignore`.

La instalación completa de dependencias no pudo finalizar en el entorno de generación porque el acceso externo a npm respondió `EAI_AGAIN`. No se modificó ninguna versión ni el lockfile para evadir esa limitación.
