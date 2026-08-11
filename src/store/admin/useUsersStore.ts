// src/store/admin/useUsersStore.ts

import { create } from 'zustand';
import {
    deleteUser,
    getAllUsers,
    getUserById as getUserByIdFromApi,
    resetUserPassword,
    saveUser,
    setUserActiveStatus,
    updateSelfProfile,
    updateSelfTheme,
    type ResetUserPasswordResponse,
    type SaveUserPayload,
    type SaveUserResult,
    type UserListFilters,
} from '../../services/admin/users';
import {
    beginTenantStoreRequest,
    isTenantStoreRequestCurrent,
} from '../tenantStoreScope';
import type { User } from '../../types/auth';
import type { PageSize } from '../../types/pagination';

interface UsersState {
    readonly users: User[];
    readonly selectedUser: User | null;
    readonly activeChoirId: string | null;
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalUsers: number;
    readonly pageSize: PageSize;
    readonly loading: boolean;
    readonly mutationUserId: string | null;
    readonly fetchUsers: (page?: number, pageSize?: PageSize, filters?: UserListFilters) => Promise<void>;
    readonly fetchUser: (id: string) => Promise<User | null>;
    readonly deleteUserById: (id: string) => Promise<void>;
    readonly saveUserAction: (
        data: SaveUserPayload,
        file?: File,
        id?: string,
    ) => Promise<SaveUserResult>;
    readonly changeUserActiveStatus: (id: string, isActive: boolean) => Promise<User>;
    readonly resetUserPasswordAction: (
        id: string,
        temporaryPassword?: string,
    ) => Promise<ResetUserPasswordResponse>;
    readonly updateMyProfile: (formData: FormData) => Promise<User>;
    readonly updateMyTheme: (themeId: string | null) => Promise<User>;
    readonly setCurrentPage: (page: number) => void;
    readonly setPageSize: (pageSize: PageSize) => void;
    readonly getUserById: (id: string) => User | undefined;
}

const upsertUser = (users: readonly User[], nextUser: User): User[] => (
    users.some((user) => user.id === nextUser.id)
        ? users.map((user) => user.id === nextUser.id ? nextUser : user)
        : [nextUser, ...users]
);

export const useUsersStore = create<UsersState>((set, get) => ({
    users: [],
    selectedUser: null,
    activeChoirId: null,
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    pageSize: 10,
    loading: false,
    mutationUserId: null,

    fetchUsers: async (page = 1, pageSize = get().pageSize, filters = {}) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const response = await getAllUsers(page, pageSize, filters);

            if (isTenantStoreRequestCurrent(scope)) {
                set({
                    users: response.users,
                    selectedUser: null,
                    currentPage: response.currentPage,
                    totalPages: response.totalPages,
                    totalUsers: response.totalUsers,
                    pageSize,
                });
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    fetchUser: async (id) => {
        const scope = beginTenantStoreRequest();
        const localUser = get().activeChoirId === scope.choirId
            ? get().users.find((user) => user.id === id)
            : undefined;

        if (localUser) {
            set({ selectedUser: localUser });
            return localUser;
        }

        try {
            const user = await getUserByIdFromApi(id);

            if (!isTenantStoreRequestCurrent(scope)) {
                return null;
            }

            set((state) => ({
                users: upsertUser(state.users, user),
                selectedUser: user,
                activeChoirId: scope.choirId,
            }));
            return user;
        } catch {
            return null;
        }
    },

    deleteUserById: async (id) => {
        const scope = beginTenantStoreRequest();
        set({ mutationUserId: id });

        try {
            await deleteUser(id);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    users: state.users.filter((user) => user.id !== id),
                    selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
                    totalUsers: Math.max(0, state.totalUsers - 1),
                }));
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ mutationUserId: null });
            }
        }
    },

    saveUserAction: async (data, file, id) => {
        const scope = beginTenantStoreRequest();
        set({ mutationUserId: id ?? 'new', activeChoirId: scope.choirId });

        try {
            const result = await saveUser(data, file, id);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => {
                    const exists = state.users.some((user) => user.id === result.user.id);

                    return {
                        users: upsertUser(state.users, result.user),
                        selectedUser: result.user,
                        totalUsers: exists ? state.totalUsers : state.totalUsers + 1,
                    };
                });
            }

            return result;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ mutationUserId: null });
            }
        }
    },

    changeUserActiveStatus: async (id, isActive) => {
        const scope = beginTenantStoreRequest();
        set({ mutationUserId: id });

        try {
            const user = await setUserActiveStatus(id, isActive);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    users: upsertUser(state.users, user),
                    selectedUser: state.selectedUser?.id === user.id
                        ? user
                        : state.selectedUser,
                }));
            }

            return user;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ mutationUserId: null });
            }
        }
    },

    resetUserPasswordAction: async (id, temporaryPassword) => {
        const scope = beginTenantStoreRequest();
        set({ mutationUserId: id });

        try {
            const result = await resetUserPassword(id, temporaryPassword);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    users: state.users.map((user) => (
                        user.id === id ? { ...user, mustChangePassword: true } : user
                    )),
                    selectedUser: state.selectedUser?.id === id
                        ? { ...state.selectedUser, mustChangePassword: true }
                        : state.selectedUser,
                }));
            }

            return result;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ mutationUserId: null });
            }
        }
    },

    updateMyProfile: (formData) => updateSelfProfile(formData),
    updateMyTheme: (themeId) => updateSelfTheme(themeId),
    setCurrentPage: (page) => set({ currentPage: page }),
    setPageSize: (pageSize) => set({ pageSize, currentPage: 1 }),
    getUserById: (id) => get().users.find((user) => user.id === id),
}));
