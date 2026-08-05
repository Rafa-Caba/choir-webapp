// src/types/auth.ts

import type { Theme } from './theme';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'USER' | 'VIEWER';

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

/** Exact user shape returned inside auth session responses. */
export interface AuthenticatedUser extends UserIdentity {
    readonly choirId: string | null;
    readonly preferredChoirId: string | null;
    readonly isActive: boolean;
    readonly mustChangePassword: boolean;
    readonly sessionVersion: number;
}

/** Exact user shape returned by protected user profile and user administration endpoints. */
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

/**
 * Transitional component model retained until the Phase 3 auth store and Phase 11
 * user services consume AuthenticatedUser and UserProfile independently.
 */
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

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';
export type AccessMode = 'tenant' | 'platform';

/** Transitional alias retained until AuthContext is replaced in Phase 3. */
export interface LoginPayload {
    readonly username: string;
    readonly password: string;
    readonly choirCode?: string;
}

/** Transitional contract retained only until public registration is removed in Phase 4. */
export interface RegisterPayload {
    readonly name: string;
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly instrument?: string;
    readonly choirCode?: string;
}

/** Transitional response retained until the Phase 3 auth store migration. */
export interface AuthResponse extends AuthSessionResponse {
    readonly user: User;
    readonly choirId?: string;
    readonly choirCode?: string;
    readonly message?: string;
}
