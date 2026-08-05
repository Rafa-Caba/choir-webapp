// src/types/chat.ts

import type { TipTapContent } from './annoucement';

export interface ChatUserSummary {
    id: string;
    name: string;
    username: string;
    imageUrl: string;
}

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'MEDIA' | 'REACTION' | 'AUDIO' | 'VIDEO';

export interface MessageReaction {
    emoji: string;
    user: ChatUserSummary | string;
    username?: string;
}

export interface ReplyPreview {
    id: string;
    username: string;
    textPreview: string;
}

export interface ChatMessage {
    id: string;
    choirId?: string | null;
    author: ChatUserSummary;
    content: TipTapContent;
    type: MessageType;
    fileUrl?: string;
    filename?: string;
    imageUrl?: string;
    audioUrl?: string;
    imagePublicId?: string;
    mediaAssetId?: string;
    reactions: MessageReaction[];
    replyTo?: ReplyPreview | null;
    createdAt: string;
    updatedAt?: string;
}

export interface NewMessagePayload {
    content: TipTapContent;
    type: MessageType;
    fileUrl?: string;
    filename?: string;
    imageUrl?: string;
    audioUrl?: string;
    mediaAssetId?: string;
    replyToId?: string;
}
