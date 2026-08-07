// src/services/admin/chat.ts

import api from '../../api/axios';
import type { JSONContent } from '@tiptap/react';
import type { MessageType } from '../../types/chat';
import type {
    ChatMessageDto,
    ChatMessageEnvelopeDto,
    ChatUploadResponseDto,
} from './chatDtos';

export type ChatAttachmentType = 'image' | 'video' | 'audio' | 'file';

export interface SendMessageRequest {
    readonly content: JSONContent;
    readonly type: MessageType;
    readonly mediaAssetId?: string;
    readonly replyToId?: string;
}

const createChatFormData = (file: File, type: ChatAttachmentType): FormData => {
    const formData = new FormData();
    let filename = file.name;

    if (type === 'video' && !filename.toLowerCase().endsWith('.mp4')) {
        filename += '.mp4';
    }

    formData.append('file', file, filename);
    return formData;
};

export const getChatHistory = async (
    limit = 50,
    before?: string,
): Promise<ChatMessageDto[]> => {
    const { data } = await api.get<ChatMessageDto[]>('/chat/history', {
        params: {
            limit,
            ...(before ? { before } : {}),
        },
    });
    return data;
};

export const uploadChatMedia = async (
    file: File,
    type: ChatAttachmentType,
): Promise<ChatUploadResponseDto> => {
    const formData = createChatFormData(file, type);
    const endpoint = type === 'image'
        ? '/chat/upload-image'
        : type === 'file'
            ? '/chat/upload-file'
            : '/chat/upload-media';
    const { data } = await api.post<ChatUploadResponseDto>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
};

export const sendTextMessage = async (
    body: SendMessageRequest,
): Promise<ChatMessageDto> => {
    const { data } = await api.post<ChatMessageEnvelopeDto>('/chat', body);
    return data.message;
};

export const toggleReaction = async (
    messageId: string,
    emoji: string,
): Promise<ChatMessageDto> => {
    const { data } = await api.patch<ChatMessageEnvelopeDto>(
        `/chat/${encodeURIComponent(messageId)}/reaction`,
        { emoji },
    );
    return data.message;
};
