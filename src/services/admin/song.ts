// src/services/admin/song.ts

import api from '../../api/axios';
import type { CreateSongPayload, Song, SongType } from '../../types/song';

type SongDataPayload = Omit<CreateSongPayload, 'file'>;

const createFormData = (
    payload: Partial<SongDataPayload>,
    file?: File,
): FormData => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    if (file) {
        formData.append('file', file);
    }

    return formData;
};

export const getAllSongs = async (): Promise<Song[]> => {
    const { data } = await api.get<Song[]>('/songs');
    return data;
};

export const getSongById = async (id: string): Promise<Song> => {
    const { data } = await api.get<Song>(`/songs/${encodeURIComponent(id)}`);
    return data;
};

export const getSongTypeById = async (id: string): Promise<SongType> => {
    const { data } = await api.get<SongType>(
        `/song-types/${encodeURIComponent(id)}`,
    );
    return data;
};

export const createSong = async (payload: CreateSongPayload): Promise<Song> => {
    const { file, ...dataPayload } = payload;
    const { data } = await api.post<Song>(
        '/songs',
        createFormData(dataPayload, file),
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
};

export const updateSong = async (
    id: string,
    payload: Partial<CreateSongPayload>,
): Promise<Song> => {
    const { file, ...dataPayload } = payload;
    const { data } = await api.put<Song>(
        `/songs/${encodeURIComponent(id)}`,
        createFormData(dataPayload, file),
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
};

export const deleteSong = async (id: string): Promise<void> => {
    await api.delete(`/songs/${encodeURIComponent(id)}`);
};
