// src/config/env.ts

const DEFAULT_API_ORIGIN = 'http://localhost:10000';
const DEFAULT_REQUEST_TIMEOUT_MS = 12000;
const PUBLIC_CHOIR_CODE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/u;

const removeTrailingSlashes = (value: string): string => value.replace(/\/+$/u, '');

const normalizeApiUrl = (rawValue: string | undefined): {
    readonly origin: string;
    readonly baseUrl: string;
} => {
    const sourceValue = rawValue?.trim() || DEFAULT_API_ORIGIN;
    const parsedUrl = new URL(sourceValue);
    const normalizedPath = removeTrailingSlashes(parsedUrl.pathname);
    const pathWithoutApi = normalizedPath.endsWith('/api')
        ? normalizedPath.slice(0, -4)
        : normalizedPath;
    const origin = removeTrailingSlashes(`${parsedUrl.origin}${pathWithoutApi}`);

    return {
        origin,
        baseUrl: `${origin}/api`,
    };
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

const parseDefaultPublicChoirCode = (rawValue: string | undefined): string | null => {
    const normalizedValue = rawValue?.trim().toLowerCase() || '';

    if (!normalizedValue) {
        return null;
    }

    if (!PUBLIC_CHOIR_CODE_PATTERN.test(normalizedValue)) {
        throw new Error(
            'VITE_DEFAULT_PUBLIC_CHOIR_CODE must contain lowercase letters, numbers, and internal hyphens only',
        );
    }

    return normalizedValue;
};

export interface AppEnvironment {
    readonly API_ORIGIN: string;
    readonly API_BASE_URL: string;
    readonly API_REQUEST_TIMEOUT_MS: number;
    readonly DEFAULT_PUBLIC_CHOIR_CODE: string | null;
}

const apiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL);

const ENV: AppEnvironment = Object.freeze({
    API_ORIGIN: apiUrl.origin,
    API_BASE_URL: apiUrl.baseUrl,
    API_REQUEST_TIMEOUT_MS: parseRequestTimeout(import.meta.env.VITE_API_REQUEST_TIMEOUT_MS),
    DEFAULT_PUBLIC_CHOIR_CODE: parseDefaultPublicChoirCode(
        import.meta.env.VITE_DEFAULT_PUBLIC_CHOIR_CODE,
    ),
});

export default ENV;
