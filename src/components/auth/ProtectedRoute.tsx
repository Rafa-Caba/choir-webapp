// src/components/auth/ProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = () => {
    const {
        loading,
        requiresPasswordChange,
        user,
    } = useAuth();
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

    return <Outlet />;
};
