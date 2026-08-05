// src/auth/permissions.ts

import type { UserRole } from '../types/auth';

export interface PermissionSet {
    readonly isSuperAdmin: boolean;
    readonly isAdmin: boolean;
    readonly canManageChoirs: boolean;
    readonly canManageUsers: boolean;
    readonly canManageContent: boolean;
    readonly canManageSettings: boolean;
    readonly canManageInstruments: boolean;
    readonly canManageMembers: boolean;
    readonly canManageSongTypes: boolean;
    readonly canManageThemes: boolean;
    readonly canViewAuditLogs: boolean;
}

export const getPermissions = (role: UserRole | null | undefined): PermissionSet => {
    const isSuperAdmin = role === 'SUPER_ADMIN';
    const isAdmin = role === 'ADMIN';
    const isEditor = role === 'EDITOR';
    const canManageTenantAdministration = isSuperAdmin || isAdmin;

    return {
        isSuperAdmin,
        isAdmin: canManageTenantAdministration,
        canManageChoirs: isSuperAdmin,
        canManageUsers: canManageTenantAdministration,
        canManageContent: canManageTenantAdministration || isEditor,
        canManageSettings: canManageTenantAdministration,
        canManageInstruments: canManageTenantAdministration,
        canManageMembers: canManageTenantAdministration,
        canManageSongTypes: canManageTenantAdministration,
        canManageThemes: canManageTenantAdministration,
        canViewAuditLogs: canManageTenantAdministration,
    };
};

export const isSuperAdmin = (role: UserRole | null | undefined): boolean => (
    getPermissions(role).isSuperAdmin
);

export const canManageChoirs = (role: UserRole | null | undefined): boolean => (
    getPermissions(role).canManageChoirs
);

export const canManageUsers = (role: UserRole | null | undefined): boolean => (
    getPermissions(role).canManageUsers
);

export const canManageContent = (role: UserRole | null | undefined): boolean => (
    getPermissions(role).canManageContent
);

export const canManageSettings = (role: UserRole | null | undefined): boolean => (
    getPermissions(role).canManageSettings
);

export const canViewAuditLogs = (role: UserRole | null | undefined): boolean => (
    getPermissions(role).canViewAuditLogs
);
