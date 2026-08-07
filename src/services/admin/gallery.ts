// src/services/admin/gallery.ts

import api from '../../api/axios';
import type { CreateGalleryPayload, GalleryImage } from '../../types/gallery';

export type GalleryFlag =
    | 'imageStart'
    | 'imageTopBar'
    | 'imageUs'
    | 'imageLogo'
    | 'imageGallery'
    | 'imageLeftMenu'
    | 'imageRightMenu';

export type GalleryFlags = Partial<Record<GalleryFlag, boolean>>;

const GALLERY_FLAGS: readonly GalleryFlag[] = [
    'imageStart',
    'imageTopBar',
    'imageUs',
    'imageLogo',
    'imageGallery',
    'imageLeftMenu',
    'imageRightMenu',
];

const createGalleryFormData = (
    payload: Omit<CreateGalleryPayload, 'file'>,
    file?: File,
): FormData => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    if (file) {
        formData.append('file', file);
    }

    return formData;
};

export const getAdminGallery = async (): Promise<GalleryImage[]> => {
    const { data } = await api.get<GalleryImage[]>('/gallery');
    return data;
};

export const getGalleryImageById = async (id: string): Promise<GalleryImage> => {
    const { data } = await api.get<GalleryImage>(
        `/gallery/${encodeURIComponent(id)}`,
    );
    return data;
};

export const addImage = async (
    payload: CreateGalleryPayload,
): Promise<GalleryImage> => {
    const { file, ...dataPayload } = payload;
    const { data } = await api.post<GalleryImage>(
        '/gallery',
        createGalleryFormData(dataPayload, file),
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
};

export const updateGalleryImage = async (
    id: string,
    payload: FormData,
): Promise<GalleryImage> => {
    const { data } = await api.put<GalleryImage>(
        `/gallery/${encodeURIComponent(id)}`,
        payload,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
};

export const removeImage = async (id: string): Promise<void> => {
    await api.delete(`/gallery/${encodeURIComponent(id)}`);
};

export const setFlags = async (
    id: string,
    flags: GalleryFlags,
): Promise<GalleryImage> => {
    let updatedImage: GalleryImage | null = null;

    for (const field of GALLERY_FLAGS) {
        const value = flags[field];

        if (typeof value !== 'boolean') {
            continue;
        }

        const { data } = await api.patch<GalleryImage>(
            `/gallery/mark/${encodeURIComponent(field)}/${encodeURIComponent(id)}`,
            { value },
        );
        updatedImage = data;
    }

    if (!updatedImage) {
        return getGalleryImageById(id);
    }

    return updatedImage;
};
