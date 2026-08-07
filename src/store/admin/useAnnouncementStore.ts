// src/store/admin/useAnnouncementStore.ts

import { create } from 'zustand';
import {
    createAnnouncement,
    deleteAnnouncement,
    getAdminAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
} from '../../services/admin/announcement';
import {
    beginTenantStoreRequest,
    isTenantStoreRequestCurrent,
} from '../tenantStoreScope';
import type {
    Announcement,
    CreateAnnouncementPayload,
} from '../../types/annoucement';

interface AdminAnnouncementState {
    readonly announcements: Announcement[];
    readonly currentAnnouncement: Announcement | null;
    readonly activeChoirId: string | null;
    readonly loading: boolean;
    readonly fetchAnnouncements: () => Promise<void>;
    readonly getAnnouncement: (id: string) => Promise<Announcement | null>;
    readonly addAnnouncement: (payload: CreateAnnouncementPayload) => Promise<Announcement>;
    readonly editAnnouncement: (
        id: string,
        payload: Partial<CreateAnnouncementPayload>,
    ) => Promise<Announcement>;
    readonly removeAnnouncement: (id: string) => Promise<void>;
}

export const useAnnouncementStore = create<AdminAnnouncementState>((set) => ({
    announcements: [],
    currentAnnouncement: null,
    activeChoirId: null,
    loading: false,

    fetchAnnouncements: async () => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const announcements = await getAdminAnnouncements();

            if (isTenantStoreRequestCurrent(scope)) {
                set({ announcements });
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    getAnnouncement: async (id) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const announcement = await getAnnouncementById(id);

            if (!isTenantStoreRequestCurrent(scope)) {
                return null;
            }

            set({ currentAnnouncement: announcement });
            return announcement;
        } catch {
            return null;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    addAnnouncement: async (payload) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const announcement = await createAnnouncement(payload);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    announcements: [announcement, ...state.announcements],
                    currentAnnouncement: announcement,
                }));
            }

            return announcement;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    editAnnouncement: async (id, payload) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const announcement = await updateAnnouncement(id, payload);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    announcements: state.announcements.map((item) => (
                        item.id === announcement.id ? announcement : item
                    )),
                    currentAnnouncement: announcement,
                }));
            }

            return announcement;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    removeAnnouncement: async (id) => {
        const scope = beginTenantStoreRequest();
        await deleteAnnouncement(id);

        if (isTenantStoreRequestCurrent(scope)) {
            set((state) => ({
                announcements: state.announcements.filter((item) => item.id !== id),
                currentAnnouncement: state.currentAnnouncement?.id === id
                    ? null
                    : state.currentAnnouncement,
            }));
        }
    },
}));
