<!-- File: docs/PHASE_0_BASELINE.md -->

# Choir Web App — baseline para fases 0, 1 y 2

## Revisiones de referencia

| Repositorio | Commit de referencia |
|---|---|
| `choir-webapp` | `da1508a0ac83cf9a4981a17fcd9f79cb9626ffc5` |
| `choirs-api` | `6f8a8ffb449cc87eb91513d208bbc59e45dd93b4` |
| `choir-app` | `139f8afd259458631e349f596d5ac60bc5bf4202` |

Estos hashes corresponden a los ZIP usados para preparar esta entrega.

## Rama recomendada

El ZIP de Web no incluye metadata `.git`, por lo que la entrega no puede crear una rama real dentro del historial del repositorio. Al aplicar los archivos en el clon Git, usar:

```bash
git switch -c feat/web-multichoir-phases-0-2
```

## Contratos congelados

La Web toma como autoridad los siguientes contratos del API:

- `POST /api/auth/login`
- `POST /api/auth/platform-login`
- `POST /api/auth/refresh`
- `POST /api/auth/change-password`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- Header tenant para `SUPER_ADMIN`: `x-target-choir-id`

La respuesta de login, refresh y cambio de contraseña contiene:

```text
accessToken
refreshToken
sessionId
user
choir
requiresPasswordChange
```

## Variables Web

| Variable | Requerida | Uso |
|---|---:|---|
| `VITE_API_URL` | Sí en despliegues | Origen del API o URL terminada en `/api`. |
| `VITE_API_REQUEST_TIMEOUT_MS` | No | Timeout Axios. Predeterminado: `12000`. |

## Estructura agregada

```text
src/api/
src/auth/
src/config/
src/routing/
src/storage/
src/types/api/
src/types/json.ts
src/store/platform/
src/store/public/
```

## Routing congelado

El inventario de rutas públicas, privadas y de autenticación está en [`ROUTE_BASELINE.md`](ROUTE_BASELINE.md).

## Estado de transición

Las fases 0–2 preparan tipos, configuración y transporte HTTP. La sustitución completa de `AuthContext`, la restauración de sesión y los formularios de acceso pertenecen a las fases 3 y 4. Por esa razón se conservan temporalmente contratos heredados marcados como transicionales en `src/types/auth.ts`.

## Validación realizada

- Pruebas unitarias de permisos, clasificación de rutas HTTP y normalización de IDs: aprobadas.
- Validación semántica TypeScript de los archivos creados o modificados: aprobada con declarations de dependencias externas aisladas.
- Revisión automática de archivos tocados para evitar `any`, `as any`, `unknown` y `@ts-ignore`: aprobada.

No fue posible ejecutar el build, lint ni typecheck completos porque el entorno no pudo instalar las dependencias del lockfile. El primer bloqueo reproducible fue un `404` del registro disponible para `zustand@5.0.6`; al simular solamente ese paquete, el siguiente bloqueo fue `@emotion/react`. La entrega incluye los comandos completos para ejecutarlos en el clon con acceso normal al registro.
