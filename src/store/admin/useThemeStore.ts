// src/store/admin/useThemeStore.ts

import { create } from 'zustand';
import {
    createTheme,
    deleteTheme,
    getAllThemes,
    getThemeById,
    updateTheme,
} from '../../services/admin/theme';
import type { CreateThemePayload, Theme } from '../../types/theme';

interface AdminThemeState {
    themes: Theme[];
    loading: boolean;
    fetchThemes: () => Promise<void>;
    getTheme: (id: string) => Promise<Theme | null>;
    addTheme: (payload: CreateThemePayload) => Promise<void>;
    editTheme: (
        id: string,
        payload: Partial<CreateThemePayload>,
    ) => Promise<void>;
    removeTheme: (id: string) => Promise<void>;
}

export const useThemeStore = create<AdminThemeState>((set, get) => ({
    themes: [],
    loading: false,

    fetchThemes: async () => {
        set({ loading: true });

        try {
            const data = await getAllThemes();
            set({ themes: data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },

    getTheme: async (id) => {
        set({ loading: true });

        try {
            return await getThemeById(id);
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            set({ loading: false });
        }
    },

    addTheme: async (payload) => {
        set({ loading: true });

        try {
            await createTheme(payload);
            await get().fetchThemes();
        } finally {
            set({ loading: false });
        }
    },

    editTheme: async (id, payload) => {
        set({ loading: true });

        try {
            await updateTheme(id, payload);
            await get().fetchThemes();
        } finally {
            set({ loading: false });
        }
    },

    removeTheme: async (id) => {
        await deleteTheme(id);
        set((state) => ({
            themes: state.themes.filter((theme) => theme.id !== id),
        }));
    },
}));
