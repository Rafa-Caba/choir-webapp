// src/components/auth/AdminEntryRoute.tsx

import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { Dashboard } from '../../pages/admin/Dashboard';
import { TenantContextGuard } from './TenantContextGuard';
import { resolveAdminEntryRedirect } from '../../routing/adminNavigation';

export const AdminEntryRoute = () => {
    const {
        hasTenantContext,
        isSuperAdmin,
        targetChoirLoading,
    } = useAuth();

    if (targetChoirLoading) {
        return (
            <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center' }}>
                <CircularProgress aria-label="Restaurando contexto del coro" />
            </Box>
        );
    }

    const redirectPath = resolveAdminEntryRedirect({
        isSuperAdmin,
        hasTenantContext,
    });

    if (redirectPath) {
        return <Navigate to={redirectPath} replace />;
    }

    return (
        <TenantContextGuard>
            <Dashboard />
        </TenantContextGuard>
    );
};
