// src/store/admin/useLogStore.ts

import { create } from 'zustand';
import { getLogs, getUserLogs } from '../../services/admin/log';
import {
    beginTenantStoreRequest,
    isTenantStoreRequestCurrent,
} from '../tenantStoreScope';
import type { Log, LogFilters } from '../../types/log';
import type { PageSize } from '../../types/pagination';

interface LogState {
    readonly logs: Log[];
    readonly visibleLogs: Log[];
    readonly userLogs: Log[];
    readonly activeChoirId: string | null;
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalLogs: number;
    readonly pageSize: PageSize;
    readonly loading: boolean;
    readonly searchQuery: string;
    readonly fetchLogs: (page?: number, pageSize?: PageSize, filters?: LogFilters) => Promise<void>;
    readonly fetchUserLogs: (userId: string) => Promise<void>;
    readonly setPage: (page: number) => void;
    readonly setPageSize: (pageSize: PageSize) => void;
    readonly searchLogsText: (query: string) => void;
}

const normalizeSearchValue = (value: string): string => value.trim().toLowerCase();

const matchesSearch = (log: Log, query: string): boolean => {
    if (!query) {
        return true;
    }

    return [
        log.id,
        log.referenceId,
        log.collectionName,
        log.action,
        log.operation,
        log.description,
        log.actor?.name ?? '',
        log.actor?.username ?? '',
        log.targetUser?.name ?? '',
        log.targetUser?.username ?? '',
    ].some((value) => value.toLowerCase().includes(query));
};

const filterLogs = (logs: readonly Log[], query: string): Log[] => {
    const normalizedQuery = normalizeSearchValue(query);
    return logs.filter((log) => matchesSearch(log, normalizedQuery));
};

export const useLogStore = create<LogState>((set, get) => ({
    logs: [],
    visibleLogs: [],
    userLogs: [],
    activeChoirId: null,
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    pageSize: 10,
    loading: false,
    searchQuery: '',

    fetchLogs: async (page = 1, pageSize = get().pageSize, filters = {}) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const data = await getLogs(page, pageSize, filters);

            if (isTenantStoreRequestCurrent(scope)) {
                const searchQuery = get().searchQuery;
                set({
                    logs: data.logs,
                    visibleLogs: filterLogs(data.logs, searchQuery),
                    currentPage: data.currentPage,
                    totalPages: data.totalPages,
                    totalLogs: data.totalLogs,
                    pageSize,
                });
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    fetchUserLogs: async (userId) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const data = await getUserLogs(userId, 1, 50);

            if (isTenantStoreRequestCurrent(scope)) {
                set({ userLogs: data.logs });
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    setPage: (page) => set({ currentPage: page }),
    setPageSize: (pageSize) => set({ pageSize, currentPage: 1 }),

    searchLogsText: (query) => {
        const logs = get().logs;
        set({
            searchQuery: query,
            visibleLogs: filterLogs(logs, query),
        });
    },
}));
