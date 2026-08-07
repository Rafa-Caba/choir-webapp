// src/store/admin/useThemeStore.ts

import { create } from 'zustand';
import {
    createTheme,
    deleteTheme,
    getAllThemes,
    getThemeById,
    updateTheme,
} from '../../services/admin/theme';
import {
    beginTenantStoreRequest,
    isTenantStoreRequestCurrent,
} from '../tenantStoreScope';
import type { CreateThemePayload, Theme } from '../../types/theme';

interface AdminThemeState {
    readonly themes: Theme[];
    readonly currentTheme: Theme | null;
    readonly activeChoirId: string | null;
    readonly loading: boolean;
    readonly fetchThemes: () => Promise<void>;
    readonly getTheme: (id: string) => Promise<Theme | null>;
    readonly addTheme: (payload: CreateThemePayload) => Promise<Theme>;
    readonly editTheme: (
        id: string,
        payload: Partial<CreateThemePayload>,
    ) => Promise<Theme>;
    readonly removeTheme: (id: string) => Promise<void>;
}

const upsertTheme = (themes: readonly Theme[], nextTheme: Theme): Theme[] => (
    themes.some((theme) => theme.id === nextTheme.id)
        ? themes.map((theme) => theme.id === nextTheme.id ? nextTheme : theme)
        : [...themes, nextTheme]
);

export const useThemeStore = create<AdminThemeState>((set) => ({
    themes: [],
    currentTheme: null,
    activeChoirId: null,
    loading: false,

    fetchThemes: async () => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const themes = await getAllThemes();

            if (isTenantStoreRequestCurrent(scope)) {
                set({ themes });
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    getTheme: async (id) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const theme = await getThemeById(id);

            if (!isTenantStoreRequestCurrent(scope)) {
                return null;
            }

            set((state) => ({
                themes: upsertTheme(state.themes, theme),
                currentTheme: theme,
            }));
            return theme;
        } catch {
            return null;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    addTheme: async (payload) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const theme = await createTheme(payload);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    themes: upsertTheme(state.themes, theme),
                    currentTheme: theme,
                }));
            }

            return theme;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    editTheme: async (id, payload) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const theme = await updateTheme(id, payload);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    themes: upsertTheme(state.themes, theme),
                    currentTheme: theme,
                }));
            }

            return theme;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    removeTheme: async (id) => {
        const scope = beginTenantStoreRequest();
        await deleteTheme(id);

        if (isTenantStoreRequestCurrent(scope)) {
            set((state) => ({
                themes: state.themes.filter((theme) => theme.id !== id),
                currentTheme: state.currentTheme?.id === id ? null : state.currentTheme,
            }));
        }
    },
}));
