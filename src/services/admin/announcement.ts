// src/services/admin/announcement.ts

import api from '../../api/axios';
import type {
    Announcement,
    CreateAnnouncementPayload,
} from '../../types/announcement';

const createAnnouncementFormData = (
    payload: Partial<CreateAnnouncementPayload>,
): FormData => {
    const formData = new FormData();
    const { file, ...dataPayload } = payload;
    formData.append('data', JSON.stringify(dataPayload));

    if (file) {
        formData.append('file', file);
    }

    return formData;
};

export const getAdminAnnouncements = async (): Promise<Announcement[]> => {
    const { data } = await api.get<Announcement[]>('/announcements/admin');
    return data;
};

export const getAnnouncementById = async (id: string): Promise<Announcement> => {
    const { data } = await api.get<Announcement>(
        `/announcements/${encodeURIComponent(id)}`,
    );
    return data;
};

export const createAnnouncement = async (
    payload: CreateAnnouncementPayload,
): Promise<Announcement> => {
    const { data } = await api.post<Announcement>(
        '/announcements',
        createAnnouncementFormData(payload),
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
};

export const updateAnnouncement = async (
    id: string,
    payload: Partial<CreateAnnouncementPayload>,
): Promise<Announcement> => {
    const { data } = await api.put<Announcement>(
        `/announcements/${encodeURIComponent(id)}`,
        createAnnouncementFormData(payload),
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
    await api.delete(`/announcements/${encodeURIComponent(id)}`);
};
