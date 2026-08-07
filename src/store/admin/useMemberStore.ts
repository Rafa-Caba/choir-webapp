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
import type { CreateMemberPayload, Member } from '../../types/member';

interface AdminMemberState {
    members: Member[];
    currentPage: number;
    totalPages: number;
    loading: boolean;
    isSearching: boolean;
    fetchMembers: (page?: number) => Promise<void>;
    searchMembersByText: (query: string) => Promise<void>;
    setCurrentPage: (page: number) => void;
    getMember: (id: string) => Promise<Member | null>;
    addMember: (payload: CreateMemberPayload) => Promise<void>;
    editMember: (
        id: string,
        payload: Partial<CreateMemberPayload>,
    ) => Promise<void>;
    removeMember: (id: string) => Promise<void>;
}

export const useMemberStore = create<AdminMemberState>((set, get) => ({
    members: [],
    currentPage: 1,
    totalPages: 1,
    loading: false,
    isSearching: false,

    setCurrentPage: (page) => set({ currentPage: page }),

    fetchMembers: async (page = 1) => {
        set({ loading: true, isSearching: false });

        try {
            const response = await getPaginatedMembers(page);
            set({
                members: response.members,
                currentPage: response.currentPage,
                totalPages: response.totalPages,
            });
        } catch (error) {
            console.error('Failed to fetch members', error);
            set({ members: [] });
        } finally {
            set({ loading: false });
        }
    },

    searchMembersByText: async (query) => {
        if (!query.trim()) {
            await get().fetchMembers(1);
            return;
        }

        set({ loading: true, isSearching: true });

        try {
            const results = await searchMembers(query);
            set({
                members: results,
                totalPages: 1,
                currentPage: 1,
            });
        } catch (error) {
            console.error('Search failed', error);
            set({ members: [] });
        } finally {
            set({ loading: false });
        }
    },

    getMember: async (id) => {
        set({ loading: true });

        try {
            return await getMemberById(id);
        } catch (error) {
            console.error('Failed to fetch member', error);
            return null;
        } finally {
            set({ loading: false });
        }
    },

    addMember: async (payload) => {
        set({ loading: true });

        try {
            await createMember(payload);
            await get().fetchMembers(1);
        } finally {
            set({ loading: false });
        }
    },

    editMember: async (id, payload) => {
        set({ loading: true });

        try {
            await updateMember(id, payload);
            await get().fetchMembers(get().currentPage);
        } finally {
            set({ loading: false });
        }
    },

    removeMember: async (id) => {
        await deleteMember(id);
        await get().fetchMembers(get().currentPage);
    },
}));
