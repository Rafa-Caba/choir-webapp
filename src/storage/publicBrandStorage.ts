// src/storage/publicBrandStorage.ts

import { normalizeChoirCode } from '../utils/choirCode';
import {
    buildAppStorageKey,
    readStorageValue,
    removeStorageValues,
    writeStorageValue,
} from './appStorage';

export interface PublicBrandCache {
    readonly title: string;
    readonly logoUrl: string;
}

const getStorageKey = (choirCode: string, field: 'brand-title' | 'brand-logo'): string => (
    buildAppStorageKey(normalizeChoirCode(choirCode), field)
);

export const readPublicBrandCache = (choirCode: string): PublicBrandCache => ({
    title: readStorageValue(getStorageKey(choirCode, 'brand-title')) ?? '',
    logoUrl: readStorageValue(getStorageKey(choirCode, 'brand-logo')) ?? '',
});

export const writePublicBrandTitle = (choirCode: string, title: string): void => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
        return;
    }

    writeStorageValue(getStorageKey(choirCode, 'brand-title'), normalizedTitle);
};

export const writePublicBrandLogo = (choirCode: string, logoUrl: string): void => {
    const normalizedLogoUrl = logoUrl.trim();

    if (!normalizedLogoUrl) {
        return;
    }

    writeStorageValue(getStorageKey(choirCode, 'brand-logo'), normalizedLogoUrl);
};

export const clearPublicBrandCache = (choirCode: string): void => {
    const normalizedChoirCode = normalizeChoirCode(choirCode);

    if (!normalizedChoirCode) {
        return;
    }

    removeStorageValues([
        getStorageKey(normalizedChoirCode, 'brand-title'),
        getStorageKey(normalizedChoirCode, 'brand-logo'),
    ]);
};
