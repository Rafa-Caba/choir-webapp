// src/types/log.ts

import type { User, UserRole } from './auth';
import type { JsonValue } from './json';

export interface LogUserSummary {
    readonly id: string;
    readonly name: string;
    readonly username: string;
    readonly role: UserRole;
}

export interface LogChanges {
    readonly before?: JsonValue;
    readonly after?: JsonValue;
    readonly new?: JsonValue;
    readonly deleted?: JsonValue;
    readonly updated?: JsonValue;
    readonly sessionsRevoked?: boolean;
}

export interface Log {
    id: string;
    choirId: string;
    user: User | LogUserSummary;
    collectionName: string;
    action: 'create' | 'update' | 'delete' | 'add_reaction' | 'remove_reaction';
    operation?: string;
    referenceId: string;
    description?: string;
    changes?: LogChanges;
    createdAt: string;
}

export interface LogsResponse {
    logs: Log[];
    currentPage: number;
    totalPages: number;
    totalLogs: number;
}

export interface UserLogsResponse {
    logs: Log[];
    currentPage: number;
    totalPages: number;
}
