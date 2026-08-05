// src/types/api/http.ts

import type { UserProfile } from '../auth';

export interface ApiMessageResponse {
    readonly message: string;
}

export interface ApiErrorResponse {
    readonly message: string;
    readonly code: string;
    readonly details?: Readonly<Record<string, string>>;
}

export interface UserResponse {
    readonly user: UserProfile;
}

export interface UsersResponse {
    readonly users: UserProfile[];
}

export interface PaginatedUsersResponse extends UsersResponse {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalUsers: number;
}

export interface CreatedUserResponse extends UserResponse, ApiMessageResponse {
    readonly temporaryPassword: string;
}

export interface UpdatedUserResponse extends UserResponse, ApiMessageResponse {
    readonly sessionsRevoked: boolean;
}
