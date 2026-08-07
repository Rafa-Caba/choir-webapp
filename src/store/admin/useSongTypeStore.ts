// src/store/admin/useSongTypeStore.ts

import { create } from 'zustand';
import { getSongTypeById } from '../../services/admin/song';
import {
    createSongType,
    deleteSongType,
    getAllSongTypes,
    updateSongType,
} from '../../services/admin/songType';
import type { SongType } from '../../types/song';

interface AdminSongTypeState {
    types: SongType[];
    loading: boolean;
    fetchTypes: () => Promise<void>;
    getType: (id: string) => Promise<SongType | null>;
    addType: (
        name: string,
        order: number,
        parentId?: string | null,
        isParent?: boolean,
    ) => Promise<void>;
    editType: (
        id: string,
        name: string,
        order: number,
        isParent?: boolean,
    ) => Promise<void>;
    removeType: (id: string) => Promise<void>;
}

export const useSongTypeStore = create<AdminSongTypeState>((set, get) => ({
    types: [],
    loading: false,

    fetchTypes: async () => {
        set({ loading: true });

        try {
            const data = await getAllSongTypes();
            set({ types: data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },

    getType: async (id) => {
        set({ loading: true });

        try {
            return await getSongTypeById(id);
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            set({ loading: false });
        }
    },

    addType: async (name, order, parentId, isParent) => {
        set({ loading: true });

        try {
            await createSongType({
                name,
                order,
                parentId: parentId || undefined,
                isParent,
            });
            await get().fetchTypes();
        } finally {
            set({ loading: false });
        }
    },

    editType: async (id, name, order, isParent) => {
        set({ loading: true });

        try {
            await updateSongType(id, { name, order, isParent });
            await get().fetchTypes();
        } finally {
            set({ loading: false });
        }
    },

    removeType: async (id) => {
        await deleteSongType(id);
        set((state) => ({
            types: state.types.filter((type) => type.id !== id),
        }));
    },
}));
