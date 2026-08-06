// src/services/admin/choirs.ts

import api from '../../api/axios';
import type {
    Choir,
    PaginatedChoirResponse,
    CreateChoirPayload,
    PaginatedChoirUsersResponse,
    ChoirUser,
    CreateChoirUserPayload,
    CreateChoirUserResponse,
    UpdateChoirUserPayload,
    UpdateChoirUserResponse,
} from '../../types/choir';

const appendOptionalString = (
    formData: FormData,
    key: string,
    value: string | null | undefined,
): void => {
    if (value !== undefined && value !== null && value.trim() !== '') {
        formData.append(key, value);
    }
};

const appendOptionalBoolean = (
    formData: FormData,
    key: string,
    value: boolean | undefined,
): void => {
    if (typeof value === 'boolean') {
        formData.append(key, String(value));
    }
};

export const getChoirs = async (page: number = 1): Promise<PaginatedChoirResponse> => {
    const { data } = await api.get<PaginatedChoirResponse>(`/choirs?page=${page}`);
    return data;
};

export const getChoirById = async (id: string): Promise<Choir> => {
    const { data } = await api.get<Choir>(`/choirs/${id}`);
    return data;
};

export const saveChoir = async (
    payload: CreateChoirPayload,
    file?: File,
    id?: string,
): Promise<Choir> => {
    const formData = new FormData();

    formData.append('name', payload.name);
    formData.append('code', payload.code);

    if (payload.description) {
        formData.append('description', payload.description);
    }

    if (typeof payload.isActive === 'boolean') {
        formData.append('isActive', String(payload.isActive));
    }

    if (file) {
        formData.append('file', file);
    }

    if (id) {
        const { data } = await api.put<Choir>(`/choirs/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return data;
    }

    const { data } = await api.post<Choir>('/choirs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
};

export const deleteChoir = async (id: string): Promise<void> => {
    await api.delete(`/choirs/${id}`);
};

export const getChoirUsers = async (
    choirId: string,
    page: number = 1,
    limit: number = 10,
): Promise<PaginatedChoirUsersResponse> => {
    void choirId;
    const searchParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });

    const { data } = await api.get<PaginatedChoirUsersResponse>(`/users?${searchParams.toString()}`);
    return data;
};

export const getChoirUserById = async (userId: string): Promise<ChoirUser> => {
    const { data } = await api.get<{ user: ChoirUser }>(`/users/${userId}`);
    return data.user;
};

export const createChoirUser = async (
    choirId: string,
    payload: CreateChoirUserPayload,
    file?: File,
): Promise<ChoirUser> => {
    const formData = new FormData();

    void choirId;
    formData.append('name', payload.name);
    formData.append('username', payload.username);
    formData.append('email', payload.email);
    formData.append('password', payload.password);
    formData.append('role', payload.role);

    appendOptionalString(formData, 'instrumentId', payload.instrumentId);
    appendOptionalString(formData, 'instrumentLabel', payload.instrumentLabel);
    appendOptionalString(formData, 'bio', payload.bio);
    appendOptionalBoolean(formData, 'voice', payload.voice);

    if (file) {
        formData.append('file', file);
    }

    const { data } = await api.post<CreateChoirUserResponse>('/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.user;
};

export const updateChoirUser = async (
    choirId: string,
    userId: string,
    payload: UpdateChoirUserPayload,
    file?: File,
): Promise<ChoirUser> => {
    const formData = new FormData();

    void choirId;
    formData.append('name', payload.name);
    formData.append('username', payload.username);
    formData.append('email', payload.email);
    formData.append('role', payload.role);

    appendOptionalString(formData, 'instrumentId', payload.instrumentId);
    appendOptionalString(formData, 'instrumentLabel', payload.instrumentLabel);
    appendOptionalString(formData, 'bio', payload.bio);
    appendOptionalString(formData, 'password', payload.password);
    appendOptionalBoolean(formData, 'voice', payload.voice);

    if (file) {
        formData.append('file', file);
    }

    const { data } = await api.put<UpdateChoirUserResponse>(`/users/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.user;
};

export const deleteChoirUser = async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
};