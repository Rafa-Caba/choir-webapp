// src/utils/chat/normalizeOutgoingChatContent.ts

import type { JSONContent } from '@tiptap/react';
import type { TipTapContent } from '../../types/annoucement';
import type { JsonObject, JsonValue } from '../../types/json';

const isJsonObject = (value: JsonValue | undefined): value is JsonObject => (
    typeof value === 'object' && value !== null && !Array.isArray(value)
);

export const normalizeOutgoingChatContent = (
    content: JSONContent,
): TipTapContent => {
    const serializedContent: JsonValue = JSON.parse(JSON.stringify(content));

    if (
        !isJsonObject(serializedContent) ||
        serializedContent.type !== 'doc' ||
        !Array.isArray(serializedContent.content)
    ) {
        throw new Error('Invalid TipTap chat content');
    }

    const nodes = serializedContent.content.filter(isJsonObject);

    return {
        ...serializedContent,
        type: 'doc',
        content: nodes,
    };
};
