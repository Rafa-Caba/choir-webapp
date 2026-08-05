// src/components/PrivateRoute.tsx

import type { JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
    readonly children: JSX.Element;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
    const { loading, requiresPasswordChange, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <CircularProgress aria-label="Restaurando sesión" />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }

    if (requiresPasswordChange) {
        return <Navigate to="/auth/change-password" replace />;
    }

    return children;
};
