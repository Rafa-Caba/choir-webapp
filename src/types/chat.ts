// src/types/chat.ts

import type { TipTapContent } from './announcement';
import type { ChatMessageDto } from '../services/admin/chatDtos';

export interface ChatUserSummary {
    id: string;
    name: string;
    username: string;
    imageUrl: string;
}

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'MEDIA' | 'REACTION' | 'AUDIO' | 'VIDEO' | 'STICKER';

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

export interface ChatMediaMetadata {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    bytes: number;
    format: string;
    resourceType: string;
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
    media?: ChatMediaMetadata | null;
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
    replyTo?: string;
}

export interface ChatConnectedUser {
    readonly id: string;
    readonly name: string;
    readonly username: string;
    readonly imageUrl?: string;
}

export interface ChatSocketTypingEvent {
    readonly username: string;
    readonly isTyping: boolean;
}

export interface ChatSessionDisconnectedEvent {
    readonly code?: string;
    readonly message?: string;
}

export interface ChatServerToClientEvents {
    readonly 'new-message': (message: ChatMessageDto) => void;
    readonly 'message-updated': (message: ChatMessageDto) => void;
    readonly 'online-users': (users: readonly ChatConnectedUser[]) => void;
    readonly 'user-typing': (payload: ChatSocketTypingEvent) => void;
    readonly 'session-disconnected': (payload?: ChatSessionDisconnectedEvent) => void;
}

export interface ChatClientToServerEvents {
    readonly typing: (isTyping: boolean) => void;
}
