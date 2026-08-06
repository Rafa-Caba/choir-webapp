// src/auth/permissions.ts

import type { UserRole } from '../types/auth';

export type PermissionKey =
    | 'canManageChoirs'
    | 'canManageUsers'
    | 'canManageContent'
    | 'canManageSettings'
    | 'canManageInstruments'
    | 'canManageMembers'
    | 'canManageSongTypes'
    | 'canManageThemes'
    | 'canViewTenantLogs'
    | 'canViewPlatformLogs';

export interface PermissionSet {
    readonly isSuperAdmin: boolean;
    readonly isEditor: boolean;
    readonly canManageChoirs: boolean;
    readonly canManageUsers: boolean;
    readonly canManageContent: boolean;
    readonly canManageSettings: boolean;
    readonly canManageInstruments: boolean;
    readonly canManageMembers: boolean;
    readonly canManageSongTypes: boolean;
    readonly canManageThemes: boolean;
    readonly canViewTenantLogs: boolean;
    readonly canViewPlatformLogs: boolean;
}

export const getPermissions = (role: UserRole | null | undefined): PermissionSet => {
    const isSuperAdmin = role === 'SUPER_ADMIN';
    const tenantAdmin = role === 'ADMIN';
    const isEditor = role === 'EDITOR';
    const canManageTenantAdministration = isSuperAdmin || tenantAdmin;

    return {
        isSuperAdmin,
        isEditor,
        canManageChoirs: isSuperAdmin,
        canManageUsers: canManageTenantAdministration,
        canManageContent: canManageTenantAdministration || isEditor,
        canManageSettings: canManageTenantAdministration,
        canManageInstruments: canManageTenantAdministration,
        canManageMembers: canManageTenantAdministration,
        canManageSongTypes: canManageTenantAdministration,
        canManageThemes: canManageTenantAdministration,
        canViewTenantLogs: canManageTenantAdministration,
        canViewPlatformLogs: isSuperAdmin,
    };
};

export const hasPermission = (
    role: UserRole | null | undefined,
    permission: PermissionKey,
): boolean => getPermissions(role)[permission];

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

export const canViewTenantLogs = (role: UserRole | null | undefined): boolean => (
    getPermissions(role).canViewTenantLogs
);

export const canViewPlatformLogs = (role: UserRole | null | undefined): boolean => (
    getPermissions(role).canViewPlatformLogs
);
