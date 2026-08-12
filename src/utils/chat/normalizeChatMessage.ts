// src/utils/chat/normalizeChatMessage.ts

import type {
    ChatMediaMetadata,
    ChatMessage,
    MessageType,
    ChatUserSummary,
    ReplyPreview,
    MessageReaction,
} from '../../types/chat';
import type { TipTapContent } from '../../types/announcement';
import type { JsonObject, JsonValue } from '../../types/json';
import type {
    ChatMediaAssetDto,
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

const createTextContent = (text: string): TipTapContent => ({
    type: 'doc',
    content: [
        {
            type: 'paragraph',
            attrs: { textAlign: 'left' },
            content: text
                ? [{ type: 'text', text }]
                : [],
        },
    ],
});

const isJsonObject = (value: JsonValue | undefined): value is JsonObject => (
    typeof value === 'object' && value !== null && !Array.isArray(value)
);

const firstNonEmptyString = (
    ...values: readonly (string | undefined | null)[]
): string => {
    for (const value of values) {
        const normalized = value?.trim() ?? '';

        if (normalized) {
            return normalized;
        }
    }

    return '';
};

const normalizeContent = (value: JsonValue | undefined): TipTapContent => {
    if (typeof value === 'string') {
        return createTextContent(value);
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return createTextContent(String(value));
    }

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

    if (typeof content === 'number' || typeof content === 'boolean') {
        return String(content);
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

const getReplyTypePreview = (
    type: string | undefined,
    filename?: string,
): string => {
    switch (type) {
        case 'IMAGE':
            return '📷 Foto';
        case 'VIDEO':
        case 'MEDIA':
            return '🎥 Video';
        case 'AUDIO':
            return '🎤 Nota de voz';
        case 'FILE':
            return filename ? `📎 ${filename}` : '📎 Archivo';
        case 'STICKER':
            return '✨ Sticker';
        default:
            return 'Mensaje original';
    }
};

const normalizeReplyTo = (
    rawReply: ChatReplyDto | string | null | undefined,
): ReplyPreview | null => {
    if (!rawReply) {
        return null;
    }

    if (typeof rawReply === 'string') {
        return {
            id: rawReply,
            username: 'usuario',
            textPreview: 'Mensaje original',
        };
    }

    const id = rawReply.id ?? rawReply._id ?? '';
    const username = (
        rawReply.username ??
        rawReply.author?.username ??
        rawReply.author?.name ??
        'Usuario'
    );
    const content = rawReply.content ?? rawReply.contenido;
    const contentPreview = rawReply.textPreview ?? extractTextFromTiptap(content);

    return {
        id,
        username,
        textPreview: contentPreview || getReplyTypePreview(rawReply.type, rawReply.filename),
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

const normalizeMedia = (
    raw: ChatMediaAssetDto | string | null | undefined,
    fallbackUrl: string,
    fallbackFilename: string,
): ChatMediaMetadata | null => {
    if (!raw || typeof raw === 'string') {
        if (!fallbackUrl) {
            return null;
        }

        return {
            id: typeof raw === 'string' ? raw : '',
            url: fallbackUrl,
            filename: fallbackFilename,
            mimeType: '',
            bytes: 0,
            format: '',
            resourceType: '',
        };
    }

    return {
        id: raw.id ?? raw._id ?? '',
        url: firstNonEmptyString(raw.url, fallbackUrl),
        filename: firstNonEmptyString(raw.originalName, fallbackFilename),
        mimeType: raw.mimeType?.trim() ?? '',
        bytes: typeof raw.bytes === 'number' ? raw.bytes : 0,
        format: raw.format?.trim() ?? '',
        resourceType: raw.resourceType?.trim() ?? '',
    };
};

export const normalizeChatMessage = (raw: ChatMessageDto): ChatMessage => {
    const createdAt = raw.createdAt ?? new Date().toISOString();
    const messageType = normalizeMessageType(raw.type);
    const fallbackMediaUrl = firstNonEmptyString(
        raw.imageUrl,
        raw.audioUrl,
        raw.fileUrl,
    );
    const fallbackFilename = firstNonEmptyString(raw.filename, 'Archivo adjunto');
    const media = normalizeMedia(raw.mediaAssetId, fallbackMediaUrl, fallbackFilename);
    const mediaUrl = firstNonEmptyString(
        media?.url,
        messageType === 'IMAGE' ? raw.imageUrl : undefined,
        messageType === 'AUDIO' ? raw.audioUrl : undefined,
        raw.fileUrl,
        raw.imageUrl,
        raw.audioUrl,
    );

    return {
        id: raw.id ?? raw._id ?? '',
        choirId: raw.choirId ?? null,
        author: normalizeUser(raw.author ?? raw.user),
        content: normalizeContent(raw.content),
        type: messageType,
        fileUrl: ['FILE', 'MEDIA', 'VIDEO'].includes(messageType)
            ? mediaUrl
            : firstNonEmptyString(raw.fileUrl),
        filename: firstNonEmptyString(raw.filename, media?.filename),
        imageUrl: messageType === 'IMAGE'
            ? mediaUrl
            : firstNonEmptyString(raw.imageUrl),
        audioUrl: messageType === 'AUDIO'
            ? mediaUrl
            : firstNonEmptyString(raw.audioUrl),
        imagePublicId: firstNonEmptyString(raw.imagePublicId, raw.mediaPublicId),
        mediaAssetId: normalizeMediaAssetId(raw.mediaAssetId),
        media,
        reactions: (raw.reactions ?? []).map(normalizeReaction),
        replyTo: normalizeReplyTo(raw.replyTo),
        createdAt,
        updatedAt: raw.updatedAt ?? createdAt,
    };
};
