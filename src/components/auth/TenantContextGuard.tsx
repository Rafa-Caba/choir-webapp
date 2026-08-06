// src/components/auth/TenantContextGuard.tsx

import type { JSX } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { AccessDenied } from './AccessDenied';

interface TenantContextGuardProps {
    readonly children: JSX.Element;
}

export const TenantContextGuard = ({ children }: TenantContextGuardProps) => {
    const {
        hasTenantContext,
        isSuperAdmin,
        targetChoirLoading,
    } = useAuth();

    if (targetChoirLoading) {
        return (
            <Box
                sx={{
                    width: '100%',
                    minHeight: 360,
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <CircularProgress aria-label="Restaurando contexto del coro" />
            </Box>
        );
    }

    if (!hasTenantContext) {
        return isSuperAdmin ? (
            <AccessDenied
                title="Selecciona un coro"
                message="Para abrir esta sección debes elegir primero el coro que deseas administrar."
                actionLabel="Ir a la consola de coros"
                actionPath="/admin/choirs"
            />
        ) : (
            <AccessDenied
                title="Contexto de coro no disponible"
                message="Tu sesión no tiene un coro activo asignado. Contacta a un administrador de la plataforma."
                actionLabel="Ver mi perfil"
                actionPath="/admin/profile"
            />
        );
    }

    return children;
};
