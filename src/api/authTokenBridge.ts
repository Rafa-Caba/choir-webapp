// src/api/authTokenBridge.ts

import type { AuthSessionResponse } from '../types/auth';
import {
    clearAuthSession,
    persistAuthSession,
    readAccessToken,
    readRefreshToken,
} from '../storage/sessionStorage';

export type ExpireSessionFn = () => Promise<void>;

type GetTokenFn = () => string | null;
type ApplySessionFn = (session: AuthSessionResponse) => Promise<void>;

const dispatchSessionEvent = (eventName: string, session?: AuthSessionResponse): void => {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new CustomEvent(eventName, { detail: session }));
};

let getAccessTokenFn: GetTokenFn = readAccessToken;
let getRefreshTokenFn: GetTokenFn = readRefreshToken;
let applySessionFn: ApplySessionFn = async (session) => {
    persistAuthSession(session);
    dispatchSessionEvent('choir-web:session-updated', session);
};
let expireSessionFn: ExpireSessionFn = async () => {
    clearAuthSession();
    dispatchSessionEvent('choir-web:session-expired');

    if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/auth/login'
    ) {
        window.location.assign('/auth/login');
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
    expireSession: (): Promise<void> => expireSessionFn(),
};
