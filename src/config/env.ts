// src/config/env.ts

import {
    normalizeApiUrl,
    normalizeSocketOrigin,
    parseDefaultPublicChoirCode,
    parseRequestTimeout,
} from './envParsing';

export interface AppEnvironment {
    readonly API_ORIGIN: string;
    readonly API_BASE_URL: string;
    readonly SOCKET_ORIGIN: string;
    readonly API_REQUEST_TIMEOUT_MS: number;
    readonly DEFAULT_PUBLIC_CHOIR_CODE: string | null;
}

const apiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL);

const ENV: AppEnvironment = Object.freeze({
    API_ORIGIN: apiUrl.origin,
    API_BASE_URL: apiUrl.baseUrl,
    SOCKET_ORIGIN: normalizeSocketOrigin(import.meta.env.VITE_SOCKET_URL, apiUrl.origin),
    API_REQUEST_TIMEOUT_MS: parseRequestTimeout(import.meta.env.VITE_API_REQUEST_TIMEOUT_MS),
    DEFAULT_PUBLIC_CHOIR_CODE: parseDefaultPublicChoirCode(
        import.meta.env.VITE_DEFAULT_PUBLIC_CHOIR_CODE,
    ),
});

export default ENV;
