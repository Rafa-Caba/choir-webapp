// src/utils/handleTextTipTap.ts

import type { JSONContent } from '@tiptap/react';
import type { Dispatch, SetStateAction } from 'react';
import type { JsonValue } from '../types/json';

type TipTapInput = JSONContent | JsonValue | undefined;

const createEmptyDocument = (): JSONContent => ({
    type: 'doc',
    content: [],
});

export function createHandleTextoChange<
    T extends object,
    K extends keyof T,
>(
    setState: Dispatch<SetStateAction<T | null>>,
    key: K,
): (value: T[K]) => void {
    return (value) => {
        setState((previousState) => (
            previousState
                ? { ...previousState, [key]: value }
                : previousState
        ));
    };
}

export const createUpdateFormData = <T>() => (
    setFormData: Dispatch<SetStateAction<T | null>>,
) => (
    changes: Partial<T>,
): void => {
        setFormData((previousState) => (
            previousState
                ? { ...previousState, ...changes }
                : previousState
        ));
    };

const extractText = (node: JSONContent): string => {
    if (node.type === 'text') {
        return typeof node.text === 'string' ? node.text : '';
    }

    return node.content?.map(extractText).join('') ?? '';
};

export const getTextFromTipTapJSON = (
    value: TipTapInput,
    maxLength = 60,
): string => {
    const text = extractText(parseText(value));

    return text.length > maxLength
        ? `${text.slice(0, maxLength)}...`
        : text;
};

export const parseText = (value: TipTapInput): JSONContent => {
    if (typeof value === 'string') {
        try {
            const parsedValue: JsonValue = JSON.parse(value);
            return isValidTipTapContent(parsedValue)
                ? parsedValue
                : createEmptyDocument();
        } catch {
            return createEmptyDocument();
        }
    }

    return isValidTipTapContent(value)
        ? value
        : createEmptyDocument();
};

export const isValidTipTapContent = (
    value: TipTapInput,
): value is JSONContent => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }

    return value.type === 'doc' && Array.isArray(value.content);
};
