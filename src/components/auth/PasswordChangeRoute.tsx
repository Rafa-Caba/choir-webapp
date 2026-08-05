// src/components/auth/PasswordChangeRoute.tsx

import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

interface PasswordChangeRouteProps {
    readonly children: JSX.Element;
}

export const PasswordChangeRoute = ({ children }: PasswordChangeRouteProps) => {
    const {
        accessMode,
        loading,
        requiresPasswordChange,
        user,
    } = useAuth();

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <CircularProgress aria-label="Validando sesión" />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    if (!requiresPasswordChange) {
        return (
            <Navigate
                to={accessMode === 'platform' ? '/admin/choirs' : '/admin'}
                replace
            />
        );
    }

    return children;
};
