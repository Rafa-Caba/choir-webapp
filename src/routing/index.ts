// src/routing/index.ts

export const AUTH_LOGIN_ROUTE = '/auth/login';
export const AUTH_CHANGE_PASSWORD_ROUTE = '/auth/change-password';
export const ADMIN_ROOT_ROUTE = '/admin';
export const ADMIN_USERS_ROUTE = '/admin/users';
export const PLATFORM_CHOIRS_ROUTE = '/admin/choirs';

const encodeRouteSegment = (value: string): string => encodeURIComponent(value.trim());

export const buildPlatformChoirUsersRoute = (choirId: string): string => (
    `${PLATFORM_CHOIRS_ROUTE}/${encodeRouteSegment(choirId)}/users`
);

export const buildPlatformChoirNewUserRoute = (choirId: string): string => (
    `${buildPlatformChoirUsersRoute(choirId)}/new`
);

export const buildPlatformChoirEditUserRoute = (
    choirId: string,
    userId: string,
): string => (
    `${buildPlatformChoirUsersRoute(choirId)}/edit/${encodeRouteSegment(userId)}`
);
