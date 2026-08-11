// src/services/admin/settings.ts

import api from '../../api/axios';
import type { AppSettings } from '../../types/settings';

export const getAdminSettings = async (): Promise<AppSettings> => {
    const { data } = await api.get<AppSettings>('/settings');
    return data;
};

export const updateAdminSettings = async (formData: FormData): Promise<AppSettings> => {
    const { data } = await api.put<AppSettings>('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const updateAdminActiveTheme = async (
    themeId: string,
): Promise<AppSettings> => {
    const { data } = await api.put<AppSettings>('/settings/theme', { themeId });
    return data;
};
