# Choir Web App

Choir Web App is the Web surface of **Choir App**. It shares `choirs-api` with the React Native application and is divided into two clearly isolated contexts:

* **Multi-choir public Web**: does not require authentication and always resolves a choir using an explicit `choirCode`.
* **Private console**: requires a session validated by the API and applies tenant or platform permissions according to the user's role.

## Multi-Choir Architecture

### Public Web

Public URLs are canonical per choir:

```text
/:choirCode
/:choirCode/about
/:choirCode/members
/:choirCode/songs
/:choirCode/blog
/:choirCode/blog/:postId
/:choirCode/contact
```

All public requests exclusively use:

```text
/api/public/:choirCode/*
```

There is no choir fallback embedded in the code. `VITE_DEFAULT_PUBLIC_CHOIR_CODE` is optional and only controls the visual redirect from `/`.

### Private Tenant Console

Users with the `ADMIN`, `EDITOR`, `USER`, and `VIEWER` roles belong to a single choir. Tenant login requires:

```text
choirCode + identifier + password
```

The API is the authority for `userId`, role, and `choirId`.

### Platform Console

`SUPER_ADMIN` uses the platform login and remains outside of a tenant context until a choir is explicitly selected.

When clicking **Manage Choir**:

1. The target choir is selected and persisted.
2. Stores from the previous tenant are cleared.
3. The user enters directly at `/admin/users`.
4. Axios adds `x-target-choir-id` only to tenant routes.
5. Socket.IO connects using `{ accessToken, targetChoirId }`.

User administration uses the same tenant CRUD used by an `ADMIN`; `choirId` is never sent in the request body as the source of authority.

## Session and Security

* Session restoration uses `GET /api/auth/me`.
* Refresh uses `POST /api/auth/refresh` with full session rotation.
* Tenant login and platform login are separate flows.
* Temporary passwords require a mandatory password change.
* Public and private stores are isolated by choir.
* Late responses cannot overwrite the active tenant context.
* Chat is persisted under `choir-web:<choirId>:<userId>:chat`.
* Logout disconnects Socket.IO and clears only Choir Web App storage keys.
* Other keys belonging to the same domain are preserved.

## Environment Variables

Use one of the included environment examples:

```text
.env.development.example
.env.staging.example
.env.production.example
```

Web variables:

```env
VITE_API_URL=https://YOUR_CHOIRS_API_DOMAIN
VITE_SOCKET_URL=https://YOUR_CHOIRS_SOCKET_DOMAIN
VITE_DEFAULT_PUBLIC_CHOIR_CODE=
VITE_API_REQUEST_TIMEOUT_MS=12000
```

### `VITE_API_URL`

Must point to the API origin. The Web App adds `/api` exactly once, so both formats are normalized correctly:

```text
https://api.example.com
https://api.example.com/api
```

### `VITE_SOCKET_URL`

Optional. If left empty, Socket.IO reuses the normalized origin from `VITE_API_URL`.

This allows HTTP and WebSocket traffic to use separate origins in the future without requiring code changes.

### `VITE_DEFAULT_PUBLIC_CHOIR_CODE`

Optional.

If empty, `/` displays the neutral platform landing page.

If it contains a valid value, `/` redirects to:

```text
/:choirCode
```

## Local Development

```bash
npm ci
npm run dev
```

Suggested local API configuration:

```env
VITE_API_URL=http://localhost:10000
VITE_SOCKET_URL=http://localhost:10000
```

## Verification

Run:

```bash
npm run typecheck
npm run lint
npm run build
npm test
npm run verify:contracts
npm run verify:qa
```

`verify:contracts` automatically verifies that legacy routes/helpers, global storage, `replyToId`, legacy branding, or the old `annoucement.ts` filename are not reintroduced.

The final manual QA matrix is documented in:

```text
docs/QA_MULTI_CHOIR_PHASE_16.md
```

## Deployment

The Vercel configuration preserves SPA deep links and adds Web security headers.

Before deploying:

1. Configure the variables for the target environment.
2. Add the exact Web domain to the API `CORS_ORIGINS`.
3. Run `npm run verify:qa`.
4. Validate two independent choirs in staging.
5. Test direct browser refresh on both a public URL and an `/admin/...` route.

The current API uses `CORS_ORIGINS` as a comma-separated allowlist and applies the same allowlist to both HTTP and Socket.IO.

More details are available in:

```text
docs/DEPLOYMENT_PHASE_17.md
```

## Relevant Project Structure

```text
src/api/                 HTTP client and session/tenant bridges
src/auth/                permissions and authentication errors
src/config/              environment configuration
src/context/             session and public context
src/routing/             guards and canonical navigation
src/services/admin/      private API contracts
src/services/public/     /public/:choirCode contracts
src/storage/             namespaced storage
src/store/admin/         tenant stores
src/store/platform/      explicit choir selection
src/store/public/        isolated public stores
src/types/               DTOs and shared types
scripts/                 contract verification scripts
tests/                   multi-choir test suite without additional dependencies
```

## Relationship with Choir RN and Choir API

The Web App and RN App consume the same `choirs-api`.

Web changes must preserve the API contracts already used by RN. Any future backend capability that does not currently exist must be added in an additive way so it does not break Choir RN.
