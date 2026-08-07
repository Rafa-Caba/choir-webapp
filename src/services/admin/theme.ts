// src/services/admin/theme.ts

import api from '../../api/axios';
import type { CreateThemePayload, Theme } from '../../types/theme';

export const getAllThemes = async (): Promise<Theme[]> => {
    const { data } = await api.get<Theme[]>('/themes');
    return data;
};

export const getThemeById = async (id: string): Promise<Theme> => {
    const { data } = await api.get<Theme>(`/themes/${encodeURIComponent(id)}`);
    return data;
};

export const createTheme = async (payload: CreateThemePayload): Promise<Theme> => {
    const { data } = await api.post<Theme>('/themes', payload);
    return data;
};

export const updateTheme = async (
    id: string,
    payload: Partial<CreateThemePayload>,
): Promise<Theme> => {
    const { data } = await api.put<Theme>(
        `/themes/${encodeURIComponent(id)}`,
        payload,
    );
    return data;
};

export const deleteTheme = async (id: string): Promise<void> => {
    await api.delete(`/themes/${encodeURIComponent(id)}`);
};
