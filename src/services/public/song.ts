// src/services/public/song.ts

import { publicApi } from '../../api/axios';
import type { Song } from '../../types/song';
import type { PublicSongDto } from './publicDtos';
import { mapPublicSong } from './publicMappers';
import { buildPublicApiPath } from './publicPath';

export const getPublicSongs = async (
    choirCode: string,
    signal?: AbortSignal,
): Promise<Song[]> => {
    const { data } = await publicApi.get<PublicSongDto[]>(
        buildPublicApiPath(choirCode, 'songs'),
        { signal },
    );

    return data.map(mapPublicSong);
};
