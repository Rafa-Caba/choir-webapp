// src/services/admin/songType.ts

import api from '../../api/axios';
import {
    normalizeSongTypeApiResponse,
    normalizeSongTypeApiResponseList,
    type SongTypeApiResponse,
} from '../../normalizers/songType';
import type { SongType } from '../../types/song';

export interface SaveSongTypePayload {
    readonly name: string;
    readonly order: number;
    readonly parentId?: string | null;
    readonly isParent?: boolean;
}

export const getAllSongTypes = async (): Promise<SongType[]> => {
    const { data } = await api.get<SongTypeApiResponse[]>('/song-types');
    return normalizeSongTypeApiResponseList(data);
};

export const getSongTypeById = async (id: string): Promise<SongType> => {
    const { data } = await api.get<SongTypeApiResponse>(
        `/song-types/${encodeURIComponent(id)}`,
    );
    return normalizeSongTypeApiResponse(data);
};

export const createSongType = async (
    payload: SaveSongTypePayload,
): Promise<SongType> => {
    const { data } = await api.post<SongTypeApiResponse>('/song-types', payload);
    return normalizeSongTypeApiResponse(data);
};

export const updateSongType = async (
    id: string,
    payload: Partial<SaveSongTypePayload>,
): Promise<SongType> => {
    const { data } = await api.put<SongTypeApiResponse>(
        `/song-types/${encodeURIComponent(id)}`,
        payload,
    );
    return normalizeSongTypeApiResponse(data);
};

export const deleteSongType = async (id: string): Promise<void> => {
    await api.delete(`/song-types/${encodeURIComponent(id)}`);
};
