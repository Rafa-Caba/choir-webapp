// src/normalizers/songType.ts

import type { SongType } from '../types/song';

export interface SongTypeParentReferenceApiResponse {
    readonly _id?: string;
    readonly id?: string;
    readonly name?: string;
    readonly order?: number;
}

export interface SongTypeApiResponse {
    readonly _id?: string;
    readonly id?: string;
    readonly choirId?: string;
    readonly name: string;
    readonly order: number;
    readonly parentId?: string | SongTypeParentReferenceApiResponse | null;
    readonly isParent: boolean;
    readonly createdAt?: string;
    readonly updatedAt?: string;
}

const resolveRequiredId = (
    id: string | undefined,
    legacyId: string | undefined,
): string => {
    const resolvedId = id?.trim() || legacyId?.trim();

    if (!resolvedId) {
        throw new Error('Invalid song type response: missing id');
    }

    return resolvedId;
};

export const resolveSongTypeParentId = (
    parentId: SongTypeApiResponse['parentId'],
): string | undefined => {
    if (!parentId) {
        return undefined;
    }

    if (typeof parentId === 'string') {
        const normalizedParentId = parentId.trim();
        return normalizedParentId || undefined;
    }

    const normalizedParentId = parentId.id?.trim() || parentId._id?.trim();

    if (!normalizedParentId) {
        throw new Error('Invalid song type response: parent reference is missing id');
    }

    return normalizedParentId;
};

export const normalizeSongTypeApiResponse = (
    songType: SongTypeApiResponse,
): SongType => ({
    id: resolveRequiredId(songType.id, songType._id),
    choirId: songType.choirId,
    name: songType.name,
    order: songType.order,
    parentId: resolveSongTypeParentId(songType.parentId),
    isParent: songType.isParent,
    createdAt: songType.createdAt,
    updatedAt: songType.updatedAt,
});

export const normalizeSongTypeApiResponseList = (
    songTypes: readonly SongTypeApiResponse[],
): SongType[] => songTypes.map(normalizeSongTypeApiResponse);
