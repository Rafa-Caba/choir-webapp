// src/storage/appStorage.ts

export const APP_STORAGE_PREFIX = 'choir-web:';

export const APP_STORAGE_KEYS = Object.freeze({
    accessToken: `${APP_STORAGE_PREFIX}session:access-token`,
    refreshToken: `${APP_STORAGE_PREFIX}session:refresh-token`,
    sessionId: `${APP_STORAGE_PREFIX}session:id`,
    user: `${APP_STORAGE_PREFIX}session:user`,
    choir: `${APP_STORAGE_PREFIX}session:choir`,
    requiresPasswordChange: `${APP_STORAGE_PREFIX}session:requires-password-change`,
    accessMode: `${APP_STORAGE_PREFIX}session:access-mode`,
    lastChoirCode: `${APP_STORAGE_PREFIX}preferences:last-choir-code`,
    targetChoirId: `${APP_STORAGE_PREFIX}platform:target-choir-id`,
});

export const LEGACY_AUTH_KEYS = Object.freeze([
    'token',
    'refreshToken',
    'role',
]);

export const buildAppStorageKey = (...segments: readonly string[]): string => (
    `${APP_STORAGE_PREFIX}${segments.map((segment) => segment.trim()).join(':')}`
);

export const isChoirWebStorageKey = (key: string): boolean => (
    key.startsWith(APP_STORAGE_PREFIX)
);

const getBrowserStorage = (): Storage | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return window.localStorage;
    } catch {
        return null;
    }
};

export const readStorageValue = (key: string): string | null => {
    return getBrowserStorage()?.getItem(key) ?? null;
};

export const writeStorageValue = (key: string, value: string): void => {
    getBrowserStorage()?.setItem(key, value);
};

export const removeStorageValue = (key: string): void => {
    getBrowserStorage()?.removeItem(key);
};

export const removeStorageValues = (keys: readonly string[]): void => {
    const storage = getBrowserStorage();

    if (!storage) {
        return;
    }

    keys.forEach((key) => storage.removeItem(key));
};

export const removeStorageKeysMatching = (
    predicate: (key: string) => boolean,
): void => {
    const storage = getBrowserStorage();

    if (!storage) {
        return;
    }

    const keysToRemove: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);

        if (key && predicate(key)) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach((key) => storage.removeItem(key));
};

export const clearChoirWebStorage = (): void => {
    removeStorageKeysMatching(isChoirWebStorageKey);
    removeStorageValues(LEGACY_AUTH_KEYS);
};

export const readLegacyAccessToken = (): string | null => readStorageValue('token');
export const readLegacyRefreshToken = (): string | null => readStorageValue('refreshToken');
