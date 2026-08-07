// src/services/public/member.ts

import { publicApi } from '../../api/axios';
import type { Member } from '../../types/member';
import type { PublicMemberDto } from './publicDtos';
import { mapPublicMember } from './publicMappers';
import { buildPublicApiPath } from './publicPath';

export const getPublicMembers = async (
    choirCode: string,
    signal?: AbortSignal,
): Promise<Member[]> => {
    const { data } = await publicApi.get<PublicMemberDto[]>(
        buildPublicApiPath(choirCode, 'members'),
        { signal },
    );

    return data.map(mapPublicMember);
};
