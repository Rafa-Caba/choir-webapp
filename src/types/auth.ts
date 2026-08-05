// src/types/auth.ts

import type { Theme } from './theme';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'USER' | 'VIEWER';
export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';
export type AccessMode = 'tenant' | 'platform';

interface UserIdentity {
    readonly id: string;
    readonly name: string;
    readonly username: string;
    readonly email: string;
    readonly role: UserRole;
}

export interface AuthenticatedChoir {
    readonly id: string;
    readonly name: string;
    readonly code: string;
    readonly isActive: boolean;
}

export interface AuthenticatedUser extends UserIdentity {
    readonly choirId: string | null;
    readonly preferredChoirId: string | null;
    readonly isActive: boolean;
    readonly mustChangePassword: boolean;
    readonly sessionVersion: number;
}

export interface UserProfile extends UserIdentity {
    readonly imageUrl: string;
    readonly instrumentId: string | null;
    readonly instrumentLabel: string;
    readonly voice: boolean;
    readonly bio: string;
    readonly themeId: string | null;
    readonly choirId: string | null;
    readonly preferredChoirId: string | null;
    readonly isActive: boolean;
    readonly mustChangePassword: boolean;
    readonly lastAccess: string | null;
    readonly createdAt: string | null;
    readonly updatedAt: string | null;
}

export interface User extends AuthenticatedUser {
    readonly imageUrl?: string;
    readonly imagePublicId?: string;
    readonly instrument?: string;
    readonly instrumentId?: string | null;
    readonly instrumentLabel?: string;
    readonly voice?: boolean;
    readonly bio?: string;
    readonly themeId?: string | Theme | null;
    readonly pushToken?: string | null;
    readonly lastAccess?: string | null;
    readonly createdAt?: string | null;
    readonly updatedAt?: string | null;
    readonly choirName?: string;
    readonly choirCode?: string;
}

export interface AuthSessionResponse {
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly sessionId: string;
    readonly user: AuthenticatedUser;
    readonly choir: AuthenticatedChoir | null;
    readonly requiresPasswordChange: boolean;
}

export interface CurrentSessionResponse {
    readonly user: AuthenticatedUser;
    readonly choir: AuthenticatedChoir | null;
    readonly targetChoir: AuthenticatedChoir | null;
    readonly effectiveChoirId: string | null;
    readonly requiresPasswordChange: boolean;
}

export interface TenantLoginPayload {
    readonly choirCode: string;
    readonly identifier: string;
    readonly password: string;
}

export interface PlatformLoginPayload {
    readonly identifier: string;
    readonly password: string;
}

export interface ChangePasswordPayload {
    readonly currentPassword: string;
    readonly newPassword: string;
}

export interface LogoutPayload {
    readonly refreshToken: string;
    readonly deviceId?: string;
}

export interface UpdateProfileInput {
    readonly name?: string;
    readonly username?: string;
    readonly email?: string;
    readonly instrumentId?: string | null;
    readonly instrumentLabel?: string;
    readonly voice?: boolean;
    readonly bio?: string;
    readonly preferredChoirId?: string | null;
}
