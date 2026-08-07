// src/services/public/instruments.ts

import { publicApi } from '../../api/axios';
import type { Instrument } from '../../types/instrument';
import type { PublicInstrumentDto } from './publicDtos';
import { mapPublicInstrument } from './publicMappers';
import { buildPublicApiPath } from './publicPath';

export const getPublicInstruments = async (
    choirCode: string,
    signal?: AbortSignal,
): Promise<Instrument[]> => {
    const { data } = await publicApi.get<PublicInstrumentDto[]>(
        buildPublicApiPath(choirCode, 'instruments'),
        { signal },
    );

    return data.map(mapPublicInstrument);
};
