// src/store/admin/useUsersStore.ts

import { create } from 'zustand';
import {
    deleteUser,
    getAllUsers,
    getUserById,
    saveUser,
    updateSelfProfile,
    updateSelfTheme,
    type SaveUserPayload,
} from '../../services/admin/users';
import type { User } from '../../types/auth';

interface UsersState {
    readonly users: User[];
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalUsers: number;
    readonly loading: boolean;
    readonly fetchUsers: (page?: number) => Promise<void>;
    readonly fetchUser: (id: string) => Promise<User | null>;
    readonly deleteUserById: (id: string) => Promise<void>;
    readonly saveUserAction: (
        data: SaveUserPayload,
        file?: File,
        id?: string,
    ) => Promise<User>;
    readonly updateMyProfile: (formData: FormData) => Promise<User>;
    readonly updateMyTheme: (themeId: string) => Promise<User>;
    readonly setCurrentPage: (page: number) => void;
    readonly getUserById: (id: string) => User | undefined;
}

export const useUsersStore = create<UsersState>((set, get) => ({
    users: [],
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    loading: false,

    fetchUsers: async (page = 1) => {
        set({ loading: true });

        try {
            const response = await getAllUsers(page);
            set({
                users: response.users,
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                totalUsers: response.totalUsers,
            });
        } finally {
            set({ loading: false });
        }
    },

    fetchUser: async (id) => {
        const localUser = get().users.find((user) => user.id === id);

        if (localUser) {
            return localUser;
        }

        try {
            const user = await getUserById(id);
            set((state) => ({
                users: state.users.some((item) => item.id === user.id)
                    ? state.users.map((item) => item.id === user.id ? user : item)
                    : [...state.users, user],
            }));
            return user;
        } catch {
            return null;
        }
    },

    deleteUserById: async (id) => {
        await deleteUser(id);
        set((state) => ({
            users: state.users.filter((user) => user.id !== id),
            totalUsers: Math.max(0, state.totalUsers - 1),
        }));
    },

    saveUserAction: async (data, file, id) => {
        const savedUser = await saveUser(data, file, id);

        set((state) => {
            const exists = state.users.some((user) => user.id === savedUser.id);

            return {
                users: exists
                    ? state.users.map((user) => user.id === savedUser.id ? savedUser : user)
                    : [savedUser, ...state.users],
                totalUsers: exists ? state.totalUsers : state.totalUsers + 1,
            };
        });

        return savedUser;
    },

    updateMyProfile: (formData) => updateSelfProfile(formData),
    updateMyTheme: (themeId) => updateSelfTheme(themeId),
    setCurrentPage: (page) => set({ currentPage: page }),
    getUserById: (id) => get().users.find((user) => user.id === id),
}));
