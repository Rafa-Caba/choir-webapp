// src/store/public/useThemeStore.ts

import { create } from 'zustand';
import { getPublicThemes } from '../../services/public/theme';
import type { Theme } from '../../types/theme';
import type { PublicResourceStatus } from './index';
import {
    getPublicResourceError,
    isPublicRequestCancelled,
    normalizePublicStoreChoirCode,
} from './publicStoreSupport';

interface PublicThemesState {
    themes: Theme[];
    loading: boolean;
    status: PublicResourceStatus;
    loadedChoirCode: string | null;
    errorCode: string | null;
    errorMessage: string | null;
    fetchThemes: (choirCode: string) => Promise<void>;
    reset: () => void;
}

let activeController: AbortController | null = null;

const initialState = {
    themes: [] as Theme[],
    loading: false,
    status: 'idle' as const,
    loadedChoirCode: null,
    errorCode: null,
    errorMessage: null,
};

export const useThemeStore = create<PublicThemesState>((set, get) => ({
    ...initialState,
    fetchThemes: async (choirCode) => {
        const normalizedCode = normalizePublicStoreChoirCode(choirCode);

        if (get().loadedChoirCode === normalizedCode && get().status === 'ready') {
            return;
        }

        activeController?.abort();
        const controller = new AbortController();
        activeController = controller;

        set({
            ...initialState,
            loading: true,
            status: 'loading',
            loadedChoirCode: normalizedCode,
        });

        try {
            const data = await getPublicThemes(normalizedCode, controller.signal);

            if (activeController !== controller || get().loadedChoirCode !== normalizedCode) {
                return;
            }

            set({
                themes: data,
                loading: false,
                status: 'ready',
                loadedChoirCode: normalizedCode,
                errorCode: null,
                errorMessage: null,
            });
        } catch (error) {
            const requestError = error instanceof Error
                ? error
                : new Error('Unexpected public request failure');

            if (isPublicRequestCancelled(requestError)) {
                return;
            }

            if (activeController !== controller || get().loadedChoirCode !== normalizedCode) {
                return;
            }

            const publicError = getPublicResourceError(requestError);
            set({
                ...initialState,
                status: 'error',
                loadedChoirCode: normalizedCode,
                errorCode: publicError.code,
                errorMessage: publicError.message,
            });
        } finally {
            if (activeController === controller) {
                activeController = null;
            }
        }
    },
    reset: () => {
        activeController?.abort();
        activeController = null;
        set(initialState);
    },
}));
