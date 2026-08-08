// src/config/envParsing.ts

const DEFAULT_API_ORIGIN = 'http://localhost:10000';
const DEFAULT_REQUEST_TIMEOUT_MS = 12000;
const PUBLIC_CHOIR_CODE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/u;

const removeTrailingSlashes = (value: string): string => value.replace(/\/+$/u, '');

export interface NormalizedApiUrl {
    readonly origin: string;
    readonly baseUrl: string;
}

export const normalizeApiUrl = (rawValue: string | undefined): NormalizedApiUrl => {
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

export const normalizeSocketOrigin = (
    rawValue: string | undefined,
    apiOrigin: string,
): string => {
    const sourceValue = rawValue?.trim() || apiOrigin;
    const parsedUrl = new URL(sourceValue);
    const normalizedPath = removeTrailingSlashes(parsedUrl.pathname);
    const pathWithoutApi = normalizedPath.endsWith('/api')
        ? normalizedPath.slice(0, -4)
        : normalizedPath;

    return removeTrailingSlashes(`${parsedUrl.origin}${pathWithoutApi}`);
};

export const parseRequestTimeout = (rawValue: string | undefined): number => {
    if (!rawValue) {
        return DEFAULT_REQUEST_TIMEOUT_MS;
    }

    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue) || parsedValue < 1000) {
        throw new Error('VITE_API_REQUEST_TIMEOUT_MS must be a number greater than or equal to 1000');
    }

    return parsedValue;
};

export const parseDefaultPublicChoirCode = (rawValue: string | undefined): string | null => {
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
