// src/store/admin/useSettingsStore.ts

import { create } from 'zustand';
import {
    getAdminSettings,
    updateAdminSettings,
} from '../../services/admin/settings';
import {
    beginTenantStoreRequest,
    isTenantStoreRequestCurrent,
} from '../tenantStoreScope';
import type { AppSettings } from '../../types/settings';

interface AdminSettingsState {
    readonly settings: AppSettings | null;
    readonly activeChoirId: string | null;
    readonly loading: boolean;
    readonly fetchSettings: () => Promise<void>;
    readonly updateSettings: (formData: FormData) => Promise<AppSettings>;
}

export const useAdminSettingsStore = create<AdminSettingsState>((set) => ({
    settings: null,
    activeChoirId: null,
    loading: false,

    fetchSettings: async () => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const settings = await getAdminSettings();

            if (isTenantStoreRequestCurrent(scope)) {
                set({ settings });
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    updateSettings: async (formData) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const settings = await updateAdminSettings(formData);

            if (isTenantStoreRequestCurrent(scope)) {
                set({ settings });
            }

            return settings;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },
}));
