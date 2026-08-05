// src/components/auth/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    readonly requireAdmin?: boolean;
}

export const ProtectedRoute = ({ requireAdmin = false }: ProtectedRouteProps) => {
    const {
        isAdmin,
        loading,
        requiresPasswordChange,
        user,
    } = useAuth();

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: '100vh' }}
            >
                <Spinner animation="border" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    if (requiresPasswordChange) {
        return <Navigate to="/auth/change-password" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
};
