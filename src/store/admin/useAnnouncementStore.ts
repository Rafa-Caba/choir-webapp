// src/store/admin/useAnnouncementStore.ts

import { create } from 'zustand';
import {
    createAnnouncement,
    deleteAnnouncement,
    getAdminAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
} from '../../services/admin/announcement';
import type {
    Announcement,
    CreateAnnouncementPayload,
} from '../../types/annoucement';

interface AdminAnnouncementState {
    announcements: Announcement[];
    loading: boolean;
    fetchAnnouncements: () => Promise<void>;
    getAnnouncement: (id: string) => Promise<Announcement | null>;
    addAnnouncement: (payload: CreateAnnouncementPayload) => Promise<void>;
    editAnnouncement: (
        id: string,
        payload: Partial<CreateAnnouncementPayload>,
    ) => Promise<void>;
    removeAnnouncement: (id: string) => Promise<void>;
}

export const useAnnouncementStore = create<AdminAnnouncementState>((set, get) => ({
    announcements: [],
    loading: false,

    fetchAnnouncements: async () => {
        set({ loading: true });

        try {
            const data = await getAdminAnnouncements();
            set({ announcements: data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },

    getAnnouncement: async (id) => {
        set({ loading: true });

        try {
            return await getAnnouncementById(id);
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            set({ loading: false });
        }
    },

    addAnnouncement: async (payload) => {
        set({ loading: true });

        try {
            await createAnnouncement(payload);
            await get().fetchAnnouncements();
        } finally {
            set({ loading: false });
        }
    },

    editAnnouncement: async (id, payload) => {
        set({ loading: true });

        try {
            await updateAnnouncement(id, payload);
            await get().fetchAnnouncements();
        } finally {
            set({ loading: false });
        }
    },

    removeAnnouncement: async (id) => {
        await deleteAnnouncement(id);
        set((state) => ({
            announcements: state.announcements.filter(
                (announcement) => announcement.id !== id,
            ),
        }));
    },
}));
