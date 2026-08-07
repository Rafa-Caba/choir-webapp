// src/store/admin/useMemberStore.ts

import { create } from 'zustand';
import {
    createMember,
    deleteMember,
    getMemberById,
    getPaginatedMembers,
    searchMembers,
    updateMember,
} from '../../services/admin/member';
import {
    beginTenantStoreRequest,
    isTenantStoreRequestCurrent,
} from '../tenantStoreScope';
import type { CreateMemberPayload, Member } from '../../types/member';

interface AdminMemberState {
    readonly members: Member[];
    readonly currentMember: Member | null;
    readonly activeChoirId: string | null;
    readonly currentPage: number;
    readonly totalPages: number;
    readonly loading: boolean;
    readonly isSearching: boolean;
    readonly fetchMembers: (page?: number) => Promise<void>;
    readonly searchMembersByText: (query: string) => Promise<void>;
    readonly setCurrentPage: (page: number) => void;
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
    loading: false,
    isSearching: false,

    setCurrentPage: (page) => set({ currentPage: page }),

    fetchMembers: async (page = 1) => {
        const scope = beginTenantStoreRequest();
        set({
            loading: true,
            isSearching: false,
            activeChoirId: scope.choirId,
        });

        try {
            const response = await getPaginatedMembers(page);

            if (isTenantStoreRequestCurrent(scope)) {
                set({
                    members: response.members,
                    currentPage: response.currentPage,
                    totalPages: response.totalPages,
                });
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    searchMembersByText: async (query) => {
        if (!query.trim()) {
            await get().fetchMembers(1);
            return;
        }

        const scope = beginTenantStoreRequest();
        set({
            loading: true,
            isSearching: true,
            activeChoirId: scope.choirId,
        });

        try {
            const members = await searchMembers(query);

            if (isTenantStoreRequestCurrent(scope)) {
                set({ members, totalPages: 1, currentPage: 1 });
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
