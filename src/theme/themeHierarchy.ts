// src/theme/themeHierarchy.ts

import type { UserRole } from '../types/auth';
import type { Theme } from '../types/theme';

export type UserThemeReference = string | Theme | null | undefined;

export const resolvePersonalThemeId = (
    themeReference: UserThemeReference,
): string | null => {
    if (typeof themeReference === 'string') {
        return themeReference.trim() || null;
    }

    if (themeReference && typeof themeReference === 'object') {
        return themeReference.id.trim() || null;
    }

    return null;
};

export const shouldUsePersonalAdminTheme = (
    role: UserRole,
    themeReference: UserThemeReference,
): boolean => (
    role !== 'SUPER_ADMIN' && Boolean(resolvePersonalThemeId(themeReference))
);
