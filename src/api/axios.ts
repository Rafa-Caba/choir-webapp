// src/api/axios.ts

import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig,
} from 'axios';
import ENV from '../config/env';
import type { AuthSessionResponse } from '../types/auth';
import type { ApiErrorResponse } from '../types/api/http';
import { authBridge } from './authTokenBridge';
import { tenantContextBridge } from './tenantContextBridge';
import { normalizeApiRequestPath, shouldAttachTargetChoir } from './requestScope';

const TERMINAL_SESSION_CODES = new Set([
    'AUTHENTICATED_USER_NOT_FOUND',
    'SESSION_REVOKED',
    'USER_INACTIVE',
    'CHOIR_INACTIVE',
]);

const AUTH_ROUTES_WITHOUT_REFRESH = new Set([
    '/auth/login',
    '/auth/platform-login',
    '/auth/bootstrap',
    '/auth/refresh',
    '/auth/logout',
]);

const retriedRequests = new WeakSet<InternalAxiosRequestConfig>();
let refreshPromise: Promise<AuthSessionResponse> | null = null;

const api = axios.create({
    baseURL: ENV.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: ENV.API_REQUEST_TIMEOUT_MS,
    withCredentials: false,
});

export const publicApi = axios.create({
    baseURL: ENV.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: ENV.API_REQUEST_TIMEOUT_MS,
    withCredentials: false,
});

const refreshSession = async (): Promise<AuthSessionResponse> => {
    const refreshToken = authBridge.getRefreshToken();

    if (!refreshToken) {
        throw new Error('No refresh token is available');
    }

    const response = await publicApi.post<AuthSessionResponse>('/auth/refresh', {
        refreshToken,
    });

    await authBridge.applySession(response.data);
    return response.data;
};

api.interceptors.request.use(
    (config) => {
        const accessToken = authBridge.getAccessToken();
        const targetChoirId = tenantContextBridge.getTargetChoirId()?.trim() || null;

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        config.headers.delete('x-target-choir-id');

        if (targetChoirId && shouldAttachTargetChoir(config.url, targetChoirId)) {
            config.headers.set('x-target-choir-id', targetChoirId);
        }

        return config;
    },
    (error: AxiosError<ApiErrorResponse>) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config;
        const errorCode = error.response?.data?.code;

        if (errorCode && TERMINAL_SESSION_CODES.has(errorCode)) {
            await authBridge.expireSession();
            return Promise.reject(error);
        }

        const requestPath = normalizeApiRequestPath(originalRequest?.url);
        const refreshToken = authBridge.getRefreshToken();
        const refreshIsAllowed = !AUTH_ROUTES_WITHOUT_REFRESH.has(requestPath);

        if (!originalRequest || error.response?.status !== 401 || !refreshIsAllowed) {
            return Promise.reject(error);
        }

        if (retriedRequests.has(originalRequest) || !refreshToken) {
            await authBridge.expireSession();
            return Promise.reject(error);
        }

        retriedRequests.add(originalRequest);

        try {
            refreshPromise ??= refreshSession().finally(() => {
                refreshPromise = null;
            });

            const session = await refreshPromise;
            originalRequest.headers.set('Authorization', `Bearer ${session.accessToken}`);
            return api(originalRequest);
        } catch (refreshError) {
            const refreshStatus = axios.isAxiosError(refreshError)
                ? refreshError.response?.status
                : undefined;
            const refreshWasRejected = refreshStatus === 400 ||
                refreshStatus === 401 ||
                refreshStatus === 403;

            if (refreshWasRejected) {
                await authBridge.expireSession();
            }

            return Promise.reject(refreshError);
        }
    },
);

export default api;
export const API_BASE_URL = ENV.API_BASE_URL;
export const API_REQUEST_TIMEOUT_MS = ENV.API_REQUEST_TIMEOUT_MS;
