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

## Corrección — Administrar coro

Se comparó el flujo Web con Choir RN.

RN realiza:

```text
selectChoir(choir)
→ UsersListScreen
```

La Web realizaba:

```text
enterTenantContext(choir)
→ /admin
→ AdminEntryRoute todavía podía leer el contexto anterior
→ /admin/choirs
```

La Web ahora realiza:

```text
enterTenantContext(choir)
→ /admin/users
```

El target ya queda persistido antes de la navegación y Axios continúa usando `x-target-choir-id` para las llamadas tenant.

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
