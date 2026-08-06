// src/components/auth/RoleGuard.tsx

import type { JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasPermission, type PermissionKey } from '../../auth/permissions';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';
import { AccessDenied } from './AccessDenied';

interface RoleGuardProps {
    readonly children: JSX.Element;
    readonly permission?: PermissionKey;
    readonly allowedRoles?: readonly UserRole[];
    readonly title?: string;
    readonly message?: string;
}

export const RoleGuard = ({
    children,
    permission,
    allowedRoles,
    title,
    message,
}: RoleGuardProps) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }

    const roleAllowed = allowedRoles ? allowedRoles.includes(user.role) : true;
    const permissionAllowed = permission ? hasPermission(user.role, permission) : true;

    if (!roleAllowed || !permissionAllowed) {
        return (
            <AccessDenied
                title={title}
                message={message}
            />
        );
    }

    return children;
};
