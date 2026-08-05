// src/context/AuthContext.tsx

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { registerAuthBridge } from '../api/authTokenBridge';
import { getPermissions } from '../auth/permissions';
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
import { useChatStore } from '../store/admin/useChatStore';
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
    UserRole,
} from '../types/auth';
import { applyThemeToDocument } from '../utils/applyThemeToDocument';

interface AuthContextType {
    readonly accessToken: string | null;
    readonly refreshToken: string | null;
    readonly sessionId: string | null;
    readonly token: string | null;
    readonly user: User | null;
    readonly choir: AuthenticatedChoir | null;
    readonly role: UserRole | null;
    readonly accessMode: AccessMode | null;
    readonly requiresPasswordChange: boolean;
    readonly status: AuthStatus;
    readonly loading: boolean;
    readonly errorMessage: string;
    readonly lastChoirCode: string;
    readonly loginTenant: (payload: TenantLoginPayload) => Promise<AuthSessionResponse>;
    readonly loginPlatform: (payload: PlatformLoginPayload) => Promise<AuthSessionResponse>;
    readonly changePassword: (payload: ChangePasswordPayload) => Promise<AuthSessionResponse>;
    readonly logout: () => Promise<void>;
    readonly checkAuth: () => Promise<void>;
    readonly clearError: () => void;
    readonly updateUser: (userData: User) => void;
}

interface AuthProviderProps {
    readonly children: ReactNode;
}

const resolveAccessMode = (
    user: AuthenticatedUser,
    requestedMode: AccessMode | null,
): AccessMode => {
    if (requestedMode === 'platform' && user.role === 'SUPER_ADMIN') {
        return 'platform';
    }

    if (requestedMode === 'tenant' && user.role !== 'SUPER_ADMIN') {
        return 'tenant';
    }

    return user.role === 'SUPER_ADMIN' ? 'platform' : 'tenant';
};

const mergeProfile = (
    authenticatedUser: AuthenticatedUser,
    profile: Awaited<ReturnType<typeof getUserProfile>>,
): User => ({
    ...profile,
    ...authenticatedUser,
});

export const AuthContext = createContext<AuthContextType | null>(null);

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

    const accessTokenRef = useRef<string | null>(initialAccessToken);
    const refreshTokenRef = useRef<string | null>(initialRefreshToken);
    const accessModeRef = useRef<AccessMode | null>(readAccessMode());
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

    const clearSessionState = useCallback((redirectToLogin: boolean): void => {
        clearAuthSession();
        resetAuthenticatedStores();
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
    }, [navigate]);

    const expireSession = useCallback(async (): Promise<void> => {
        const isProtectedLocation = typeof window !== 'undefined' && (
            window.location.pathname.startsWith('/admin') ||
            window.location.pathname === '/auth/change-password'
        );

        setErrorMessage('Tu sesión expiró. Inicia sesión nuevamente.');
        clearSessionState(isProtectedLocation);
    }, [clearSessionState]);

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

        if (
            passwordChangeRequired ||
            currentUser.role === 'SUPER_ADMIN' ||
            !currentUser.choirId
        ) {
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
            const restoredMode = resolveAccessMode(
                currentSession.user,
                readAccessMode(),
            );

            if (!restoredAccessToken || !restoredRefreshToken) {
                clearSessionState(false);
                return;
            }

            accessTokenRef.current = restoredAccessToken;
            refreshTokenRef.current = restoredRefreshToken;
            accessModeRef.current = restoredMode;
            writeAccessMode(restoredMode);
            setAccessToken(restoredAccessToken);
            setRefreshToken(restoredRefreshToken);
            setSessionId(readSessionId());
            setAccessMode(restoredMode);
            setChoir(currentSession.choir);
            setRequiresPasswordChange(currentSession.requiresPasswordChange);
            setUser(currentSession.user);

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
    }, [clearSessionState, connectTenantChat, hydrateProfile]);

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
    }, [applySessionState, connectTenantChat, hydrateProfile]);

    const loginPlatform = useCallback(async (
        payload: PlatformLoginPayload,
    ): Promise<AuthSessionResponse> => {
        const normalizedPayload: PlatformLoginPayload = {
            identifier: payload.identifier.trim().toLowerCase(),
            password: payload.password,
        };
        const session = await loginPlatformUser(normalizedPayload);

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
    }, [applySessionState, connectTenantChat, hydrateProfile]);

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

    const value = useMemo<AuthContextType>(() => ({
        accessToken,
        refreshToken,
        sessionId,
        token: accessToken,
        user,
        choir,
        role: user?.role ?? null,
        accessMode,
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
        clearError,
        updateUser,
    }), [
        accessMode,
        accessToken,
        changePassword,
        choir,
        clearError,
        errorMessage,
        lastChoirCode,
        loginPlatform,
        loginTenant,
        logout,
        refreshToken,
        requiresPasswordChange,
        restoreSession,
        sessionId,
        status,
        updateUser,
        user,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    const permissions = getPermissions(context.user?.role ?? null);
    const choirId = context.user?.choirId ?? null;

    return {
        ...context,
        ...permissions,
        choirId,
    };
};
