// src/services/public/publicPath.ts

import { encodeChoirCode } from '../../utils/choirCode.js';

export const buildPublicApiPath = (
    choirCode: string,
    resourcePath: string,
): string => {
    const normalizedResourcePath = resourcePath.trim().replace(/^\/+|\/+$/gu, '');

    return `/public/${encodeChoirCode(choirCode)}/${normalizedResourcePath}`;
};
