// src/components/public/PublicResourceNotice.tsx

import { Box, CircularProgress, Paper, Typography } from '@mui/material';

interface PublicResourceNoticeProps {
    readonly loading?: boolean;
    readonly loadingMessage?: string;
    readonly errorMessage?: string | null;
    readonly emptyMessage?: string;
}

export const PublicResourceNotice = ({
    loading = false,
    loadingMessage = 'Cargando contenido...',
    errorMessage = null,
    emptyMessage,
}: PublicResourceNoticeProps) => {
    if (loading) {
        return (
            <Box sx={{ minHeight: 240, display: 'grid', placeItems: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2, fontWeight: 800 }}>
                        {loadingMessage}
                    </Typography>
                </Box>
            </Box>
        );
    }

    const message = errorMessage ?? emptyMessage;

    if (!message) {
        return null;
    }

    return (
        <Paper
            elevation={0}
            sx={{
                minHeight: 180,
                display: 'grid',
                placeItems: 'center',
                p: 3,
                textAlign: 'center',
                border: '1px solid var(--color-border)',
                bgcolor: 'var(--color-card)',
                color: 'var(--color-text)',
            }}
        >
            <Typography sx={{ fontWeight: 850 }}>{message}</Typography>
        </Paper>
    );
};
