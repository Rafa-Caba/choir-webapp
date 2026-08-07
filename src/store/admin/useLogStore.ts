// src/store/admin/useLogStore.ts

import { create } from 'zustand';
import { getLogs, getUserLogs } from '../../services/admin/log';
import type { Log, LogFilters } from '../../types/log';

interface LogState {
    readonly logs: Log[];
    readonly visibleLogs: Log[];
    readonly userLogs: Log[];
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalLogs: number;
    readonly loading: boolean;
    readonly searchQuery: string;
    readonly fetchLogs: (page?: number, filters?: LogFilters) => Promise<void>;
    readonly fetchUserLogs: (userId: string) => Promise<void>;
    readonly setPage: (page: number) => void;
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
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    loading: false,
    searchQuery: '',

    fetchLogs: async (page = 1, filters = {}) => {
        set({ loading: true });

        try {
            const data = await getLogs(page, 20, filters);
            const searchQuery = get().searchQuery;

            set({
                logs: data.logs,
                visibleLogs: filterLogs(data.logs, searchQuery),
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                totalLogs: data.totalLogs,
            });
        } catch (error) {
            console.error(error);
            set({ logs: [], visibleLogs: [] });
        } finally {
            set({ loading: false });
        }
    },

    fetchUserLogs: async (userId: string) => {
        set({ loading: true });

        try {
            const data = await getUserLogs(userId, 1, 50);
            set({ userLogs: data.logs });
        } catch (error) {
            console.error(error);
            set({ userLogs: [] });
        } finally {
            set({ loading: false });
        }
    },

    setPage: (page: number) => set({ currentPage: page }),

    searchLogsText: (query: string) => {
        const logs = get().logs;
        set({
            searchQuery: query,
            visibleLogs: filterLogs(logs, query),
        });
    },
}));
