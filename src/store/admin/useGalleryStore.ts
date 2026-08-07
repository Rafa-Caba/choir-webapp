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
import {
    beginTenantStoreRequest,
    isTenantStoreRequestCurrent,
} from '../tenantStoreScope';
import type {
    CreateGalleryPayload,
    GalleryImage,
} from '../../types/gallery';

interface AdminGalleryState {
    readonly images: GalleryImage[];
    readonly loading: boolean;
    readonly currentImage: GalleryImage | null;
    readonly activeChoirId: string | null;
    readonly fetchGallery: () => Promise<void>;
    readonly getImage: (id: string) => Promise<GalleryImage | null>;
    readonly editImage: (id: string, formData: FormData) => Promise<GalleryImage>;
    readonly uploadImage: (payload: CreateGalleryPayload) => Promise<GalleryImage>;
    readonly deleteImage: (id: string) => Promise<void>;
    readonly updateFlags: (id: string, flags: GalleryFlags) => Promise<void>;
}

const upsertImage = (
    images: readonly GalleryImage[],
    nextImage: GalleryImage,
): GalleryImage[] => (
    images.some((image) => image.id === nextImage.id)
        ? images.map((image) => image.id === nextImage.id ? nextImage : image)
        : [nextImage, ...images]
);

export const useGalleryStore = create<AdminGalleryState>((set) => ({
    images: [],
    loading: false,
    currentImage: null,
    activeChoirId: null,

    fetchGallery: async () => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const images = await getAdminGallery();

            if (isTenantStoreRequestCurrent(scope)) {
                set({ images });
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    getImage: async (id) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const image = await getGalleryImageById(id);

            if (!isTenantStoreRequestCurrent(scope)) {
                return null;
            }

            set({ currentImage: image });
            return image;
        } catch {
            return null;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    editImage: async (id, formData) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const image = await updateGalleryImage(id, formData);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    images: upsertImage(state.images, image),
                    currentImage: image,
                }));
            }

            return image;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    uploadImage: async (payload) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const image = await addImage(payload);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    images: upsertImage(state.images, image),
                    currentImage: image,
                }));
            }

            return image;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    deleteImage: async (id) => {
        const scope = beginTenantStoreRequest();
        await removeImage(id);

        if (isTenantStoreRequestCurrent(scope)) {
            set((state) => ({
                images: state.images.filter((image) => image.id !== id),
                currentImage: state.currentImage?.id === id ? null : state.currentImage,
            }));
        }
    },

    updateFlags: async (id, flags) => {
        const scope = beginTenantStoreRequest();
        const image = await setFlags(id, flags);

        if (isTenantStoreRequestCurrent(scope)) {
            set((state) => ({
                images: state.images.map((item) => {
                    if (item.id === image.id) {
                        return image;
                    }

                    return {
                        ...item,
                        imageStart: image.imageStart ? false : item.imageStart,
                        imageLogo: image.imageLogo ? false : item.imageLogo,
                        imageTopBar: image.imageTopBar ? false : item.imageTopBar,
                        imageUs: image.imageUs ? false : item.imageUs,
                        imageLeftMenu: image.imageLeftMenu ? false : item.imageLeftMenu,
                        imageRightMenu: image.imageRightMenu ? false : item.imageRightMenu,
                    };
                }),
                currentImage: state.currentImage?.id === image.id ? image : state.currentImage,
            }));
        }
    },
}));
