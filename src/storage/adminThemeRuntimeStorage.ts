// src/storage/adminThemeRuntimeStorage.ts

import type { Theme } from '../types/theme';
import {
    buildAppStorageKey,
    readStorageValue,
    removeStorageValue,
    writeStorageValue,
} from './appStorage.js';

export type AdminThemeSource = 'global' | 'personal';

export interface AdminThemeSnapshot {
    readonly choirCode: string;
    readonly userId: string | null;
    readonly source: AdminThemeSource;
    readonly theme: Theme;
}

const ACTIVE_ADMIN_THEME_KEY = buildAppStorageKey('runtime', 'active-admin-theme');

const normalizeChoirCode = (choirCode: string): string => choirCode.trim().toLowerCase();

const serializeSnapshot = (snapshot: AdminThemeSnapshot): string => {
    const params = new URLSearchParams();

    params.set('choirCode', normalizeChoirCode(snapshot.choirCode));
    params.set('source', snapshot.source);
    params.set('id', snapshot.theme.id);
    params.set('name', snapshot.theme.name);
    params.set('isDark', String(snapshot.theme.isDark));
    params.set('primaryColor', snapshot.theme.primaryColor);
    params.set('accentColor', snapshot.theme.accentColor);
    params.set('backgroundColor', snapshot.theme.backgroundColor);
    params.set('textColor', snapshot.theme.textColor);
    params.set('cardColor', snapshot.theme.cardColor);
    params.set('buttonColor', snapshot.theme.buttonColor);
    params.set('navColor', snapshot.theme.navColor);
    params.set('buttonTextColor', snapshot.theme.buttonTextColor);
    params.set('secondaryTextColor', snapshot.theme.secondaryTextColor);
    params.set('borderColor', snapshot.theme.borderColor);

    if (snapshot.userId) {
        params.set('userId', snapshot.userId);
    }

    if (snapshot.theme.choirId) {
        params.set('themeChoirId', snapshot.theme.choirId);
    }

    if (snapshot.theme.createdAt) {
        params.set('createdAt', snapshot.theme.createdAt);
    }

    if (snapshot.theme.updatedAt) {
        params.set('updatedAt', snapshot.theme.updatedAt);
    }

    return params.toString();
};

const deserializeSnapshot = (value: string): AdminThemeSnapshot | null => {
    const params = new URLSearchParams(value);
    const choirCode = normalizeChoirCode(params.get('choirCode') ?? '');
    const sourceValue = params.get('source');
    const id = params.get('id')?.trim() ?? '';
    const name = params.get('name')?.trim() ?? '';
    const primaryColor = params.get('primaryColor')?.trim() ?? '';
    const accentColor = params.get('accentColor')?.trim() ?? '';
    const backgroundColor = params.get('backgroundColor')?.trim() ?? '';
    const textColor = params.get('textColor')?.trim() ?? '';
    const cardColor = params.get('cardColor')?.trim() ?? '';
    const buttonColor = params.get('buttonColor')?.trim() ?? '';
    const navColor = params.get('navColor')?.trim() ?? '';
    const buttonTextColor = params.get('buttonTextColor')?.trim() ?? '';
    const secondaryTextColor = params.get('secondaryTextColor')?.trim() ?? '';
    const borderColor = params.get('borderColor')?.trim() ?? '';

    if (
        !choirCode
        || (sourceValue !== 'global' && sourceValue !== 'personal')
        || !id
        || !name
        || !primaryColor
        || !accentColor
        || !backgroundColor
        || !textColor
        || !cardColor
        || !buttonColor
        || !navColor
        || !buttonTextColor
        || !secondaryTextColor
        || !borderColor
    ) {
        return null;
    }

    return {
        choirCode,
        userId: params.get('userId')?.trim() || null,
        source: sourceValue,
        theme: {
            id,
            name,
            isDark: params.get('isDark') === 'true',
            primaryColor,
            accentColor,
            backgroundColor,
            textColor,
            cardColor,
            buttonColor,
            navColor,
            buttonTextColor,
            secondaryTextColor,
            borderColor,
            choirId: params.get('themeChoirId')?.trim() || null,
            createdAt: params.get('createdAt')?.trim() || undefined,
            updatedAt: params.get('updatedAt')?.trim() || undefined,
        },
    };
};

export const readActiveAdminThemeSnapshot = (): AdminThemeSnapshot | null => {
    const storedValue = readStorageValue(ACTIVE_ADMIN_THEME_KEY);
    return storedValue ? deserializeSnapshot(storedValue) : null;
};

export const writeActiveAdminThemeSnapshot = (
    snapshot: AdminThemeSnapshot,
): void => {
    if (!normalizeChoirCode(snapshot.choirCode)) {
        return;
    }

    writeStorageValue(ACTIVE_ADMIN_THEME_KEY, serializeSnapshot(snapshot));
};

export const clearActiveAdminThemeSnapshot = (): void => {
    removeStorageValue(ACTIVE_ADMIN_THEME_KEY);
};
