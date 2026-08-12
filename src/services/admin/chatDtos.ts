// src/services/admin/chatDtos.ts

import type { JsonValue } from '../../types/json';

export interface ChatUserDto {
    readonly id?: string;
    readonly _id?: string;
    readonly name?: string;
    readonly username?: string;
    readonly imageUrl?: string;
}

export type ChatUserReferenceDto = ChatUserDto | string;

export interface ChatReactionDto {
    readonly emoji?: string;
    readonly user?: ChatUserReferenceDto;
    readonly usuario?: ChatUserReferenceDto;
    readonly username?: string;
}

export interface ChatReplyDto {
    readonly id?: string;
    readonly _id?: string;
    readonly username?: string;
    readonly author?: ChatUserDto;
    readonly textPreview?: string;
    readonly content?: JsonValue;
    readonly contenido?: JsonValue;
    readonly type?: string;
    readonly filename?: string;
    readonly mediaAssetId?: ChatMediaAssetDto | string | null;
}

export interface ChatMediaAssetDto {
    readonly id?: string;
    readonly _id?: string;
    readonly url?: string;
    readonly originalName?: string;
    readonly mimeType?: string;
    readonly bytes?: number;
    readonly format?: string;
    readonly resourceType?: string;
}

export interface ChatMessageDto {
    readonly id?: string;
    readonly _id?: string;
    readonly choirId?: string | null;
    readonly author?: ChatUserDto;
    readonly user?: ChatUserDto;
    readonly content?: JsonValue;
    readonly type?: string;
    readonly fileUrl?: string;
    readonly filename?: string;
    readonly imageUrl?: string;
    readonly audioUrl?: string;
    readonly imagePublicId?: string;
    readonly mediaPublicId?: string;
    readonly mediaAssetId?: ChatMediaAssetDto | string | null;
    readonly reactions?: readonly ChatReactionDto[];
    readonly replyTo?: ChatReplyDto | string | null;
    readonly createdAt?: string;
    readonly updatedAt?: string;
}

export interface ChatUploadResponseDto {
    readonly assetId: string;
    readonly fileUrl: string;
    readonly filename: string;
    readonly resourceType: string;
}

export interface ChatMessageEnvelopeDto {
    readonly message: ChatMessageDto;
}
