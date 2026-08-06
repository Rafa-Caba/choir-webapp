// src/store/admin/useChoirsStore.ts

import { create } from 'zustand';
import {
    createChoirUser,
    deleteChoir,
    deleteChoirUser,
    getChoirById,
    getChoirs,
    getChoirUserById,
    getChoirUsers,
    saveChoir,
    updateChoirUser,
} from '../../services/admin/choirs';
import type { Choir, ChoirUser, CreateChoirPayload, CreateChoirUserPayload, PaginatedChoirResponse, PaginatedChoirUsersResponse, UpdateChoirUserPayload } from '../../types/choir';

interface ChoirState {
    choirs: Choir[];
    selectedChoir: Choir | null;
    currentPage: number;
    totalPages: number;
    totalChoirs: number;
    loading: boolean;

    choirUsers: ChoirUser[];
    selectedChoirUser: ChoirUser | null;
    choirUsersCurrentPage: number;
    choirUsersTotalPages: number;
    totalChoirUsers: number;
    choirUsersLoading: boolean;

    fetchChoirs: (page?: number) => Promise<void>;
    fetchChoir: (id: string) => Promise<Choir | null>;
    saveChoirAction: (data: CreateChoirPayload, file?: File, id?: string) => Promise<Choir>;
    deleteChoirById: (id: string) => Promise<void>;

    fetchChoirUsers: (choirId: string, page?: number, limit?: number) => Promise<void>;
    fetchChoirUser: (userId: string) => Promise<ChoirUser | null>;
    createChoirUserAction: (
        choirId: string,
        data: CreateChoirUserPayload,
        file?: File,
    ) => Promise<ChoirUser>;
    updateChoirUserAction: (
        choirId: string,
        userId: string,
        data: UpdateChoirUserPayload,
        file?: File,
    ) => Promise<ChoirUser>;
    deleteChoirUserById: (userId: string) => Promise<void>;

    setCurrentPage: (page: number) => void;
    setChoirUsersCurrentPage: (page: number) => void;
    getChoirByIdFromState: (id: string) => Choir | undefined;
    resetTenantData: () => void;
}

export const useChoirsStore = create<ChoirState>((set, get) => ({
    choirs: [],
    selectedChoir: null,
    currentPage: 1,
    totalPages: 1,
    totalChoirs: 0,
    loading: false,

    choirUsers: [],
    selectedChoirUser: null,
    choirUsersCurrentPage: 1,
    choirUsersTotalPages: 1,
    totalChoirUsers: 0,
    choirUsersLoading: false,

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
        } catch {
            console.error('Error fetching choirs');
        } finally {
            set({ loading: false });
        }
    },

    fetchChoir: async (id: string) => {
        try {
            const local = get().choirs.find((choir) => choir.id === id);

            if (local) {
                set({ selectedChoir: local });
                return local;
            }

            const choir = await getChoirById(id);

            set((state) => {
                const exists = state.choirs.some((item) => item.id === choir.id);

                return {
                    selectedChoir: choir,
                    choirs: exists
                        ? state.choirs.map((item) => (item.id === choir.id ? choir : item))
                        : [...state.choirs, choir],
                };
            });

            return choir;
        } catch {
            console.error('Error fetching choir');
            set({ selectedChoir: null });
            return null;
        }
    },

    saveChoirAction: async (data, file, id) => {
        const saved = await saveChoir(data, file, id);

        set((state) => {
            const exists = state.choirs.some((choir) => choir.id === saved.id);

            const updatedChoirs = exists
                ? state.choirs.map((choir) => (choir.id === saved.id ? saved : choir))
                : [...state.choirs, saved];

            return {
                choirs: updatedChoirs,
                selectedChoir: state.selectedChoir?.id === saved.id ? saved : state.selectedChoir,
                totalChoirs: exists ? state.totalChoirs : state.totalChoirs + 1,
            };
        });

        return saved;
    },

    deleteChoirById: async (id: string) => {
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

    fetchChoirUsers: async (choirId: string, page = 1, limit = 10) => {
        set({ choirUsersLoading: true });

        try {
            const data: PaginatedChoirUsersResponse = await getChoirUsers(choirId, page, limit);

            set({
                choirUsers: data.users,
                choirUsersCurrentPage: data.currentPage,
                choirUsersTotalPages: data.totalPages,
                totalChoirUsers: data.totalUsers,
            });
        } catch {
            console.error('Error fetching choir users');

            set({
                choirUsers: [],
                choirUsersCurrentPage: 1,
                choirUsersTotalPages: 1,
                totalChoirUsers: 0,
            });
        } finally {
            set({ choirUsersLoading: false });
        }
    },

    fetchChoirUser: async (userId: string) => {
        try {
            const local = get().choirUsers.find((user) => user.id === userId);

            if (local) {
                set({ selectedChoirUser: local });
                return local;
            }

            const user = await getChoirUserById(userId);

            set((state) => {
                const exists = state.choirUsers.some((item) => item.id === user.id);

                return {
                    selectedChoirUser: user,
                    choirUsers: exists
                        ? state.choirUsers.map((item) => (item.id === user.id ? user : item))
                        : [...state.choirUsers, user],
                };
            });

            return user;
        } catch {
            console.error('Error fetching choir user');
            set({ selectedChoirUser: null });
            return null;
        }
    },

    createChoirUserAction: async (choirId, data, file) => {
        const user = await createChoirUser(choirId, data, file);

        set((state) => ({
            choirUsers: [user, ...state.choirUsers],
            totalChoirUsers: state.totalChoirUsers + 1,
        }));

        return user;
    },

    updateChoirUserAction: async (choirId, userId, data, file) => {
        const user = await updateChoirUser(choirId, userId, data, file);

        set((state) => ({
            selectedChoirUser: user,
            choirUsers: state.choirUsers.map((item) => (item.id === user.id ? user : item)),
        }));

        return user;
    },

    deleteChoirUserById: async (userId: string) => {
        await deleteChoirUser(userId);

        set((state) => ({
            choirUsers: state.choirUsers.filter((user) => user.id !== userId),
            selectedChoirUser: state.selectedChoirUser?.id === userId ? null : state.selectedChoirUser,
            totalChoirUsers: state.totalChoirUsers > 0 ? state.totalChoirUsers - 1 : 0,
        }));
    },

    setCurrentPage: (page: number) => set({ currentPage: page }),

    setChoirUsersCurrentPage: (page: number) => set({ choirUsersCurrentPage: page }),

    getChoirByIdFromState: (id: string) => {
        return get().choirs.find((choir) => choir.id === id);
    },

    resetTenantData: () => set({
        choirUsers: [],
        selectedChoirUser: null,
        choirUsersCurrentPage: 1,
        choirUsersTotalPages: 1,
        totalChoirUsers: 0,
        choirUsersLoading: false,
    }),
}));