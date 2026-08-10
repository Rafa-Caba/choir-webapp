// src/storage/themePreferenceStorage.ts

import type { Theme } from '../types/theme';
import {
    buildAppStorageKey,
    readStorageValue,
    removeStorageValue,
    writeStorageValue,
} from './appStorage';

const ACTIVE_THEME_KEY = buildAppStorageKey('preferences', 'active-admin-theme');

const normalizeSegment = (value: string): string => value.trim();

export const buildThemePreferenceKey = (
    choirId: string,
    userId: string,
): string => buildAppStorageKey(
    normalizeSegment(choirId),
    normalizeSegment(userId),
    'theme',
);

const serializeTheme = (theme: Theme): string => {
    const params = new URLSearchParams();

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

const deserializeTheme = (value: string): Theme | null => {
    const params = new URLSearchParams(value);
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
        !id
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

export const readThemePreference = (
    choirId: string,
    userId: string,
): Theme | null => {
    const storedValue = readStorageValue(buildThemePreferenceKey(choirId, userId));
    return storedValue ? deserializeTheme(storedValue) : null;
};

export const writeThemePreference = (
    choirId: string,
    userId: string,
    theme: Theme,
): void => {
    const serializedTheme = serializeTheme(theme);

    writeStorageValue(buildThemePreferenceKey(choirId, userId), serializedTheme);
    writeStorageValue(ACTIVE_THEME_KEY, serializedTheme);
};

export const activateThemePreference = (
    choirId: string,
    userId: string,
): Theme | null => {
    const theme = readThemePreference(choirId, userId);

    if (theme) {
        writeStorageValue(ACTIVE_THEME_KEY, serializeTheme(theme));
    }

    return theme;
};

export const readActiveThemePreference = (): Theme | null => {
    const storedValue = readStorageValue(ACTIVE_THEME_KEY);
    return storedValue ? deserializeTheme(storedValue) : null;
};

export const clearActiveThemePreference = (): void => {
    removeStorageValue(ACTIVE_THEME_KEY);
};

export const removeThemePreference = (
    choirId: string,
    userId: string,
): void => {
    removeStorageValue(buildThemePreferenceKey(choirId, userId));
};
