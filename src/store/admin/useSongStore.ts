// src/store/admin/useSongStore.ts

import { create } from 'zustand';
import {
    createSong,
    deleteSong,
    getAllSongs,
    getSongById,
    updateSong,
} from '../../services/admin/song';
import type { CreateSongPayload, Song } from '../../types/song';

interface AdminSongState {
    songs: Song[];
    loading: boolean;
    fetchSongs: () => Promise<void>;
    getSong: (id: string) => Promise<Song | null>;
    addSong: (payload: CreateSongPayload) => Promise<void>;
    editSong: (id: string, payload: Partial<CreateSongPayload>) => Promise<void>;
    removeSong: (id: string) => Promise<void>;
}

export const useSongStore = create<AdminSongState>((set, get) => ({
    songs: [],
    loading: false,

    fetchSongs: async () => {
        set({ loading: true });

        try {
            const data = await getAllSongs();
            set({ songs: data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },

    getSong: async (id) => {
        set({ loading: true });

        try {
            return await getSongById(id);
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            set({ loading: false });
        }
    },

    addSong: async (payload) => {
        set({ loading: true });

        try {
            await createSong(payload);
            await get().fetchSongs();
        } finally {
            set({ loading: false });
        }
    },

    editSong: async (id, payload) => {
        set({ loading: true });

        try {
            await updateSong(id, payload);
            await get().fetchSongs();
        } finally {
            set({ loading: false });
        }
    },

    removeSong: async (id) => {
        await deleteSong(id);
        set((state) => ({
            songs: state.songs.filter((song) => song.id !== id),
        }));
    },
}));
