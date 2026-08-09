// src/hooks/useClientPagination.ts

import { useEffect, useMemo, useState } from 'react';
import type { PageSize } from '../types/pagination';
import { getCardPageWindow } from '../pagination/cardPagination';

interface ClientPaginationResult<Item> {
    readonly page: number;
    readonly pageSize: PageSize;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly paginatedItems: Item[];
    readonly setPage: (page: number) => void;
    readonly setPageSize: (pageSize: PageSize) => void;
}

export const useClientPagination = <Item>(
    items: readonly Item[],
    initialPageSize: PageSize = 10,
): ClientPaginationResult<Item> => {
    const [page, setPageState] = useState(1);
    const [pageSize, setPageSizeState] = useState<PageSize>(initialPageSize);
    const totalItems = items.length;
    const pageWindow = getCardPageWindow(totalItems, page, pageSize);
    const totalPages = pageWindow.totalPages;
    const safePage = pageWindow.page;

    useEffect(() => {
        setPageState((currentPage) => Math.min(currentPage, totalPages));
    }, [totalPages]);

    const paginatedItems = useMemo(() => {
        return items.slice(pageWindow.startIndex, pageWindow.endIndex);
    }, [items, pageWindow.startIndex, pageWindow.endIndex]);

    const setPage = (nextPage: number): void => {
        setPageState(Math.min(Math.max(1, nextPage), totalPages));
    };

    const setPageSize = (nextPageSize: PageSize): void => {
        setPageSizeState(nextPageSize);
        setPageState(1);
    };

    return {
        page: safePage,
        pageSize,
        totalPages,
        totalItems,
        paginatedItems,
        setPage,
        setPageSize,
    };
};
