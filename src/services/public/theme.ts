// src/services/public/theme.ts

import { publicApi } from '../../api/axios';
import type { Theme } from '../../types/theme';
import type { PublicThemeDto } from './publicDtos';
import { mapPublicTheme } from './publicMappers';
import { buildPublicApiPath } from './publicPath';

export const getPublicThemes = async (
    choirCode: string,
    signal?: AbortSignal,
): Promise<Theme[]> => {
    const { data } = await publicApi.get<PublicThemeDto[]>(
        buildPublicApiPath(choirCode, 'themes'),
        { signal },
    );

    return data.map(mapPublicTheme);
};
