// src/services/admin/users.ts

import api from '../../api/axios';
import type { User } from '../../types/auth';

export type TenantUserRole = 'ADMIN' | 'EDITOR' | 'USER' | 'VIEWER';

export interface SaveUserPayload {
    readonly name: string;
    readonly username: string;
    readonly email: string;
    readonly role: TenantUserRole;
    readonly instrumentId?: string;
    readonly instrumentLabel?: string;
    readonly bio?: string;
    readonly voice?: boolean;
    readonly temporaryPassword?: string;
}

export interface UserListFilters {
    readonly role?: TenantUserRole;
    readonly isActive?: boolean;
}

export interface PaginatedUsersResponse {
    readonly users: User[];
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalUsers: number;
}

export interface CreateUserResponse {
    readonly message: string;
    readonly user: User;
    readonly temporaryPassword: string;
}

export interface UpdateUserResponse {
    readonly message: string;
    readonly user: User;
    readonly sessionsRevoked: boolean;
}

export interface UserStatusResponse {
    readonly user: User;
}

export interface ResetUserPasswordResponse {
    readonly message: string;
    readonly temporaryPassword: string;
}

export type SaveUserResult =
    | {
        readonly operation: 'created';
        readonly user: User;
        readonly message: string;
        readonly temporaryPassword: string;
    }
    | {
        readonly operation: 'updated';
        readonly user: User;
        readonly message: string;
        readonly sessionsRevoked: boolean;
    };

interface UserResponse {
    readonly user: User;
}

const appendOptionalString = (
    formData: FormData,
    key: string,
    value: string | undefined,
): void => {
    const normalizedValue = value?.trim();

    if (normalizedValue) {
        formData.append(key, normalizedValue);
    }
};

const createUserFormData = (
    payload: SaveUserPayload,
    file: File | undefined,
    includeTemporaryPassword: boolean,
): FormData => {
    const formData = new FormData();

    formData.append('name', payload.name.trim());
    formData.append('username', payload.username.trim().toLowerCase());
    formData.append('email', payload.email.trim().toLowerCase());
    formData.append('role', payload.role);
    formData.append('voice', String(payload.voice ?? false));
    appendOptionalString(formData, 'instrumentId', payload.instrumentId);
    appendOptionalString(formData, 'instrumentLabel', payload.instrumentLabel);
    appendOptionalString(formData, 'bio', payload.bio);

    if (includeTemporaryPassword) {
        appendOptionalString(formData, 'temporaryPassword', payload.temporaryPassword);
    }

    if (file) {
        formData.append('file', file);
    }

    return formData;
};

export const getAllUsers = async (
    page = 1,
    limit = 10,
    filters: UserListFilters = {},
): Promise<PaginatedUsersResponse> => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });

    if (filters.role) {
        params.set('role', filters.role);
    }

    if (typeof filters.isActive === 'boolean') {
        params.set('isActive', String(filters.isActive));
    }

    const { data } = await api.get<PaginatedUsersResponse>(
        `/users?${params.toString()}`,
    );
    return data;
};

export const getUserById = async (id: string): Promise<User> => {
    const { data } = await api.get<UserResponse>(`/users/${encodeURIComponent(id)}`);
    return data.user;
};

export const getUserDirectory = async (): Promise<User[]> => {
    const { data } = await api.get<{ readonly users: User[] }>('/users/directory');
    return data.users;
};

export const updateSelfProfile = async (formData: FormData): Promise<User> => {
    const { data } = await api.put<UserResponse>('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.user;
};

export const updateSelfTheme = async (themeId: string | null): Promise<User> => {
    const { data } = await api.put<UserResponse>('/users/me/theme', { themeId });
    return data.user;
};

export const createUser = async (
    payload: SaveUserPayload,
    file?: File,
): Promise<CreateUserResponse> => {
    const { data } = await api.post<CreateUserResponse>(
        '/users',
        createUserFormData(payload, file, true),
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
};

export const updateUser = async (
    id: string,
    payload: SaveUserPayload,
    file?: File,
): Promise<UpdateUserResponse> => {
    const { data } = await api.put<UpdateUserResponse>(
        `/users/${encodeURIComponent(id)}`,
        createUserFormData(payload, file, false),
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
};

export const saveUser = async (
    payload: SaveUserPayload,
    file?: File,
    id?: string,
): Promise<SaveUserResult> => {
    if (id) {
        const result = await updateUser(id, payload, file);
        return {
            operation: 'updated',
            user: result.user,
            message: result.message,
            sessionsRevoked: result.sessionsRevoked,
        };
    }

    const result = await createUser(payload, file);
    return {
        operation: 'created',
        user: result.user,
        message: result.message,
        temporaryPassword: result.temporaryPassword,
    };
};

export const setUserActiveStatus = async (
    id: string,
    isActive: boolean,
): Promise<User> => {
    const { data } = await api.patch<UserStatusResponse>(
        `/users/${encodeURIComponent(id)}/status`,
        { isActive },
    );
    return data.user;
};

export const resetUserPassword = async (
    id: string,
    temporaryPassword?: string,
): Promise<ResetUserPasswordResponse> => {
    const { data } = await api.post<ResetUserPasswordResponse>(
        `/users/${encodeURIComponent(id)}/reset-password`,
        temporaryPassword?.trim() ? { temporaryPassword: temporaryPassword.trim() } : {},
    );
    return data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`/users/${encodeURIComponent(id)}`);
};
