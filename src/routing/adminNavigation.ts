// src/routing/adminNavigation.ts

import {
    ADMIN_USERS_ROUTE,
    PLATFORM_CHOIRS_ROUTE,
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

export const getSelectedChoirLandingRoute = (): string => ADMIN_USERS_ROUTE;
