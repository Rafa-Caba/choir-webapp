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
    readonly password?: string;
}

interface PaginatedUsersResponse {
    readonly users: User[];
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalUsers: number;
}

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

export const getAllUsers = async (page = 1): Promise<PaginatedUsersResponse> => {
    const { data } = await api.get<PaginatedUsersResponse>('/users', {
        params: { page },
    });
    return data;
};

export const getUserById = async (id: string): Promise<User> => {
    const { data } = await api.get<UserResponse>(`/users/${id}`);
    return data.user;
};

export const getUserDirectory = async (): Promise<User[]> => {
    const { data } = await api.get<{ users: User[] }>('/users/directory');
    return data.users;
};

export const updateSelfProfile = async (formData: FormData): Promise<User> => {
    const { data } = await api.put<UserResponse>('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.user;
};

export const updateSelfTheme = async (themeId: string): Promise<User> => {
    const { data } = await api.put<UserResponse>('/users/me/theme', { themeId });
    return data.user;
};

export const saveUser = async (
    payload: SaveUserPayload,
    file?: File,
    id?: string,
): Promise<User> => {
    const formData = new FormData();

    formData.append('name', payload.name.trim());
    formData.append('username', payload.username.trim().toLowerCase());
    formData.append('email', payload.email.trim().toLowerCase());
    formData.append('role', payload.role);
    formData.append('voice', String(payload.voice ?? false));
    appendOptionalString(formData, 'instrumentId', payload.instrumentId);
    appendOptionalString(formData, 'instrumentLabel', payload.instrumentLabel);
    appendOptionalString(formData, 'bio', payload.bio);
    appendOptionalString(formData, 'password', payload.password);

    if (file) {
        formData.append('file', file);
    }

    const request = id
        ? api.put<UserResponse>(`/users/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        : api.post<UserResponse>('/users', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    const { data } = await request;
    return data.user;
};

export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
};
