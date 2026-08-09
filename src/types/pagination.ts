// src/types/pagination.ts

export type PageSize = 10 | 50 | 100;

export const PAGE_SIZE_OPTIONS: readonly PageSize[] = [10, 50, 100];

export const isPageSize = (value: number): value is PageSize => (
    value === 10 || value === 50 || value === 100
);
