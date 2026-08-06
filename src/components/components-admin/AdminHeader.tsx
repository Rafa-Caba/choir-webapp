// src/components/components-admin/AdminHeader.tsx

import { useEffect } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { UserMenu } from '../user-menu/UserMenu';
import { useAuth } from '../../context/AuthContext';
import { useAdminSettingsStore } from '../../store/admin/useSettingsStore';
import { formatName } from '../../utils';

export const AdminHeader = () => {
    const navigate = useNavigate();
    const {
        user,
        choir,
        targetChoir,
        hasTenantContext,
        isSuperAdmin,
        returnToPlatform,
        loading,
    } = useAuth();
    const { settings, fetchSettings } = useAdminSettingsStore();

    useEffect(() => {
        if (!loading && user && hasTenantContext) {
            void fetchSettings();
        }
    }, [fetchSettings, hasTenantContext, loading, user]);

    if (!user) {
        return <div className="text-center p-2">Cargando...</div>;
    }

    const effectiveChoir = targetChoir ?? choir;
    const choirName = effectiveChoir?.name ?? user.choirName ?? '';
    const choirCode = effectiveChoir?.code ?? user.choirCode ?? '';
    const choirLabel = hasTenantContext
        ? choirName || choirCode || 'Coro seleccionado'
        : 'Consola de plataforma';

    const handleReturnToPlatform = (): void => {
        returnToPlatform();
        navigate('/admin/choirs', { replace: true });
    };

    return (
        <header className="layout-header my-0 py-3">
            <div className="titulo-nav px-0 d-flex flex-column">
                <div className="titulo mx-5 text-black d-flex flex-column flex-md-row justify-content-md-between align-items-md-center">
                    <div className="titulo text-center text-md-start">
                        <h1 className="mb-1 mb-lg-0 d-flex flex-column flex-md-row align-items-md-center fs-2 fw-bold">
                            <span>{settings?.webTitle || (hasTenantContext ? 'Choir App' : 'Choir Platform')} - Admin</span>
                            <span className="ms-0 ms-md-3 mb-2">
                                <Badge className="fw-bold badge_bg">
                                    {choirLabel}
                                    {choirName && choirCode ? ` (${choirCode})` : ''}
                                </Badge>
                            </span>
                        </h1>
                    </div>

                    <div className="d-flex align-items-center justify-content-between justify-content-lg-end gap-3 mt-3 mt-md-0">
                        {isSuperAdmin && hasTenantContext && (
                            <Button variant="outline-light" size="sm" onClick={handleReturnToPlatform}>
                                Volver a consola
                            </Button>
                        )}

                        <p className="titulo mb-1 text-center fs-4 text-md-end">
                            ¡Hola {formatName(user.name)}!
                        </p>

                        <div className="d-flex flex-row gap-3 align-items-center">
                            {hasTenantContext && (
                                <Button
                                    variant="link"
                                    title="Abrir chat grupal"
                                    onClick={() => navigate('/admin/chat-group')}
                                    className="p-0 m-0 border-0 d-flex align-items-center"
                                >
                                    <FontAwesomeIcon
                                        icon={faComments}
                                        className="chat-msg-icon"
                                        style={{ fontSize: '1.8rem', color: 'purple' }}
                                    />
                                </Button>
                            )}
                            <UserMenu />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
