// src/types/song.ts

import type { TipTapContent } from './announcement';

export interface SongType {
    id: string;
    choirId: string;

    name: string;
    order: number;
    parentId?: string;
    isParent: boolean;

    createdAt?: string;
    updatedAt?: string;
}

export interface Song {
    id: string;
    choirId: string;

    title: string;
    composer?: string;
    content: TipTapContent;

    songTypeId: string | null;
    songTypeName: string;
    audioUrl?: string;

    createdAt: string;
    updatedAt: string;
}

export interface CreateSongPayload {
    title: string;
    composer?: string;
    content: TipTapContent;
    songTypeId: string;
    file?: File;
}
