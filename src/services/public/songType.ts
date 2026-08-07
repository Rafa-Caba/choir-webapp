// src/services/public/songType.ts

import { publicApi } from '../../api/axios';
import type { SongType } from '../../types/song';
import type { PublicSongTypeDto } from './publicDtos';
import { mapPublicSongType } from './publicMappers';
import { buildPublicApiPath } from './publicPath';

export const getPublicSongTypes = async (
    choirCode: string,
    signal?: AbortSignal,
): Promise<SongType[]> => {
    const { data } = await publicApi.get<PublicSongTypeDto[]>(
        buildPublicApiPath(choirCode, 'song-types'),
        { signal },
    );

    return data.map(mapPublicSongType);
};
