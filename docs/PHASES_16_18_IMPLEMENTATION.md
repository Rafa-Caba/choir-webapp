<!-- docs/PHASES_16_18_IMPLEMENTATION.md -->

# docs/PHASES_16_18_IMPLEMENTATION.md

# Fases 16, 17 y 18 — Implementación final

## Fase 16 — Suite QA multi-coro

Se amplió la suite existente para cubrir:

- permisos por rol;
- normalización de `choirCode`;
- scoping de requests tenant;
- rechazo de respuestas tardías;
- contraseñas temporales;
- namespaces de chat;
- preservación de storage ajeno;
- errores de sesión;
- normalización de `VITE_API_URL`;
- fallback/override de `VITE_SOCKET_URL`;
- navegación de plataforma al administrar un coro.

Se agregó `scripts/verify-web-contracts.mjs` para impedir que regresen contratos heredados.

La matriz funcional completa está en `docs/QA_MULTI_CHOIR_PHASE_16.md`.

## Corrección final — separación Platform vs Tenant

Se comparó nuevamente el flujo Web con Choir RN y se corrigió una diferencia arquitectónica importante.

RN distingue dos operaciones en `useTargetChoirStore`:

```text
selectChoir(choir)
→ conserva viewMode = platform
→ UsersListScreen / AuditLogsScreen

enterChoir(choir)
→ viewMode = tenant
→ aplicación administrativa completa del coro
```

La Web ahora replica esa separación:

```text
Usuarios
→ selectChoir(choir)
→ /admin/choirs/:choirId/users
→ mantiene Choir Platform
→ usa x-target-choir-id solo para las llamadas necesarias
→ no monta navegación tenant, avisos ni chat

Entrar al coro
→ enterTenantContext(choir)
→ /admin
→ monta el Admin completo del coro
→ habilita Socket.IO tenant
```

`selectedChoir` ya no implica por sí mismo que la UI haya entrado al modo tenant. Para `SUPER_ADMIN`, `hasTenantContext` requiere simultáneamente un target y `viewMode === 'tenant'`.

También se agregaron rutas Platform dedicadas para listar, crear y editar usuarios del coro seleccionado y un guard que restaura el target a partir de `:choirId` al refrescar o abrir un deep link.

## Fase 17 — Ambientes y despliegue

Se agregaron ejemplos separados por ambiente y soporte de `VITE_SOCKET_URL` independiente.

No fue necesario modificar Choir API ni Choir RN. El API ya aplica `CORS_ORIGINS` a HTTP y Socket.IO.

Vercel conserva el rewrite SPA y ahora incluye headers de seguridad básicos compatibles con la aplicación actual.

## Fase 18 — Limpieza final

Se completó la limpieza de caminos heredados:

- `annoucement.ts` renombrado a `announcement.ts`;
- imports actualizados;
- documentación chat heredada de Ero Cras eliminada;
- package name actualizado a `choir-webapp`;
- README reescrito con la arquitectura actual;
- logs públicos con correo/mensaje retirados;
- verificación automática contra `choirKey`, `withChoirKey`, `replyToId`, clears globales y branding Ero Cras.

## Criterio final

La Web queda preparada para QA de staging con dos coros antes de producción. La autoridad de tenant permanece en el API y no se modificó ningún contrato que consume Choir RN.
