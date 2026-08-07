// src/services/admin/log.ts

import api from '../../api/axios';
import type { LogFilters, LogsResponse, UserLogsResponse } from '../../types/log';

const appendFilter = (
    params: URLSearchParams,
    key: string,
    value: string | undefined,
): void => {
    if (value?.trim()) {
        params.set(key, value.trim());
    }
};

const buildLogParams = (
    page: number,
    limit: number,
    filters: LogFilters,
): URLSearchParams => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });

    appendFilter(params, 'collection', filters.collectionName);
    appendFilter(params, 'operation', filters.operation);
    appendFilter(params, 'action', filters.action);
    appendFilter(params, 'actorUserId', filters.actorUserId);
    appendFilter(params, 'targetUserId', filters.targetUserId);

    return params;
};

export const getLogs = async (
    page = 1,
    limit = 20,
    filters: LogFilters = {},
): Promise<LogsResponse> => {
    const params = buildLogParams(page, limit, filters);
    const { data } = await api.get<LogsResponse>(`/logs?${params.toString()}`);
    return data;
};

export const getPlatformLogs = async (
    page = 1,
    limit = 20,
    filters: LogFilters = {},
): Promise<LogsResponse> => {
    const params = buildLogParams(page, limit, filters);
    const { data } = await api.get<LogsResponse>(`/logs/platform?${params.toString()}`);
    return data;
};

export const getUserLogs = async (
    userId: string,
    page = 1,
    limit = 10,
): Promise<UserLogsResponse> => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });
    const { data } = await api.get<UserLogsResponse>(
        `/logs/user/${encodeURIComponent(userId)}?${params.toString()}`,
    );
    return data;
};
