// src/storage/publicBrandStorage.ts

import { normalizeChoirCode } from '../utils/choirCode';

export interface PublicBrandCache {
    readonly title: string;
    readonly logoUrl: string;
}

const getStorageKey = (choirCode: string, field: 'brand-title' | 'brand-logo'): string => (
    `choir-web:${normalizeChoirCode(choirCode)}:${field}`
);

const readValue = (key: string): string => {
    if (typeof window === 'undefined') {
        return '';
    }

    try {
        return window.localStorage.getItem(key) ?? '';
    } catch {
        return '';
    }
};

const writeValue = (key: string, value: string): void => {
    if (typeof window === 'undefined' || !value.trim()) {
        return;
    }

    try {
        window.localStorage.setItem(key, value);
    } catch {
        return;
    }
};

export const readPublicBrandCache = (choirCode: string): PublicBrandCache => ({
    title: readValue(getStorageKey(choirCode, 'brand-title')),
    logoUrl: readValue(getStorageKey(choirCode, 'brand-logo')),
});

export const writePublicBrandTitle = (choirCode: string, title: string): void => {
    writeValue(getStorageKey(choirCode, 'brand-title'), title);
};

export const writePublicBrandLogo = (choirCode: string, logoUrl: string): void => {
    writeValue(getStorageKey(choirCode, 'brand-logo'), logoUrl);
};
