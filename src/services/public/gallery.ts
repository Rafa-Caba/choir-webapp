// src/services/public/gallery.ts

import { publicApi } from '../../api/axios';
import type { GalleryImage } from '../../types/gallery';
import type { PublicGalleryImageDto } from './publicDtos';
import { mapPublicGalleryImage } from './publicMappers';
import { buildPublicApiPath } from './publicPath';

export const getPublicGallery = async (
    choirCode: string,
    signal?: AbortSignal,
): Promise<GalleryImage[]> => {
    const { data } = await publicApi.get<PublicGalleryImageDto[]>(
        buildPublicApiPath(choirCode, 'gallery'),
        { signal },
    );

    return data.map(mapPublicGalleryImage);
};
