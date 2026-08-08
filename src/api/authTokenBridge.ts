// src/api/authTokenBridge.ts

import type { AuthSessionResponse } from '../types/auth';
import {
    clearAuthSession,
    persistAuthSession,
    readAccessToken,
    readRefreshToken,
} from '../storage/sessionStorage';

export interface SessionExpiryReason {
    readonly code?: string;
    readonly message?: string;
}

export type ExpireSessionFn = (reason?: SessionExpiryReason) => Promise<void>;

type GetTokenFn = () => string | null;
type ApplySessionFn = (session: AuthSessionResponse) => Promise<void>;

const dispatchSessionEvent = (
    eventName: string,
    detail?: AuthSessionResponse | SessionExpiryReason,
): void => {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

let getAccessTokenFn: GetTokenFn = readAccessToken;
let getRefreshTokenFn: GetTokenFn = readRefreshToken;
let applySessionFn: ApplySessionFn = async (session) => {
    persistAuthSession(session);
    dispatchSessionEvent('choir-web:session-updated', session);
};
let expireSessionFn: ExpireSessionFn = async (reason) => {
    clearAuthSession();
    dispatchSessionEvent('choir-web:session-expired', reason);

    if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/auth/session-expired'
    ) {
        window.location.assign('/auth/session-expired');
    }
};

export const registerAuthBridge = (options: {
    readonly getAccessToken: GetTokenFn;
    readonly getRefreshToken: GetTokenFn;
    readonly applySession: ApplySessionFn;
    readonly expireSession: ExpireSessionFn;
}): void => {
    getAccessTokenFn = options.getAccessToken;
    getRefreshTokenFn = options.getRefreshToken;
    applySessionFn = options.applySession;
    expireSessionFn = options.expireSession;
};

export const authBridge = {
    getAccessToken: (): string | null => getAccessTokenFn(),
    getRefreshToken: (): string | null => getRefreshTokenFn(),
    applySession: (session: AuthSessionResponse): Promise<void> => applySessionFn(session),
    expireSession: (reason?: SessionExpiryReason): Promise<void> => expireSessionFn(reason),
};
