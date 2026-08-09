// src/store/admin/useMemberStore.ts

import { create } from 'zustand';
import {
    createMember,
    deleteMember,
    getMemberById,
    getPaginatedMembers,
    searchPaginatedMembers,
    updateMember,
} from '../../services/admin/member';
import {
    beginTenantStoreRequest,
    isTenantStoreRequestCurrent,
} from '../tenantStoreScope';
import type { CreateMemberPayload, Member } from '../../types/member';
import type { PageSize } from '../../types/pagination';

interface AdminMemberState {
    readonly members: Member[];
    readonly currentMember: Member | null;
    readonly activeChoirId: string | null;
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalMembers: number;
    readonly pageSize: PageSize;
    readonly loading: boolean;
    readonly isSearching: boolean;
    readonly fetchMembers: (page?: number, pageSize?: PageSize) => Promise<void>;
    readonly searchMembersByText: (query: string, page?: number, pageSize?: PageSize) => Promise<void>;
    readonly setCurrentPage: (page: number) => void;
    readonly setPageSize: (pageSize: PageSize) => void;
    readonly getMember: (id: string) => Promise<Member | null>;
    readonly addMember: (payload: CreateMemberPayload) => Promise<Member>;
    readonly editMember: (
        id: string,
        payload: Partial<CreateMemberPayload>,
    ) => Promise<Member>;
    readonly removeMember: (id: string) => Promise<void>;
}

export const useMemberStore = create<AdminMemberState>((set, get) => ({
    members: [],
    currentMember: null,
    activeChoirId: null,
    currentPage: 1,
    totalPages: 1,
    totalMembers: 0,
    pageSize: 10,
    loading: false,
    isSearching: false,

    setCurrentPage: (page) => set({ currentPage: page }),
    setPageSize: (pageSize) => set({ pageSize, currentPage: 1 }),

    fetchMembers: async (page = 1, pageSize = get().pageSize) => {
        const scope = beginTenantStoreRequest();
        set({
            loading: true,
            isSearching: false,
            activeChoirId: scope.choirId,
        });

        try {
            const response = await getPaginatedMembers(page, pageSize);

            if (isTenantStoreRequestCurrent(scope)) {
                set({
                    members: response.members,
                    currentPage: response.currentPage,
                    totalPages: response.totalPages,
                    totalMembers: response.totalMembers,
                    pageSize,
                });
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    searchMembersByText: async (query, page = 1, pageSize = get().pageSize) => {
        if (!query.trim()) {
            await get().fetchMembers(page, pageSize);
            return;
        }

        const scope = beginTenantStoreRequest();
        set({
            loading: true,
            isSearching: true,
            activeChoirId: scope.choirId,
        });

        try {
            const response = await searchPaginatedMembers(query, page, pageSize);

            if (isTenantStoreRequestCurrent(scope)) {
                set({
                    members: response.members,
                    totalPages: response.totalPages,
                    totalMembers: response.totalMembers,
                    currentPage: response.currentPage,
                    pageSize,
                });
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    getMember: async (id) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const member = await getMemberById(id);

            if (!isTenantStoreRequestCurrent(scope)) {
                return null;
            }

            set({ currentMember: member });
            return member;
        } catch {
            return null;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    addMember: async (payload) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const member = await createMember(payload);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    members: [member, ...state.members],
                    currentMember: member,
                }));
            }

            return member;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    editMember: async (id, payload) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const member = await updateMember(id, payload);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    members: state.members.map((item) => item.id === member.id ? member : item),
                    currentMember: member,
                }));
            }

            return member;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    removeMember: async (id) => {
        const scope = beginTenantStoreRequest();
        await deleteMember(id);

        if (isTenantStoreRequestCurrent(scope)) {
            set((state) => ({
                members: state.members.filter((member) => member.id !== id),
                currentMember: state.currentMember?.id === id ? null : state.currentMember,
            }));
        }
    },
}));
