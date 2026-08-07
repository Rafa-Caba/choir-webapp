// src/store/admin/useSongStore.ts

import { create } from 'zustand';
import {
    createSong,
    deleteSong,
    getAllSongs,
    getSongById,
    updateSong,
} from '../../services/admin/song';
import {
    beginTenantStoreRequest,
    isTenantStoreRequestCurrent,
} from '../tenantStoreScope';
import type { CreateSongPayload, Song } from '../../types/song';

interface AdminSongState {
    readonly songs: Song[];
    readonly currentSong: Song | null;
    readonly activeChoirId: string | null;
    readonly loading: boolean;
    readonly fetchSongs: () => Promise<void>;
    readonly getSong: (id: string) => Promise<Song | null>;
    readonly addSong: (payload: CreateSongPayload) => Promise<Song>;
    readonly editSong: (id: string, payload: Partial<CreateSongPayload>) => Promise<Song>;
    readonly removeSong: (id: string) => Promise<void>;
}

const upsertSong = (songs: readonly Song[], nextSong: Song): Song[] => (
    songs.some((song) => song.id === nextSong.id)
        ? songs.map((song) => song.id === nextSong.id ? nextSong : song)
        : [nextSong, ...songs]
);

export const useSongStore = create<AdminSongState>((set) => ({
    songs: [],
    currentSong: null,
    activeChoirId: null,
    loading: false,

    fetchSongs: async () => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const songs = await getAllSongs();

            if (isTenantStoreRequestCurrent(scope)) {
                set({ songs });
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    getSong: async (id) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const song = await getSongById(id);

            if (!isTenantStoreRequestCurrent(scope)) {
                return null;
            }

            set((state) => ({
                songs: upsertSong(state.songs, song),
                currentSong: song,
            }));
            return song;
        } catch {
            return null;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    addSong: async (payload) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const song = await createSong(payload);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    songs: upsertSong(state.songs, song),
                    currentSong: song,
                }));
            }

            return song;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    editSong: async (id, payload) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const song = await updateSong(id, payload);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    songs: upsertSong(state.songs, song),
                    currentSong: song,
                }));
            }

            return song;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    removeSong: async (id) => {
        const scope = beginTenantStoreRequest();
        await deleteSong(id);

        if (isTenantStoreRequestCurrent(scope)) {
            set((state) => ({
                songs: state.songs.filter((song) => song.id !== id),
                currentSong: state.currentSong?.id === id ? null : state.currentSong,
            }));
        }
    },
}));
