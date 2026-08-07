// src/components/public/PublicSiteState.tsx

import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface PublicSiteStateProps {
    readonly title: string;
    readonly message: string;
    readonly loading?: boolean;
}

export const PublicSiteState = ({
    title,
    message,
    loading = false,
}: PublicSiteStateProps) => (
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
            {!loading && (
                <Button component={RouterLink} to="/auth/login" variant="contained">
                    Acceso administrativo
                </Button>
            )}
        </Paper>
    </Box>
);
