// src/storage/chatStorage.ts

import type {
    ChatMessage,
    ChatUserSummary,
    MessageReaction,
    MessageType,
    ReplyPreview,
} from '../types/chat';
import type { TipTapContent } from '../types/annoucement';
import type { JsonArray, JsonObject, JsonValue } from '../types/json';
import {
    APP_STORAGE_PREFIX,
    buildAppStorageKey,
    readStorageValue,
    removeStorageKeysMatching,
    removeStorageValue,
    writeStorageValue,
} from './appStorage';

const CHAT_CACHE_VERSION = 1;
const CHAT_CACHE_LIMIT = 120;
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

interface ChatCacheEnvelope {
    readonly version: number;
    readonly messages: readonly ChatMessage[];
}

const normalizeStorageSegment = (value: string): string => value.trim();

export const buildChatStorageKey = (
    choirId: string,
    userId: string,
): string => buildAppStorageKey(choirId, userId, 'chat');

const isJsonObject = (value: JsonValue | undefined): value is JsonObject => (
    typeof value === 'object' && value !== null && !Array.isArray(value)
);

const readString = (value: JsonValue | undefined): string | undefined => (
    typeof value === 'string' ? value : undefined
);

const readNullableString = (value: JsonValue | undefined): string | null | undefined => {
    if (value === null) {
        return null;
    }

    return readString(value);
};

const normalizeTipTapContent = (value: JsonValue | undefined): TipTapContent | null => {
    if (!isJsonObject(value) || value.type !== 'doc' || !Array.isArray(value.content)) {
        return null;
    }

    const content = value.content.filter(isJsonObject);

    return {
        ...value,
        type: 'doc',
        content,
    };
};

const normalizeChatUser = (value: JsonValue | undefined): ChatUserSummary | null => {
    if (!isJsonObject(value)) {
        return null;
    }

    const id = readString(value.id);
    const name = readString(value.name);
    const username = readString(value.username);

    if (!id || !name || !username) {
        return null;
    }

    return {
        id,
        name,
        username,
        imageUrl: readString(value.imageUrl) ?? '',
    };
};

const normalizeReplyPreview = (value: JsonValue | undefined): ReplyPreview | null => {
    if (value === null || value === undefined) {
        return null;
    }

    if (!isJsonObject(value)) {
        return null;
    }

    const id = readString(value.id);
    const username = readString(value.username);
    const textPreview = readString(value.textPreview);

    if (!id || !username || textPreview === undefined) {
        return null;
    }

    return {
        id,
        username,
        textPreview,
    };
};

const normalizeReactionUser = (
    value: JsonValue | undefined,
): ChatUserSummary | string | null => {
    if (typeof value === 'string') {
        return value;
    }

    return normalizeChatUser(value);
};

const normalizeReaction = (value: JsonValue): MessageReaction | null => {
    if (!isJsonObject(value)) {
        return null;
    }

    const emoji = readString(value.emoji);
    const user = normalizeReactionUser(value.user);

    if (!emoji || !user) {
        return null;
    }

    return {
        emoji,
        user,
        username: readString(value.username),
    };
};

const isMessageType = (value: string): value is MessageType => (
    MESSAGE_TYPES.some((messageType) => messageType === value)
);

const normalizeMessageType = (value: JsonValue | undefined): MessageType => {
    if (typeof value !== 'string') {
        return 'TEXT';
    }

    return isMessageType(value) ? value : 'TEXT';
};

const normalizeMessage = (value: JsonValue): ChatMessage | null => {
    if (!isJsonObject(value)) {
        return null;
    }

    const id = readString(value.id);
    const author = normalizeChatUser(value.author);
    const content = normalizeTipTapContent(value.content);
    const createdAt = readString(value.createdAt);

    if (!id || !author || !content || !createdAt) {
        return null;
    }

    const reactionsValue = Array.isArray(value.reactions)
        ? value.reactions
        : [];
    const reactions = reactionsValue
        .map(normalizeReaction)
        .filter((reaction): reaction is MessageReaction => reaction !== null);

    return {
        id,
        choirId: readNullableString(value.choirId),
        author,
        content,
        type: normalizeMessageType(value.type),
        fileUrl: readString(value.fileUrl),
        filename: readString(value.filename),
        imageUrl: readString(value.imageUrl),
        audioUrl: readString(value.audioUrl),
        imagePublicId: readString(value.imagePublicId),
        mediaAssetId: readString(value.mediaAssetId),
        reactions,
        replyTo: normalizeReplyPreview(value.replyTo),
        createdAt,
        updatedAt: readString(value.updatedAt),
    };
};

const parseChatCache = (rawValue: string): ChatMessage[] => {
    try {
        const parsedValue: JsonValue = JSON.parse(rawValue);

        if (!isJsonObject(parsedValue) || parsedValue.version !== CHAT_CACHE_VERSION) {
            return [];
        }

        const messagesValue: JsonArray = Array.isArray(parsedValue.messages)
            ? parsedValue.messages
            : [];

        return messagesValue
            .map(normalizeMessage)
            .filter((message): message is ChatMessage => message !== null)
            .slice(-CHAT_CACHE_LIMIT);
    } catch {
        return [];
    }
};

export const readChatCache = (
    choirId: string,
    userId: string,
): ChatMessage[] => {
    const storageKey = buildChatStorageKey(choirId, userId);
    const rawValue = readStorageValue(storageKey);

    return rawValue ? parseChatCache(rawValue) : [];
};

export const writeChatCache = (
    choirId: string,
    userId: string,
    messages: readonly ChatMessage[],
): void => {
    const normalizedChoirId = normalizeStorageSegment(choirId);
    const normalizedUserId = normalizeStorageSegment(userId);

    if (!normalizedChoirId || !normalizedUserId) {
        return;
    }

    const envelope: ChatCacheEnvelope = {
        version: CHAT_CACHE_VERSION,
        messages: messages.slice(-CHAT_CACHE_LIMIT),
    };

    writeStorageValue(
        buildChatStorageKey(normalizedChoirId, normalizedUserId),
        JSON.stringify(envelope),
    );
};

export const clearChatCache = (choirId: string, userId: string): void => {
    const normalizedChoirId = normalizeStorageSegment(choirId);
    const normalizedUserId = normalizeStorageSegment(userId);

    if (!normalizedChoirId || !normalizedUserId) {
        return;
    }

    removeStorageValue(buildChatStorageKey(normalizedChoirId, normalizedUserId));
};

export const clearAllChatCaches = (): void => {
    removeStorageKeysMatching((key) => (
        key.startsWith(APP_STORAGE_PREFIX) && key.endsWith(':chat')
    ));
};
