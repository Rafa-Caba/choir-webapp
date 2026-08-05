// src/storage/sessionStorage.ts

import type { AuthSessionResponse } from '../types/auth';
import {
    APP_STORAGE_KEYS,
    clearChoirWebStorage,
    readLegacyAccessToken,
    readLegacyRefreshToken,
    readStorageValue,
    removeStorageValue,
    writeStorageValue,
} from './appStorage';

export const readAccessToken = (): string | null => (
    readStorageValue(APP_STORAGE_KEYS.accessToken) ?? readLegacyAccessToken()
);

export const readRefreshToken = (): string | null => (
    readStorageValue(APP_STORAGE_KEYS.refreshToken) ?? readLegacyRefreshToken()
);

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
    clearChoirWebStorage();
};
