// src/storage/sessionStorage.ts

import type { AccessMode, AuthSessionResponse, User } from '../types/auth';
import {
    APP_STORAGE_KEYS,
    LEGACY_AUTH_KEYS,
    readLegacyAccessToken,
    readLegacyRefreshToken,
    readStorageValue,
    removeStorageValue,
    removeStorageValues,
    writeStorageValue,
} from './appStorage';

const SESSION_STORAGE_KEYS = Object.freeze([
    APP_STORAGE_KEYS.accessToken,
    APP_STORAGE_KEYS.refreshToken,
    APP_STORAGE_KEYS.sessionId,
    APP_STORAGE_KEYS.user,
    APP_STORAGE_KEYS.choir,
    APP_STORAGE_KEYS.requiresPasswordChange,
    APP_STORAGE_KEYS.accessMode,
    APP_STORAGE_KEYS.targetChoirId,
]);

const normalizeChoirCode = (choirCode: string): string => (
    choirCode.trim().toLowerCase()
);

export const readAccessToken = (): string | null => (
    readStorageValue(APP_STORAGE_KEYS.accessToken) ?? readLegacyAccessToken()
);

export const readRefreshToken = (): string | null => (
    readStorageValue(APP_STORAGE_KEYS.refreshToken) ?? readLegacyRefreshToken()
);

export const readSessionId = (): string | null => (
    readStorageValue(APP_STORAGE_KEYS.sessionId)
);

export const readAccessMode = (): AccessMode | null => {
    const storedMode = readStorageValue(APP_STORAGE_KEYS.accessMode);

    if (storedMode === 'tenant' || storedMode === 'platform') {
        return storedMode;
    }

    return null;
};

export const writeAccessMode = (accessMode: AccessMode): void => {
    writeStorageValue(APP_STORAGE_KEYS.accessMode, accessMode);
};

export const readLastChoirCode = (): string => (
    readStorageValue(APP_STORAGE_KEYS.lastChoirCode) ?? ''
);

export const writeLastChoirCode = (choirCode: string): void => {
    const normalizedChoirCode = normalizeChoirCode(choirCode);

    if (!normalizedChoirCode) {
        removeStorageValue(APP_STORAGE_KEYS.lastChoirCode);
        return;
    }

    writeStorageValue(APP_STORAGE_KEYS.lastChoirCode, normalizedChoirCode);
};

export const readTargetChoirId = (): string | null => (
    readStorageValue(APP_STORAGE_KEYS.targetChoirId)
);

export const writeTargetChoirId = (choirId: string | null): void => {
    const normalizedChoirId = choirId?.trim() || null;

    if (!normalizedChoirId) {
        removeStorageValue(APP_STORAGE_KEYS.targetChoirId);
        return;
    }

    writeStorageValue(APP_STORAGE_KEYS.targetChoirId, normalizedChoirId);
};

export const persistSessionUser = (user: User): void => {
    writeStorageValue(APP_STORAGE_KEYS.user, JSON.stringify(user));
};

export const persistAuthSession = (session: AuthSessionResponse): void => {
    writeStorageValue(APP_STORAGE_KEYS.accessToken, session.accessToken);
    writeStorageValue(APP_STORAGE_KEYS.refreshToken, session.refreshToken);
    writeStorageValue(APP_STORAGE_KEYS.sessionId, session.sessionId);
    writeStorageValue(APP_STORAGE_KEYS.user, JSON.stringify(session.user));
    writeStorageValue(APP_STORAGE_KEYS.choir, JSON.stringify(session.choir));
    writeStorageValue(
        APP_STORAGE_KEYS.requiresPasswordChange,
        String(session.requiresPasswordChange),
    );

    writeStorageValue('token', session.accessToken);
    writeStorageValue('refreshToken', session.refreshToken);
    writeStorageValue('role', session.user.role);
};

export const clearAuthSession = (): void => {
    removeStorageValues(SESSION_STORAGE_KEYS);
    removeStorageValues(LEGACY_AUTH_KEYS);
};
