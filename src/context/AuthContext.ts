// src/context/AuthContext.ts

import { createContext, useContext } from 'react';
import { getPermissions } from '../auth/permissions';
import type { PlatformViewMode } from '../store/platform';
import type {
    AccessMode,
    AuthenticatedChoir,
    AuthSessionResponse,
    AuthStatus,
    ChangePasswordPayload,
    PlatformLoginPayload,
    TenantLoginPayload,
    User,
    UserRole,
} from '../types/auth';
import type { Choir } from '../types/choir';

export interface AuthContextValue {
    readonly accessToken: string | null;
    readonly refreshToken: string | null;
    readonly sessionId: string | null;
    readonly token: string | null;
    readonly user: User | null;
    readonly choir: AuthenticatedChoir | null;
    readonly role: UserRole | null;
    readonly accessMode: AccessMode | null;
    readonly viewMode: PlatformViewMode;
    readonly targetChoir: Choir | null;
    readonly effectiveChoirId: string | null;
    readonly hasTenantContext: boolean;
    readonly targetChoirLoading: boolean;
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
    readonly enterTenantContext: (choir: Choir) => void;
    readonly returnToPlatform: () => void;
    readonly clearError: () => void;
    readonly updateUser: (userData: User) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    const permissions = getPermissions(context.user?.role ?? null);

    return {
        ...context,
        ...permissions,
        choirId: context.effectiveChoirId,
    };
};
