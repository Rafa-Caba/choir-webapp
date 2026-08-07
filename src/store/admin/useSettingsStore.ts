// src/store/admin/useSettingsStore.ts

import { create } from 'zustand';
import {
    getAdminSettings,
    updateAdminSettings,
} from '../../services/admin/settings';
import type { AppSettings } from '../../types/settings';

interface AdminSettingsState {
    settings: AppSettings | null;
    loading: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (formData: FormData) => Promise<void>;
}

export const useAdminSettingsStore = create<AdminSettingsState>((set) => ({
    settings: null,
    loading: false,

    fetchSettings: async () => {
        set({ loading: true });

        try {
            const data = await getAdminSettings();
            set({ settings: data });
        } catch (error) {
            console.error('Failed to fetch settings', error);
        } finally {
            set({ loading: false });
        }
    },

    updateSettings: async (formData) => {
        set({ loading: true });

        try {
            const updated = await updateAdminSettings(formData);
            set({ settings: updated });
        } finally {
            set({ loading: false });
        }
    },
}));
