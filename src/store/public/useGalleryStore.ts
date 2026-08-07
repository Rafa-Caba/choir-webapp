// src/store/public/useGalleryStore.ts

import { create } from 'zustand';
import { getPublicGallery } from '../../services/public/gallery';
import type { GalleryImage } from '../../types/gallery';
import type { PublicResourceStatus } from './index';
import {
    getPublicResourceError,
    isPublicRequestCancelled,
    normalizePublicStoreChoirCode,
} from './publicStoreSupport';

interface PublicImagesState {
    images: GalleryImage[];
    loading: boolean;
    status: PublicResourceStatus;
    loadedChoirCode: string | null;
    errorCode: string | null;
    errorMessage: string | null;
    fetchGallery: (choirCode: string) => Promise<void>;
    reset: () => void;
}

let activeController: AbortController | null = null;

const initialState = {
    images: [] as GalleryImage[],
    loading: false,
    status: 'idle' as const,
    loadedChoirCode: null,
    errorCode: null,
    errorMessage: null,
};

export const useGalleryStore = create<PublicImagesState>((set, get) => ({
    ...initialState,
    fetchGallery: async (choirCode) => {
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
            const data = await getPublicGallery(normalizedCode, controller.signal);

            if (activeController !== controller || get().loadedChoirCode !== normalizedCode) {
                return;
            }

            set({
                images: data,
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
