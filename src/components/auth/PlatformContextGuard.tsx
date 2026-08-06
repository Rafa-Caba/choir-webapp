// src/components/auth/PlatformContextGuard.tsx

import { useEffect, type JSX } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { AccessDenied } from './AccessDenied';

interface PlatformContextGuardProps {
    readonly children: JSX.Element;
}

export const PlatformContextGuard = ({ children }: PlatformContextGuardProps) => {
    const {
        isSuperAdmin,
        hasTenantContext,
        returnToPlatform,
    } = useAuth();

    useEffect(() => {
        if (isSuperAdmin && hasTenantContext) {
            returnToPlatform();
        }
    }, [hasTenantContext, isSuperAdmin, returnToPlatform]);

    if (!isSuperAdmin) {
        return (
            <AccessDenied
                title="Acceso exclusivo de plataforma"
                message="Esta sección solo está disponible para administradores de plataforma."
                actionPath="/admin"
            />
        );
    }

    if (hasTenantContext) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 240,
                }}
            >
                <CircularProgress aria-label="Regresando a la consola de plataforma" />
            </Box>
        );
    }

    return children;
};
