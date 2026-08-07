// src/store/admin/useChoirsStore.ts

import { create } from 'zustand';
import {
    deleteChoir,
    getChoirById,
    getChoirs,
    saveChoir,
} from '../../services/admin/choirs';
import type {
    Choir,
    CreateChoirPayload,
    PaginatedChoirResponse,
} from '../../types/choir';

interface ChoirState {
    readonly choirs: Choir[];
    readonly selectedChoir: Choir | null;
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalChoirs: number;
    readonly loading: boolean;
    readonly fetchChoirs: (page?: number) => Promise<void>;
    readonly fetchChoir: (id: string) => Promise<Choir | null>;
    readonly saveChoirAction: (
        data: CreateChoirPayload,
        file?: File,
        id?: string,
    ) => Promise<Choir>;
    readonly deleteChoirById: (id: string) => Promise<void>;
    readonly setCurrentPage: (page: number) => void;
    readonly getChoirByIdFromState: (id: string) => Choir | undefined;
}

export const useChoirsStore = create<ChoirState>((set, get) => ({
    choirs: [],
    selectedChoir: null,
    currentPage: 1,
    totalPages: 1,
    totalChoirs: 0,
    loading: false,

    fetchChoirs: async (page = 1) => {
        set({ loading: true });

        try {
            const data: PaginatedChoirResponse = await getChoirs(page);
            set({
                choirs: data.choirs,
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                totalChoirs: data.totalChoirs,
            });
        } finally {
            set({ loading: false });
        }
    },

    fetchChoir: async (id) => {
        const local = get().choirs.find((choir) => choir.id === id);

        if (local) {
            set({ selectedChoir: local });
            return local;
        }

        try {
            const choir = await getChoirById(id);
            set((state) => ({
                selectedChoir: choir,
                choirs: state.choirs.some((item) => item.id === choir.id)
                    ? state.choirs.map((item) => item.id === choir.id ? choir : item)
                    : [...state.choirs, choir],
            }));
            return choir;
        } catch {
            set({ selectedChoir: null });
            return null;
        }
    },

    saveChoirAction: async (data, file, id) => {
        const saved = await saveChoir(data, file, id);
        set((state) => {
            const exists = state.choirs.some((choir) => choir.id === saved.id);
            return {
                choirs: exists
                    ? state.choirs.map((choir) => choir.id === saved.id ? saved : choir)
                    : [...state.choirs, saved],
                selectedChoir: state.selectedChoir?.id === saved.id
                    ? saved
                    : state.selectedChoir,
                totalChoirs: exists ? state.totalChoirs : state.totalChoirs + 1,
            };
        });
        return saved;
    },

    deleteChoirById: async (id) => {
        await deleteChoir(id);
        set((state) => ({
            choirs: state.choirs.map((choir) => (
                choir.id === id ? { ...choir, isActive: false } : choir
            )),
            selectedChoir: state.selectedChoir?.id === id
                ? { ...state.selectedChoir, isActive: false }
                : state.selectedChoir,
        }));
    },

    setCurrentPage: (page) => set({ currentPage: page }),
    getChoirByIdFromState: (id) => get().choirs.find((choir) => choir.id === id),
}));
