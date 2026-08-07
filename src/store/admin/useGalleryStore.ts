// src/store/admin/useGalleryStore.ts

import { create } from 'zustand';
import {
    addImage,
    getAdminGallery,
    getGalleryImageById,
    removeImage,
    setFlags,
    updateGalleryImage,
    type GalleryFlags,
} from '../../services/admin/gallery';
import type {
    CreateGalleryPayload,
    GalleryImage,
} from '../../types/gallery';

interface AdminGalleryState {
    images: GalleryImage[];
    loading: boolean;
    currentImage: GalleryImage | null;
    fetchGallery: () => Promise<void>;
    getImage: (id: string) => Promise<GalleryImage | null>;
    editImage: (id: string, formData: FormData) => Promise<void>;
    uploadImage: (payload: CreateGalleryPayload) => Promise<void>;
    deleteImage: (id: string) => Promise<void>;
    updateFlags: (id: string, flags: GalleryFlags) => Promise<void>;
}

const resetExclusiveFlags = (
    image: GalleryImage,
    flags: GalleryFlags,
): GalleryImage => ({
    ...image,
    imageStart: flags.imageStart ? false : image.imageStart,
    imageLogo: flags.imageLogo ? false : image.imageLogo,
    imageTopBar: flags.imageTopBar ? false : image.imageTopBar,
    imageUs: flags.imageUs ? false : image.imageUs,
});

export const useGalleryStore = create<AdminGalleryState>((set, get) => ({
    images: [],
    loading: false,
    currentImage: null,

    fetchGallery: async () => {
        set({ loading: true });

        try {
            const data = await getAdminGallery();
            set({ images: data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },

    getImage: async (id) => {
        set({ loading: true });

        try {
            const image = await getGalleryImageById(id);
            set({ currentImage: image });
            return image;
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            set({ loading: false });
        }
    },

    editImage: async (id, formData) => {
        set({ loading: true });

        try {
            await updateGalleryImage(id, formData);
            await get().fetchGallery();
        } finally {
            set({ loading: false });
        }
    },

    uploadImage: async (payload) => {
        set({ loading: true });

        try {
            await addImage(payload);
            await get().fetchGallery();
        } finally {
            set({ loading: false });
        }
    },

    deleteImage: async (id) => {
        await removeImage(id);
        set((state) => ({
            images: state.images.filter((image) => image.id !== id),
        }));
    },

    updateFlags: async (id, flags) => {
        set((state) => ({
            images: state.images.map((image) => (
                image.id === id
                    ? { ...image, ...flags }
                    : resetExclusiveFlags(image, flags)
            )),
        }));

        await setFlags(id, flags);
    },
}));
