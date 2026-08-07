// src/services/public/settings.ts

import { publicApi } from '../../api/axios';
import type { PublicSettingsResponse } from '../../types/public';
import { mapPublicSettings } from './publicMappers';
import type { PublicSettingsApiResponse } from './publicDtos';
import { normalizeChoirCode } from '../../utils/choirCode';
import { buildPublicApiPath } from './publicPath';

export const getPublicSettings = async (
    choirCode: string,
    signal?: AbortSignal,
): Promise<PublicSettingsResponse> => {
    const { data } = await publicApi.get<PublicSettingsApiResponse>(
        buildPublicApiPath(choirCode, 'settings'),
        { signal },
    );

    const response = mapPublicSettings(data);

    if (normalizeChoirCode(response.choir.code) !== normalizeChoirCode(choirCode)) {
        throw new Error('The API returned settings for a different choir code');
    }

    return response;
};
