// src/pagination/cardPagination.ts

import type { PageSize } from '../types/pagination';

export interface PageWindow {
    readonly page: number;
    readonly totalPages: number;
    readonly startIndex: number;
    readonly endIndex: number;
}

export const getCardPageWindow = (
    totalItems: number,
    requestedPage: number,
    pageSize: PageSize,
): PageWindow => {
    const safeTotalItems = Math.max(0, Math.floor(totalItems));
    const totalPages = Math.max(1, Math.ceil(safeTotalItems / pageSize));
    const page = Math.min(Math.max(1, Math.floor(requestedPage)), totalPages);
    const startIndex = (page - 1) * pageSize;

    return {
        page,
        totalPages,
        startIndex,
        endIndex: Math.min(startIndex + pageSize, safeTotalItems),
    };
};
