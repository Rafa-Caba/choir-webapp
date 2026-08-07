// src/store/public/useSongStore.ts

import { create } from 'zustand';
import { getPublicSongs } from '../../services/public/song';
import type { Song } from '../../types/song';
import type { PublicResourceStatus } from './index';
import {
    getPublicResourceError,
    isPublicRequestCancelled,
    normalizePublicStoreChoirCode,
} from './publicStoreSupport';

interface PublicSongsState {
    songs: Song[];
    loading: boolean;
    status: PublicResourceStatus;
    loadedChoirCode: string | null;
    errorCode: string | null;
    errorMessage: string | null;
    fetchSongs: (choirCode: string) => Promise<void>;
    reset: () => void;
}

let activeController: AbortController | null = null;

const initialState = {
    songs: [] as Song[],
    loading: false,
    status: 'idle' as const,
    loadedChoirCode: null,
    errorCode: null,
    errorMessage: null,
};

export const useSongStore = create<PublicSongsState>((set, get) => ({
    ...initialState,
    fetchSongs: async (choirCode) => {
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
            const data = await getPublicSongs(normalizedCode, controller.signal);

            if (activeController !== controller || get().loadedChoirCode !== normalizedCode) {
                return;
            }

            set({
                songs: data,
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
