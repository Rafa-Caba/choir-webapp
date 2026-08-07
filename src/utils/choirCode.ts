// src/utils/choirCode.ts

export const PUBLIC_CHOIR_CODE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/u;

export const normalizeChoirCode = (value: string): string => value.trim().toLowerCase();

export const isValidChoirCode = (value: string): boolean => (
    PUBLIC_CHOIR_CODE_PATTERN.test(normalizeChoirCode(value))
);

export const encodeChoirCode = (value: string): string => {
    const normalizedValue = normalizeChoirCode(value);

    if (!isValidChoirCode(normalizedValue)) {
        throw new Error('Invalid public choir code');
    }

    return encodeURIComponent(normalizedValue);
};

export const buildPublicChoirPath = (
    choirCode: string,
    relativePath = '',
): string => {
    const encodedChoirCode = encodeChoirCode(choirCode);
    const normalizedRelativePath = relativePath.trim().replace(/^\/+|\/+$/gu, '');

    return normalizedRelativePath
        ? `/${encodedChoirCode}/${normalizedRelativePath}`
        : `/${encodedChoirCode}`;
};
