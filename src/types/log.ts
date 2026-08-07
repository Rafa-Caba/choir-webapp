// src/types/log.ts

import type { UserRole } from './auth';
import type { JsonObject } from './json';

export type LogAction = 'create' | 'update' | 'delete' | 'add_reaction' | 'remove_reaction';

export interface LogUserSummary {
    readonly id: string;
    readonly name: string;
    readonly username: string;
    readonly role: UserRole;
}

export interface LogFilters {
    readonly collectionName?: string;
    readonly operation?: string;
    readonly action?: LogAction;
    readonly actorUserId?: string;
    readonly targetUserId?: string;
}

export interface Log {
    readonly id: string;
    readonly action: LogAction;
    readonly operation: string;
    readonly collectionName: string;
    readonly referenceId: string;
    readonly actorUserId: string;
    readonly actor: LogUserSummary | null;
    readonly actorRole: UserRole | null;
    readonly targetChoirId: string;
    readonly targetUserId: string | null;
    readonly targetUser: LogUserSummary | null;
    readonly description: string;
    readonly before: JsonObject | null;
    readonly after: JsonObject | null;
    readonly changes: JsonObject;
    readonly ipAddress: string;
    readonly userAgent: string;
    readonly deviceId: string;
    readonly timestamp: string;
    readonly createdAt: string;
}

export interface LogsResponse {
    readonly logs: Log[];
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalLogs: number;
}

export interface UserLogsResponse {
    readonly logs: Log[];
    readonly currentPage: number;
    readonly totalPages: number;
}
