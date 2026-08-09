// src/components/auth/PlatformChoirTargetGuard.tsx

import { useEffect, useState, type JSX } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getChoirById } from '../../services/admin/choirs';
import { useTargetChoirStore } from '../../store/platform/useTargetChoirStore';
import { AccessDenied } from './AccessDenied';

type TargetLoadState = 'idle' | 'loading' | 'ready' | 'not-found' | 'inactive';

interface PlatformChoirTargetGuardProps {
    readonly children: JSX.Element;
}

export const PlatformChoirTargetGuard = ({ children }: PlatformChoirTargetGuardProps) => {
    const { choirId } = useParams<{ choirId: string }>();
    const {
        isSuperAdmin,
        targetChoir,
        viewMode,
    } = useAuth();
    const selectChoir = useTargetChoirStore((state) => state.selectChoir);
    const [loadState, setLoadState] = useState<TargetLoadState>('idle');

    useEffect(() => {
        if (!isSuperAdmin || viewMode !== 'platform' || !choirId) {
            return;
        }

        if (targetChoir?.id === choirId) {
            setLoadState(targetChoir.isActive ? 'ready' : 'inactive');
            return;
        }

        let active = true;
        setLoadState('loading');

        const loadTargetChoir = async (): Promise<void> => {
            try {
                const choir = await getChoirById(choirId);

                if (!active) {
                    return;
                }

                if (!choir.isActive) {
                    setLoadState('inactive');
                    return;
                }

                selectChoir(choir);
                setLoadState('ready');
            } catch {
                if (active) {
                    setLoadState('not-found');
                }
            }
        };

        void loadTargetChoir();

        return () => {
            active = false;
        };
    }, [choirId, isSuperAdmin, selectChoir, targetChoir, viewMode]);

    if (!isSuperAdmin) {
        return (
            <AccessDenied
                title="Acceso exclusivo de plataforma"
                message="Esta sección solo está disponible para administradores de plataforma."
                actionPath="/admin"
            />
        );
    }

    if (!choirId) {
        return (
            <AccessDenied
                title="Coro no especificado"
                message="Selecciona un coro desde la consola de plataforma antes de administrar sus usuarios."
                actionLabel="Ir a la consola de coros"
                actionPath="/admin/choirs"
            />
        );
    }

    if (viewMode !== 'platform' || loadState === 'idle' || loadState === 'loading') {
        return (
            <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center' }}>
                <CircularProgress aria-label="Preparando usuarios del coro" />
            </Box>
        );
    }

    if (loadState === 'inactive') {
        return (
            <AccessDenied
                title="Coro no disponible"
                message="El coro seleccionado está inactivo. Actívalo antes de administrar sus usuarios."
                actionLabel="Volver a coros"
                actionPath="/admin/choirs"
            />
        );
    }

    if (loadState === 'not-found' || targetChoir?.id !== choirId) {
        return (
            <AccessDenied
                title="Coro no encontrado"
                message="No fue posible resolver el coro solicitado dentro de la plataforma."
                actionLabel="Volver a coros"
                actionPath="/admin/choirs"
            />
        );
    }

    return children;
};
