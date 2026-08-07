// src/services/admin/choirs.ts

import api from '../../api/axios';
import type {
    Choir,
    CreateChoirPayload,
    PaginatedChoirResponse,
} from '../../types/choir';

export const getChoirs = async (page = 1): Promise<PaginatedChoirResponse> => {
    const { data } = await api.get<PaginatedChoirResponse>('/choirs', {
        params: { page },
    });
    return data;
};

export const getChoirById = async (id: string): Promise<Choir> => {
    const { data } = await api.get<Choir>(`/choirs/${encodeURIComponent(id)}`);
    return data;
};

export const saveChoir = async (
    payload: CreateChoirPayload,
    file?: File,
    id?: string,
): Promise<Choir> => {
    const formData = new FormData();

    formData.append('name', payload.name.trim());
    formData.append('code', payload.code.trim().toLowerCase());

    if (payload.description?.trim()) {
        formData.append('description', payload.description.trim());
    }

    if (typeof payload.isActive === 'boolean') {
        formData.append('isActive', String(payload.isActive));
    }

    if (file) {
        formData.append('file', file);
    }

    const request = id
        ? api.put<Choir>(`/choirs/${encodeURIComponent(id)}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        : api.post<Choir>('/choirs', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    const { data } = await request;
    return data;
};

export const deleteChoir = async (id: string): Promise<void> => {
    await api.delete(`/choirs/${encodeURIComponent(id)}`);
};
