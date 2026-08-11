// src/utils/choirThemeDocument.ts

import type { CreateThemePayload, Theme } from '../types/theme';
import { applyThemeToDocument } from './applyThemeToDocument';

const DEFAULT_LIGHT_THEME: CreateThemePayload = Object.freeze({
    name: 'Light',
    isDark: false,
    primaryColor: '#EAD4FF',
    accentColor: '#CFA5FF',
    backgroundColor: '#FFFFFF',
    textColor: '#111827',
    cardColor: '#F9FAFB',
    buttonColor: '#7C3AED',
    navColor: '#F3E8FF',
    buttonTextColor: '#FFFFFF',
    secondaryTextColor: '#4B5563',
    borderColor: '#E5E7EB',
});

const normalizeChoirCode = (choirCode: string): string => choirCode.trim().toLowerCase();

const markThemeContext = (choirCode: string, themeId: string): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;
    root.dataset.choirThemeCode = normalizeChoirCode(choirCode);
    root.dataset.choirThemeId = themeId;
};

export const applyChoirThemeToDocument = (
    theme: Theme,
    choirCode: string,
): void => {
    applyThemeToDocument(theme);
    markThemeContext(choirCode, theme.id);
};

export const applyDefaultChoirThemeToDocument = (choirCode: string): void => {
    applyThemeToDocument(DEFAULT_LIGHT_THEME);
    markThemeContext(choirCode, 'default-light');
};

export const getAppliedChoirThemeCode = (): string => {
    if (typeof document === 'undefined') {
        return '';
    }

    return normalizeChoirCode(document.documentElement.dataset.choirThemeCode ?? '');
};
