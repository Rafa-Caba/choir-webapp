// src/types/announcement.ts

import type { JsonObject, JsonValue } from './json';

export interface TipTapContent extends JsonObject {
    type: string;
    content: JsonObject[];
}

export interface Announcement {
    id: string;
    choirId: string;
    title: string;
    content: TipTapContent;
    imageUrl?: string;
    imagePublicId?: string;
    isPublic: boolean;
    createdBy?: {
        id: string;
        name: string;
        username: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateAnnouncementPayload {
    title: string;
    content: TipTapContent;
    imageUri?: string;
    file?: File;
    isPublic: boolean;
}

export type AnnouncementContentValue = JsonValue;
