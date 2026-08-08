// src/components/public/PublicSiteState.tsx

import { useLayoutEffect } from 'react';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
    applyNeutralThemeToDocument,
    setDocumentBrand,
} from '../../utils/documentBranding';

interface PublicSiteStateProps {
    readonly title: string;
    readonly message: string;
    readonly loading?: boolean;
    readonly actionLabel?: string;
    readonly actionPath?: string;
}

export const PublicSiteState = ({
    title,
    message,
    loading = false,
    actionLabel = 'Acceso administrativo',
    actionPath = '/auth/login',
}: PublicSiteStateProps) => {
    useLayoutEffect(() => {
        applyNeutralThemeToDocument();
        setDocumentBrand('Choirs', null);
    }, []);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                px: 2,
                bgcolor: '#f4f6fb',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: 'min(100%, 560px)',
                    p: { xs: 3, md: 5 },
                    textAlign: 'center',
                    borderRadius: 3,
                    border: '1px solid rgba(15, 23, 42, 0.12)',
                }}
            >
                {loading && <CircularProgress sx={{ mb: 2 }} />}
                <Typography component="h1" variant="h4" sx={{ fontWeight: 900, mb: 1.5 }}>
                    {title}
                </Typography>
                <Typography sx={{ color: 'text.secondary', mb: loading ? 0 : 3 }}>
                    {message}
                </Typography>
                {!loading && actionLabel && actionPath && (
                    <Button component={RouterLink} to={actionPath} variant="contained">
                        {actionLabel}
                    </Button>
                )}
            </Paper>
        </Box>
    );
};
