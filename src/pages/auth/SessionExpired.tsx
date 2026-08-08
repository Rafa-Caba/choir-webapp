// src/pages/auth/SessionExpired.tsx

import { useLayoutEffect } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    Typography,
} from '@mui/material';
import LockClockRoundedIcon from '@mui/icons-material/LockClockRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import {
    applyNeutralThemeToDocument,
    setDocumentBrand,
} from '../../utils/documentBranding';

export const SessionExpired = () => {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code') ?? 'SESSION_REVOKED';
    const messageFromRoute = searchParams.get('message')?.trim() || '';
    const choirUnavailable = code === 'CHOIR_INACTIVE';
    const title = choirUnavailable ? 'Coro no disponible' : 'Sesión expirada';
    const message = messageFromRoute || (
        choirUnavailable
            ? 'El coro asociado a esta sesión ya no está disponible.'
            : 'Tu sesión terminó o fue revocada. Inicia sesión nuevamente para continuar.'
    );
    const StateIcon = choirUnavailable ? GroupsRoundedIcon : LockClockRoundedIcon;

    useLayoutEffect(() => {
        applyNeutralThemeToDocument();
        setDocumentBrand('Choir App', null);
    }, []);

    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                px: 2,
                bgcolor: 'var(--color-background)',
                color: 'var(--color-text)',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: 'min(100%, 580px)',
                    p: { xs: 3, md: 5 },
                    textAlign: 'center',
                    borderRadius: 3,
                    bgcolor: 'var(--color-card)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 18px 52px rgba(15, 23, 42, 0.1)',
                }}
            >
                <Box
                    sx={{
                        width: 76,
                        height: 76,
                        mx: 'auto',
                        mb: 2,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: '50%',
                        color: 'var(--color-primary)',
                        bgcolor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                    }}
                >
                    <StateIcon sx={{ fontSize: 40 }} />
                </Box>

                <Typography component="h1" variant="h4" sx={{ fontWeight: 950 }}>
                    {title}
                </Typography>

                <Typography
                    sx={{
                        mt: 1.5,
                        color: 'var(--color-secondary-text)',
                        fontWeight: 700,
                    }}
                >
                    {message}
                </Typography>

                <Button
                    component={RouterLink}
                    to="/auth/login"
                    variant="contained"
                    sx={{ mt: 3, px: 3, fontWeight: 950 }}
                >
                    Iniciar sesión
                </Button>
            </Paper>
        </Box>
    );
};
