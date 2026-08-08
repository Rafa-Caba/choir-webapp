// src/context/AuthProvider.tsx

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
    registerAuthBridge,
    type SessionExpiryReason,
} from '../api/authTokenBridge';
import {
    changeAuthenticatedPassword,
    getCurrentSession,
    getUserProfile,
    loginPlatformUser,
    loginTenantUser,
    logoutUserSession,
} from '../services/auth';
import {
    clearAuthSession,
    persistAuthSession,
    persistSessionUser,
    readAccessMode,
    readAccessToken,
    readLastChoirCode,
    readRefreshToken,
    readSessionId,
    writeAccessMode,
    writeLastChoirCode,
} from '../storage/sessionStorage';
import { resetAuthenticatedStores } from '../store/resetAuthenticatedStores';
import { clearAllChatCaches } from '../storage/chatStorage';
import { clearAllAdminBrandCaches } from '../storage/adminBrandStorage';
import { clearPublicBrandCache } from '../storage/publicBrandStorage';
import { registerTenantStoreScope } from '../store/tenantStoreScope';
import { useChatStore } from '../store/admin/useChatStore';
import { useTargetChoirStore, type PlatformViewMode } from '../store/platform';
import type {
    AccessMode,
    AuthenticatedChoir,
    AuthenticatedUser,
    AuthSessionResponse,
    AuthStatus,
    ChangePasswordPayload,
    PlatformLoginPayload,
    TenantLoginPayload,
    User,
} from '../types/auth';
import type { Choir } from '../types/choir';
import { AuthContext, type AuthContextValue } from './AuthContext';
import { applyThemeToDocument } from '../utils/applyThemeToDocument';
import { getAuthErrorMessage } from '../auth/authErrorMessages';
import { applyNeutralThemeToDocument } from '../utils/documentBranding';

interface AuthProviderProps {
    readonly children: ReactNode;
}

const resolveAccessMode = (
    user: AuthenticatedUser,
    requestedMode: AccessMode | null,
): AccessMode => {
    if (user.role !== 'SUPER_ADMIN') {
        return 'tenant';
    }

    return requestedMode === 'tenant' ? 'tenant' : 'platform';
};

const mergeProfile = (
    authenticatedUser: AuthenticatedUser,
    profile: Awaited<ReturnType<typeof getUserProfile>>,
): User => ({
    ...profile,
    ...authenticatedUser,
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const navigate = useNavigate();
    const initialAccessToken = readAccessToken();
    const initialRefreshToken = readRefreshToken();

    const [accessToken, setAccessToken] = useState<string | null>(initialAccessToken);
    const [refreshToken, setRefreshToken] = useState<string | null>(initialRefreshToken);
    const [sessionId, setSessionId] = useState<string | null>(readSessionId());
    const [user, setUser] = useState<User | null>(null);
    const [choir, setChoir] = useState<AuthenticatedChoir | null>(null);
    const [accessMode, setAccessMode] = useState<AccessMode | null>(readAccessMode());
    const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
    const [status, setStatus] = useState<AuthStatus>(
        initialAccessToken || initialRefreshToken ? 'checking' : 'unauthenticated',
    );
    const [errorMessage, setErrorMessage] = useState('');
    const [lastChoirCode, setLastChoirCode] = useState(readLastChoirCode());
    const {
        selectedChoir: targetChoir,
        viewMode,
        status: targetChoirStatus,
        selectChoir,
        restoreTargetChoir,
        leaveTenantContext,
        clearSelection,
    } = useTargetChoirStore();

    const accessTokenRef = useRef<string | null>(initialAccessToken);
    const refreshTokenRef = useRef<string | null>(initialRefreshToken);
    const accessModeRef = useRef<AccessMode | null>(readAccessMode());
    const effectiveChoirIdRef = useRef<string | null>(null);
    const restoreStartedRef = useRef(false);

    const setTokenState = useCallback((session: AuthSessionResponse): void => {
        accessTokenRef.current = session.accessToken;
        refreshTokenRef.current = session.refreshToken;
        setAccessToken(session.accessToken);
        setRefreshToken(session.refreshToken);
        setSessionId(session.sessionId);
    }, []);

    const applySessionState = useCallback((
        session: AuthSessionResponse,
        requestedMode: AccessMode | null,
    ): AccessMode => {
        const resolvedMode = resolveAccessMode(session.user, requestedMode);

        persistAuthSession(session);
        writeAccessMode(resolvedMode);
        setTokenState(session);
        accessModeRef.current = resolvedMode;
        setAccessMode(resolvedMode);
        setChoir(session.choir);
        setRequiresPasswordChange(session.requiresPasswordChange);
        setStatus('authenticated');
        setErrorMessage('');
        setUser((currentUser) => (
            currentUser?.id === session.user.id
                ? { ...currentUser, ...session.user }
                : session.user
        ));

        return resolvedMode;
    }, [setTokenState]);

    const clearPrivateBrowserCaches = useCallback((): void => {
        clearAllChatCaches();

        const activeChoirCode = targetChoir?.code ?? user?.choirCode ?? choir?.code ?? '';

        clearAllAdminBrandCaches();

        if (activeChoirCode) {
            clearPublicBrandCache(activeChoirCode);
        }
    }, [choir?.code, targetChoir?.code, user?.choirCode]);

    const clearSessionState = useCallback((redirectToLogin: boolean): void => {
        clearPrivateBrowserCaches();
        clearAuthSession();
        resetAuthenticatedStores();
        applyNeutralThemeToDocument();
        clearSelection();
        accessTokenRef.current = null;
        refreshTokenRef.current = null;
        accessModeRef.current = null;
        setAccessToken(null);
        setRefreshToken(null);
        setSessionId(null);
        setUser(null);
        setChoir(null);
        setAccessMode(null);
        setRequiresPasswordChange(false);
        setStatus('unauthenticated');

        if (redirectToLogin) {
            navigate('/auth/login', { replace: true });
        }
    }, [clearPrivateBrowserCaches, clearSelection, navigate]);

    const expireSession = useCallback(async (
        reason?: SessionExpiryReason,
    ): Promise<void> => {
        const fallbackMessage = reason?.message?.trim() || 'Tu sesión expiró. Inicia sesión nuevamente.';
        const resolvedMessage = getAuthErrorMessage(reason?.code, fallbackMessage);
        const isProtectedLocation = typeof window !== 'undefined' && (
            window.location.pathname.startsWith('/admin') ||
            window.location.pathname === '/auth/change-password'
        );

        setErrorMessage(resolvedMessage);
        clearSessionState(false);

        if (isProtectedLocation) {
            const searchParams = new URLSearchParams({
                code: reason?.code ?? 'SESSION_REVOKED',
                message: resolvedMessage,
            });
            navigate(`/auth/session-expired?${searchParams.toString()}`, { replace: true });
        }
    }, [clearSessionState, navigate]);

    const hydrateProfile = useCallback(async (
        authenticatedUser: AuthenticatedUser,
    ): Promise<User | null> => {
        try {
            const profile = await getUserProfile();
            const mergedUser = mergeProfile(authenticatedUser, profile);
            setUser(mergedUser);
            persistSessionUser(mergedUser);
            return mergedUser;
        } catch {
            return accessTokenRef.current ? authenticatedUser : null;
        }
    }, []);

    const connectTenantChat = useCallback((
        currentAccessToken: string,
        currentUser: User,
        passwordChangeRequired: boolean,
    ): void => {
        const chatStore = useChatStore.getState();
        const targetChoirId = currentUser.role === 'SUPER_ADMIN'
            ? useTargetChoirStore.getState().selectedChoir?.id ?? null
            : currentUser.choirId;

        if (passwordChangeRequired || !targetChoirId) {
            chatStore.disconnect();
            return;
        }

        chatStore.connect(currentAccessToken, currentUser);
    }, []);

    const restoreSession = useCallback(async (): Promise<void> => {
        const storedAccessToken = readAccessToken();
        const storedRefreshToken = readRefreshToken();

        if (!storedAccessToken && !storedRefreshToken) {
            setStatus('unauthenticated');
            return;
        }

        setStatus('checking');
        setErrorMessage('');

        try {
            const currentSession = await getCurrentSession();
            const restoredAccessToken = readAccessToken();
            const restoredRefreshToken = readRefreshToken();
            let restoredMode = resolveAccessMode(
                currentSession.user,
                readAccessMode(),
            );

            if (!restoredAccessToken || !restoredRefreshToken) {
                clearSessionState(false);
                return;
            }

            accessTokenRef.current = restoredAccessToken;
            refreshTokenRef.current = restoredRefreshToken;
            setAccessToken(restoredAccessToken);
            setRefreshToken(restoredRefreshToken);
            setSessionId(readSessionId());
            setChoir(currentSession.choir);
            setRequiresPasswordChange(currentSession.requiresPasswordChange);
            setUser(currentSession.user);

            if (currentSession.user.role === 'SUPER_ADMIN' && restoredMode === 'tenant') {
                const restoredTargetChoir = await restoreTargetChoir();

                if (!restoredTargetChoir) {
                    restoredMode = 'platform';
                }
            } else {
                clearSelection();
            }

            accessModeRef.current = restoredMode;
            writeAccessMode(restoredMode);
            setAccessMode(restoredMode);

            const restoredUser = currentSession.requiresPasswordChange
                ? currentSession.user
                : await hydrateProfile(currentSession.user);

            if (!restoredUser) {
                return;
            }

            setUser(restoredUser);
            setStatus('authenticated');
            connectTenantChat(
                restoredAccessToken,
                restoredUser,
                currentSession.requiresPasswordChange,
            );
        } catch {
            clearSessionState(false);
        }
    }, [clearSelection, clearSessionState, connectTenantChat, hydrateProfile, restoreTargetChoir]);

    useEffect(() => {
        registerAuthBridge({
            getAccessToken: () => accessTokenRef.current,
            getRefreshToken: () => refreshTokenRef.current,
            applySession: async (session) => {
                applySessionState(session, accessModeRef.current);
            },
            expireSession,
        });
    }, [applySessionState, expireSession]);

    useEffect(() => {
        if (restoreStartedRef.current) {
            return;
        }

        restoreStartedRef.current = true;
        void restoreSession();
    }, [restoreSession]);

    useEffect(() => {
        if (user?.themeId && typeof user.themeId === 'object') {
            applyThemeToDocument(user.themeId);
        }
    }, [user]);

    const loginTenant = useCallback(async (
        payload: TenantLoginPayload,
    ): Promise<AuthSessionResponse> => {
        const normalizedPayload: TenantLoginPayload = {
            choirCode: payload.choirCode.trim().toLowerCase(),
            identifier: payload.identifier.trim().toLowerCase(),
            password: payload.password,
        };
        const session = await loginTenantUser(normalizedPayload);

        clearSelection();
        resetAuthenticatedStores();
        applySessionState(session, 'tenant');
        writeLastChoirCode(normalizedPayload.choirCode);
        setLastChoirCode(normalizedPayload.choirCode);

        const sessionUser = session.requiresPasswordChange
            ? session.user
            : await hydrateProfile(session.user);

        if (!sessionUser) {
            throw new Error('The authenticated session expired while loading the user profile');
        }

        setUser(sessionUser);
        connectTenantChat(
            session.accessToken,
            sessionUser,
            session.requiresPasswordChange,
        );

        return session;
    }, [applySessionState, clearSelection, connectTenantChat, hydrateProfile]);

    const loginPlatform = useCallback(async (
        payload: PlatformLoginPayload,
    ): Promise<AuthSessionResponse> => {
        const normalizedPayload: PlatformLoginPayload = {
            identifier: payload.identifier.trim().toLowerCase(),
            password: payload.password,
        };
        const session = await loginPlatformUser(normalizedPayload);

        clearSelection();
        resetAuthenticatedStores();
        applySessionState(session, 'platform');

        const sessionUser = session.requiresPasswordChange
            ? session.user
            : await hydrateProfile(session.user);

        if (!sessionUser) {
            throw new Error('The authenticated session expired while loading the user profile');
        }

        setUser(sessionUser);
        connectTenantChat(
            session.accessToken,
            sessionUser,
            session.requiresPasswordChange,
        );

        return session;
    }, [applySessionState, clearSelection, connectTenantChat, hydrateProfile]);

    const changePassword = useCallback(async (
        payload: ChangePasswordPayload,
    ): Promise<AuthSessionResponse> => {
        const session = await changeAuthenticatedPassword(payload);
        const resolvedMode = applySessionState(session, accessModeRef.current);
        const sessionUser = await hydrateProfile(session.user);

        if (!sessionUser) {
            throw new Error('The authenticated session expired while loading the user profile');
        }

        accessModeRef.current = resolvedMode;
        setUser(sessionUser);
        connectTenantChat(session.accessToken, sessionUser, false);

        return session;
    }, [applySessionState, connectTenantChat, hydrateProfile]);

    const logout = useCallback(async (): Promise<void> => {
        const currentRefreshToken = refreshTokenRef.current;

        useChatStore.getState().disconnect();

        try {
            if (currentRefreshToken) {
                await logoutUserSession({ refreshToken: currentRefreshToken });
            }
        } catch {
            // Local cleanup remains mandatory when the server session already expired.
        } finally {
            setErrorMessage('');
            clearSessionState(true);
        }
    }, [clearSessionState]);

    const enterTenantContext = useCallback((selectedChoir: Choir): void => {
        if (user?.role !== 'SUPER_ADMIN') {
            throw new Error('Only SUPER_ADMIN users can select a platform tenant context');
        }

        selectChoir(selectedChoir);
        accessModeRef.current = 'tenant';
        writeAccessMode('tenant');
        setAccessMode('tenant');
        setErrorMessage('');

        const currentAccessToken = accessTokenRef.current;

        if (currentAccessToken) {
            connectTenantChat(currentAccessToken, user, requiresPasswordChange);
        }
    }, [connectTenantChat, requiresPasswordChange, selectChoir, user]);

    const returnToPlatform = useCallback((): void => {
        if (user?.role !== 'SUPER_ADMIN') {
            return;
        }

        leaveTenantContext();
        accessModeRef.current = 'platform';
        writeAccessMode('platform');
        setAccessMode('platform');
        setErrorMessage('');
    }, [leaveTenantContext, user?.role]);

    const clearError = useCallback((): void => {
        setErrorMessage('');
    }, []);

    const updateUser = useCallback((userData: User): void => {
        setUser((currentUser) => {
            const updatedUser = currentUser
                ? { ...currentUser, ...userData }
                : userData;

            persistSessionUser(updatedUser);
            return updatedUser;
        });
    }, []);

    const effectiveChoirId = user?.role === 'SUPER_ADMIN'
        ? targetChoir?.id ?? null
        : user?.choirId ?? choir?.id ?? null;

    effectiveChoirIdRef.current = effectiveChoirId;
    registerTenantStoreScope(() => effectiveChoirIdRef.current);

    const hasTenantContext = Boolean(effectiveChoirId);
    const resolvedViewMode: PlatformViewMode = user?.role === 'SUPER_ADMIN'
        ? viewMode
        : 'tenant';

    const value = useMemo<AuthContextValue>(() => ({
        accessToken,
        refreshToken,
        sessionId,
        token: accessToken,
        user,
        choir,
        role: user?.role ?? null,
        accessMode,
        viewMode: resolvedViewMode,
        targetChoir,
        effectiveChoirId,
        hasTenantContext,
        targetChoirLoading: targetChoirStatus === 'restoring',
        requiresPasswordChange,
        status,
        loading: status === 'checking',
        errorMessage,
        lastChoirCode,
        loginTenant,
        loginPlatform,
        changePassword,
        logout,
        checkAuth: restoreSession,
        enterTenantContext,
        returnToPlatform,
        clearError,
        updateUser,
    }), [
        accessMode,
        accessToken,
        changePassword,
        choir,
        clearError,
        effectiveChoirId,
        enterTenantContext,
        errorMessage,
        hasTenantContext,
        lastChoirCode,
        loginPlatform,
        loginTenant,
        logout,
        refreshToken,
        requiresPasswordChange,
        restoreSession,
        returnToPlatform,
        sessionId,
        status,
        targetChoir,
        targetChoirStatus,
        updateUser,
        user,
        resolvedViewMode,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

