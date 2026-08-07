// src/services/admin/songType.ts

import api from '../../api/axios';
import type { SongType } from '../../types/song';

export interface SaveSongTypePayload {
    readonly name: string;
    readonly order: number;
    readonly parentId?: string;
    readonly isParent?: boolean;
}

export const getAllSongTypes = async (): Promise<SongType[]> => {
    const { data } = await api.get<SongType[]>('/song-types');
    return data;
};

export const createSongType = async (
    payload: SaveSongTypePayload,
): Promise<SongType> => {
    const { data } = await api.post<SongType>('/song-types', payload);
    return data;
};

export const updateSongType = async (
    id: string,
    payload: Partial<SaveSongTypePayload>,
): Promise<SongType> => {
    const { data } = await api.put<SongType>(
        `/song-types/${encodeURIComponent(id)}`,
        payload,
    );
    return data;
};

export const deleteSongType = async (id: string): Promise<void> => {
    await api.delete(`/song-types/${encodeURIComponent(id)}`);
};
