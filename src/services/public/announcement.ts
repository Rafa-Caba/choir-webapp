// src/services/public/announcement.ts

import { publicApi } from '../../api/axios';
import type { Announcement } from '../../types/annoucement';
import type { PublicAnnouncementDto } from './publicDtos';
import { mapPublicAnnouncement } from './publicMappers';
import { buildPublicApiPath } from './publicPath';

export const getPublicAnnouncements = async (
    choirCode: string,
    signal?: AbortSignal,
): Promise<Announcement[]> => {
    const { data } = await publicApi.get<PublicAnnouncementDto[]>(
        buildPublicApiPath(choirCode, 'announcements'),
        { signal },
    );

    return data.map(mapPublicAnnouncement);
};
