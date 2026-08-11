// src/storage/choirThemeStorage.ts

import type { Theme } from '../types/theme';
import {
    buildAppStorageKey,
    readStorageValue,
    removeStorageValue,
    writeStorageValue,
} from './appStorage.js';

const normalizeChoirCode = (choirCode: string): string => choirCode.trim().toLowerCase();

export const buildChoirThemeKey = (choirCode: string): string => buildAppStorageKey(
    'theme',
    normalizeChoirCode(choirCode),
);

const serializeTheme = (choirCode: string, theme: Theme): string => {
    const params = new URLSearchParams();

    params.set('choirCode', normalizeChoirCode(choirCode));
    params.set('id', theme.id);
    params.set('name', theme.name);
    params.set('isDark', String(theme.isDark));
    params.set('primaryColor', theme.primaryColor);
    params.set('accentColor', theme.accentColor);
    params.set('backgroundColor', theme.backgroundColor);
    params.set('textColor', theme.textColor);
    params.set('cardColor', theme.cardColor);
    params.set('buttonColor', theme.buttonColor);
    params.set('navColor', theme.navColor);
    params.set('buttonTextColor', theme.buttonTextColor);
    params.set('secondaryTextColor', theme.secondaryTextColor);
    params.set('borderColor', theme.borderColor);

    if (theme.choirId) {
        params.set('choirId', theme.choirId);
    }

    if (theme.createdAt) {
        params.set('createdAt', theme.createdAt);
    }

    if (theme.updatedAt) {
        params.set('updatedAt', theme.updatedAt);
    }

    return params.toString();
};

const deserializeTheme = (value: string, expectedChoirCode: string): Theme | null => {
    const params = new URLSearchParams(value);
    const storedChoirCode = normalizeChoirCode(params.get('choirCode') ?? '');
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
        storedChoirCode !== normalizeChoirCode(expectedChoirCode)
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
        choirId: params.get('choirId')?.trim() || null,
        createdAt: params.get('createdAt')?.trim() || undefined,
        updatedAt: params.get('updatedAt')?.trim() || undefined,
    };
};

export const readChoirTheme = (choirCode: string): Theme | null => {
    const normalizedCode = normalizeChoirCode(choirCode);
    const storedValue = readStorageValue(buildChoirThemeKey(normalizedCode));

    return storedValue ? deserializeTheme(storedValue, normalizedCode) : null;
};

export const writeChoirTheme = (choirCode: string, theme: Theme): void => {
    const normalizedCode = normalizeChoirCode(choirCode);

    if (!normalizedCode) {
        return;
    }

    writeStorageValue(
        buildChoirThemeKey(normalizedCode),
        serializeTheme(normalizedCode, theme),
    );
};

export const activateCachedChoirTheme = (choirCode: string): Theme | null => (
    readChoirTheme(choirCode)
);

export const removeChoirTheme = (choirCode: string): void => {
    removeStorageValue(buildChoirThemeKey(choirCode));
};
