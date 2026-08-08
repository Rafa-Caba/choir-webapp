// src/utils/chat/normalizeChatMessage.ts

import type {
    ChatMessage,
    MessageType,
    ChatUserSummary,
    ReplyPreview,
    MessageReaction,
} from '../../types/chat';
import type { TipTapContent } from '../../types/announcement';
import type { JsonObject, JsonValue } from '../../types/json';
import type {
    ChatMessageDto,
    ChatReactionDto,
    ChatReplyDto,
    ChatUserDto,
    ChatUserReferenceDto,
} from '../../services/admin/chatDtos';

const MESSAGE_TYPES: readonly MessageType[] = [
    'TEXT',
    'IMAGE',
    'FILE',
    'MEDIA',
    'REACTION',
    'AUDIO',
    'VIDEO',
    'STICKER',
];

const createEmptyContent = (): TipTapContent => ({
    type: 'doc',
    content: [],
});

const isJsonObject = (value: JsonValue | undefined): value is JsonObject => (
    typeof value === 'object' && value !== null && !Array.isArray(value)
);

const normalizeContent = (value: JsonValue | undefined): TipTapContent => {
    if (!isJsonObject(value) || typeof value.type !== 'string') {
        return createEmptyContent();
    }

    const content = Array.isArray(value.content)
        ? value.content.filter(isJsonObject)
        : [];

    return {
        ...value,
        type: value.type,
        content,
    };
};

const extractTextFromTiptap = (content: JsonValue | undefined): string => {
    if (typeof content === 'string') {
        return content;
    }

    if (!isJsonObject(content)) {
        return '';
    }

    const readNodes = (nodes: readonly JsonValue[]): string => nodes
        .map((node) => {
            if (!isJsonObject(node)) {
                return '';
            }

            if (node.type === 'text' && typeof node.text === 'string') {
                return node.text;
            }

            if (node.type === 'hardBreak') {
                return '\n';
            }

            return Array.isArray(node.content) ? readNodes(node.content) : '';
        })
        .join('');

    return Array.isArray(content.content)
        ? readNodes(content.content).trim()
        : '';
};

const normalizeUser = (rawUser: ChatUserDto | undefined): ChatUserSummary => ({
    id: rawUser?.id ?? rawUser?._id ?? '',
    name: rawUser?.name?.trim() || 'Usuario',
    username: rawUser?.username?.trim() || 'usuario',
    imageUrl: rawUser?.imageUrl?.trim() || '',
});

const normalizeReplyTo = (rawReply: ChatReplyDto | null | undefined): ReplyPreview | null => {
    if (!rawReply) {
        return null;
    }

    const id = rawReply.id ?? rawReply._id ?? '';
    const username = (
        rawReply.username ??
        rawReply.author?.username ??
        rawReply.author?.name ??
        'Usuario'
    );
    const content = rawReply.content ?? rawReply.contenido;

    return {
        id,
        username,
        textPreview: rawReply.textPreview ?? extractTextFromTiptap(content),
    };
};

const normalizeReactionUser = (
    rawUser: ChatUserReferenceDto | undefined,
): ChatUserSummary | string => {
    if (typeof rawUser === 'string') {
        return rawUser;
    }

    return normalizeUser(rawUser);
};

const normalizeReaction = (reaction: ChatReactionDto): MessageReaction => {
    const rawUser = reaction.user ?? reaction.usuario;
    const user = normalizeReactionUser(rawUser);
    const fallbackUsername = typeof user === 'string'
        ? user
        : user.username || user.name || user.id;

    return {
        emoji: reaction.emoji ?? '',
        user,
        username: reaction.username ?? fallbackUsername,
    };
};

const isMessageType = (value: string): value is MessageType => (
    MESSAGE_TYPES.some((messageType) => messageType === value)
);

const normalizeMessageType = (value: string | undefined): MessageType => (
    value && isMessageType(value) ? value : 'TEXT'
);

const normalizeMediaAssetId = (
    value: ChatMessageDto['mediaAssetId'],
): string | undefined => {
    if (typeof value === 'string') {
        return value;
    }

    return value?.id ?? value?._id;
};

export const normalizeChatMessage = (raw: ChatMessageDto): ChatMessage => {
    const createdAt = raw.createdAt ?? new Date().toISOString();
    const mediaAssetUrl = typeof raw.mediaAssetId === 'object' && raw.mediaAssetId
        ? raw.mediaAssetId.url
        : undefined;

    return {
        id: raw.id ?? raw._id ?? '',
        choirId: raw.choirId ?? null,
        author: normalizeUser(raw.author ?? raw.user),
        content: normalizeContent(raw.content),
        type: normalizeMessageType(raw.type),
        fileUrl: raw.fileUrl ?? mediaAssetUrl ?? '',
        filename: raw.filename ?? (
            typeof raw.mediaAssetId === 'object' && raw.mediaAssetId
                ? raw.mediaAssetId.originalName
                : ''
        ),
        imageUrl: raw.imageUrl ?? mediaAssetUrl,
        audioUrl: raw.audioUrl ?? mediaAssetUrl,
        imagePublicId: raw.imagePublicId ?? raw.mediaPublicId,
        mediaAssetId: normalizeMediaAssetId(raw.mediaAssetId),
        reactions: (raw.reactions ?? []).map(normalizeReaction),
        replyTo: normalizeReplyTo(raw.replyTo),
        createdAt,
        updatedAt: raw.updatedAt ?? createdAt,
    };
};
