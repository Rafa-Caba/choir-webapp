<!-- File: docs/ROUTE_BASELINE.md -->

# Inventario de rutas previo a la alineación multi-coro

Este inventario congela las rutas registradas en `src/App.tsx` antes de migrar routing, guards y páginas públicas en fases posteriores.

## Rutas públicas

Las mismas páginas están registradas tanto sin código de coro como bajo `/:choirKey`:

| Ruta raíz heredada | Ruta con coro heredada | Página |
|---|---|---|
| `/` | `/:choirKey` | Inicio |
| `/contact` | `/:choirKey/contact` | Contacto |
| `/members` | `/:choirKey/members` | Miembros |
| `/songs` | `/:choirKey/songs` | Cantos |
| `/about` | `/:choirKey/about` | Nosotros |

Las rutas raíz sin código de coro y el nombre `choirKey` se conservan únicamente como baseline. Su corrección pertenece a las fases de routing y endpoints públicos.

## Rutas de autenticación

```text
/auth/login
/auth/register
```

`/auth/register` permanece registrado en el baseline, aunque el API ya no expone registro público normal. Su eliminación pertenece a la fase de login y contraseña temporal.

## Rutas administrativas

Todas están anidadas bajo `/admin`:

```text
/admin
/admin/choirs
/admin/choirs/new
/admin/choirs/edit/:id
/admin/choirs/view/:id
/admin/choirs/view/:choirId/users/new
/admin/choirs/view/:choirId/users/edit/:userId
/admin/users
/admin/users/new
/admin/users/edit/:id
/admin/songs
/admin/song/:id
/admin/songs/new
/admin/songs/edit/:id
/admin/song-types
/admin/song-types/new
/admin/song-types/edit/:id
/admin/gallery
/admin/gallery/media/:id
/admin/gallery/new
/admin/gallery/edit/:id
/admin/themes
/admin/themes/new
/admin/themes/edit/:id
/admin/members
/admin/members/new
/admin/members/edit/:id
/admin/blog
/admin/blog/view
/admin/blog/view/:id
/admin/blog/new
/admin/blog/edit/:id
/admin/announcements
/admin/announcements/new
/admin/announcements/edit/:id
/admin/instruments
/admin/instruments/new
/admin/instruments/edit/:id
/admin/settings
/admin/profile
/admin/edit-profile
/admin/logs
/admin/chat-group
/admin/public-test
```

## Evidencia visual

No se generaron capturas ejecutadas de la UI porque el ZIP no contiene `node_modules` y el registro de paquetes disponible en el entorno devolvió `404` para dependencias declaradas, comenzando por `zustand@5.0.6`. No se fabricaron capturas ni se sustituyó la aplicación por una maqueta.

El inventario anterior se obtuvo directamente de `src/App.tsx` y permite comparar cualquier cambio posterior de routing sin alterar todavía la UI.
