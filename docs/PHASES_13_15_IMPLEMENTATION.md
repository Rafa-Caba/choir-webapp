<!-- docs/PHASES_13_15_IMPLEMENTATION.md -->

# Choir Web App — Fases 13, 14 y 15

## Alcance

Esta entrega implementa las fases 13, 14 y 15 del roadmap de alineación multi-coro de Choir Web App:

- Fase 13: Chat, Socket.IO y media adjunta.
- Fase 14: Logout, persistencia y limpieza del navegador.
- Fase 15: UX pública segura, branding y estados de error.

No se modifica el API en esta entrega. La Web consume los contratos ya definidos por el roadmap para autenticación del socket, `mediaAssetId`, `replyTo` y logout.

## Fase 13 — Chat, Socket.IO y media adjunta

### Autenticación server-authoritative

El socket Web ya no envía identidad de usuario dentro del handshake.

Para usuario tenant:

```text
auth: { accessToken }
```

Para `SUPER_ADMIN` dentro de un coro seleccionado:

```text
auth: { accessToken, targetChoirId }
```

Si `SUPER_ADMIN` está en modo plataforma sin target, el chat se desconecta y no crea una conexión Socket.IO.

### Cambio de tenant

El chat usa simultáneamente:

```text
currentChoirId
currentUserId
```

La combinación se valida contra el contexto tenant activo antes de aceptar:

- historial;
- mensajes nuevos;
- mensajes actualizados;
- presencia;
- typing;
- reacciones;
- respuestas HTTP tardías.

Al seleccionar otro coro, los stores tenant se reinician y el socket anterior se desconecta antes de conectar el nuevo contexto.

Un evento tardío `session-disconnected` perteneciente a un socket anterior no puede expirar la sesión del coro actualmente activo.

### Sesión revocada por Socket.IO

`session-disconnected` utiliza el mismo `authBridge.expireSession()` que la capa HTTP.

La sesión local se limpia y, desde una ruta protegida, se navega a:

```text
/auth/session-expired
```

### Eventos tipados

Se centralizaron los contratos de eventos en `src/types/chat.ts`:

```text
ChatServerToClientEvents
ChatClientToServerEvents
ChatConnectedUser
ChatSocketTypingEvent
ChatSessionDisconnectedEvent
```

### Persistencia del chat

La caché del chat utiliza el namespace requerido:

```text
choir-web:<choirId>:<userId>:chat
```

Solo se leen mensajes cuya clave coincide con el coro y usuario autenticados actualmente.

La caché:

- guarda hasta 120 mensajes recientes;
- valida su estructura antes de restaurarla;
- ignora datos corruptos;
- nunca sustituye el historial del servidor como fuente de verdad.

### Adjuntos

Los uploads conservan:

```text
assetId
fileUrl
filename
resourceType
```

Al crear el mensaje se envía exclusivamente el identificador validado:

```text
mediaAssetId
```

### Replies

El payload Web usa:

```text
replyTo
```

Ya no existe `replyToId` en la capa de chat.

### TipTap

El contenido saliente se serializa y valida como un documento TipTap antes de llamar al service. No se envía contenido arbitrario directamente desde `JSONContent`.

## Fase 14 — Logout y persistencia

### Logout server-side

El flujo continúa llamando:

```text
POST /auth/logout
```

con el refresh token actual.

El socket se desconecta antes de iniciar el request de logout.

### Limpieza local obligatoria

La limpieza local ocurre dentro de `finally`, por lo que también se ejecuta cuando el request de logout falla por red o la sesión ya fue revocada.

Se eliminan:

- access token;
- refresh token;
- session ID;
- usuario autenticado;
- metadata del coro autenticado;
- target de plataforma;
- stores tenant;
- store de coros autenticado;
- todos los namespaces persistidos de chat;
- branding administrativo cacheado;
- branding público del coro activo cuando corresponde;
- socket activo;
- tema visual tenant aplicado al documento.

Se conserva:

- `lastChoirCode`, para facilitar el siguiente login tenant.

### Namespace de almacenamiento

Las nuevas escrituras usan únicamente:

```text
choir-web:
```

Las claves legacy `token`, `refreshToken` y `role` ya no se escriben. Permanecen únicamente como compatibilidad de lectura/migración y se eliminan al limpiar una sesión.

No se utiliza `localStorage.clear()` ni `sessionStorage.clear()`.

## Fase 15 — UX pública, branding y errores

### Branding neutral

Se retiraron referencias activas al branding heredado de Ero Cras dentro de `src` e `index.html`.

La pantalla de login utiliza branding neutral de Choir App:

- iconografía genérica;
- título `Choir App`;
- sin logo tenant precargado;
- sin llamada a endpoints públicos antes de autenticar.

La consola de plataforma usa:

```text
Choir Platform
```

sin favicon tenant cuando no hay contexto seleccionado.

### Tema neutral

Antes de mostrar login, sesión expirada o estados públicos sin tenant confirmado se aplica una paleta neutral basada en la paleta base actual de la Web App. Esto evita conservar colores del coro anterior después de logout, expiración o navegación a un código inválido.

### Branding público verificado

Título, logo y favicon solo se aplican cuando el status público es `ready` para el `choirCode` activo.

Durante:

- loading;
- código inválido;
- coro inexistente;
- coro no disponible;
- error de carga;

se usa branding neutral y no se muestra la caché de otro coro como fallback.

### Estados dedicados

Se agregaron:

```text
PublicChoirNotFound
PublicChoirUnavailable
PublicLoadError
SessionExpired
```

Los guards existentes continúan cubriendo:

```text
AccessDenied
ChangePassword / PasswordChangeRoute
```

### Error público seguro

Los errores públicos muestran un mensaje genérico de UX en vez de imprimir directamente un detalle técnico devuelto por el backend.

### Página Pública

Los enlaces administrativos existentes respetan el contexto:

- usuario tenant: código de su coro autenticado;
- `SUPER_ADMIN` tenant: código del target seleccionado;
- `SUPER_ADMIN` plataforma sin target: enlace oculto.

## Archivos eliminados

Ninguno.

## API

No se incluye ningún cambio de API en este paquete.
