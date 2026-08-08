// src/storage/adminBrandStorage.ts

import {
    APP_STORAGE_PREFIX,
    buildAppStorageKey,
    readStorageValue,
    removeStorageKeysMatching,
    removeStorageValues,
    writeStorageValue,
} from './appStorage';

export interface AdminBrandCache {
    readonly webTitle: string;
    readonly logoUrl: string;
}

const ADMIN_TITLE_PREFIX = `${APP_STORAGE_PREFIX}brand-title:`;
const ADMIN_LOGO_PREFIX = `${APP_STORAGE_PREFIX}brand-logo:`;

const getTitleKey = (choirId: string): string => (
    buildAppStorageKey('brand-title', choirId)
);

const getLogoKey = (choirId: string): string => (
    buildAppStorageKey('brand-logo', choirId)
);

export const readAdminBrandCache = (choirId: string): AdminBrandCache => ({
    webTitle: readStorageValue(getTitleKey(choirId)) ?? '',
    logoUrl: readStorageValue(getLogoKey(choirId)) ?? '',
});

export const writeAdminBrandTitle = (choirId: string, webTitle: string): void => {
    const normalizedChoirId = choirId.trim();
    const normalizedTitle = webTitle.trim();

    if (!normalizedChoirId || !normalizedTitle) {
        return;
    }

    writeStorageValue(getTitleKey(normalizedChoirId), normalizedTitle);
};

export const writeAdminBrandLogo = (choirId: string, logoUrl: string): void => {
    const normalizedChoirId = choirId.trim();
    const normalizedLogoUrl = logoUrl.trim();

    if (!normalizedChoirId || !normalizedLogoUrl) {
        return;
    }

    writeStorageValue(getLogoKey(normalizedChoirId), normalizedLogoUrl);
};

export const clearAdminBrandCache = (choirId: string): void => {
    const normalizedChoirId = choirId.trim();

    if (!normalizedChoirId) {
        return;
    }

    removeStorageValues([
        getTitleKey(normalizedChoirId),
        getLogoKey(normalizedChoirId),
    ]);
};

export const clearAllAdminBrandCaches = (): void => {
    removeStorageKeysMatching((key) => (
        key.startsWith(ADMIN_TITLE_PREFIX) ||
        key.startsWith(ADMIN_LOGO_PREFIX)
    ));
};
