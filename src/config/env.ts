// src/config/env.ts

const DEFAULT_API_ORIGIN = 'http://localhost:10000';
const DEFAULT_REQUEST_TIMEOUT_MS = 12000;

const removeTrailingSlashes = (value: string): string => value.replace(/\/+$/u, '');

const normalizeApiBaseUrl = (rawValue: string | undefined): string => {
    const normalizedValue = removeTrailingSlashes(rawValue?.trim() || DEFAULT_API_ORIGIN);

    if (normalizedValue.endsWith('/api')) {
        return normalizedValue;
    }

    return `${normalizedValue}/api`;
};

const parseRequestTimeout = (rawValue: string | undefined): number => {
    if (!rawValue) {
        return DEFAULT_REQUEST_TIMEOUT_MS;
    }

    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue) || parsedValue < 1000) {
        throw new Error('VITE_API_REQUEST_TIMEOUT_MS must be a number greater than or equal to 1000');
    }

    return parsedValue;
};

export interface AppEnvironment {
    readonly API_BASE_URL: string;
    readonly API_REQUEST_TIMEOUT_MS: number;
}

const ENV: AppEnvironment = Object.freeze({
    API_BASE_URL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
    API_REQUEST_TIMEOUT_MS: parseRequestTimeout(import.meta.env.VITE_API_REQUEST_TIMEOUT_MS),
});

export default ENV;
