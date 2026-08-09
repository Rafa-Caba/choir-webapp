// src/routing/adminNavigation.ts

import {
    ADMIN_ROOT_ROUTE,
    PLATFORM_CHOIRS_ROUTE,
    buildPlatformChoirUsersRoute,
} from './index.js';

export interface AdminEntryState {
    readonly isSuperAdmin: boolean;
    readonly hasTenantContext: boolean;
}

export const resolveAdminEntryRedirect = (
    state: AdminEntryState,
): string | null => (
    state.isSuperAdmin && !state.hasTenantContext
        ? PLATFORM_CHOIRS_ROUTE
        : null
);

export const getEnteredChoirLandingRoute = (): string => ADMIN_ROOT_ROUTE;

export const getPlatformChoirUsersRoute = (choirId: string): string => (
    buildPlatformChoirUsersRoute(choirId)
);
