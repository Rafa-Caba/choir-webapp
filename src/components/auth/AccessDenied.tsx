// src/components/auth/AccessDenied.tsx

import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    Typography,
} from '@mui/material';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';

interface AccessDeniedProps {
    readonly title?: string;
    readonly message?: string;
    readonly actionLabel?: string;
    readonly actionPath?: string;
}

export const AccessDenied = ({
    title = 'Acceso denegado',
    message = 'Tu cuenta no tiene permiso para abrir esta sección.',
    actionLabel = 'Volver al inicio',
    actionPath = '/admin',
}: AccessDeniedProps) => (
    <Box
        component="section"
        sx={{
            width: '100%',
            minHeight: 360,
            display: 'grid',
            placeItems: 'center',
            p: { xs: 1.5, md: 3 },
        }}
    >
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                maxWidth: 620,
                p: { xs: 2.5, md: 4 },
                textAlign: 'center',
                borderRadius: 3,
                color: 'var(--color-text)',
                background:
                    'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%) 0%, var(--color-card) 100%)',
                border: '1px solid color-mix(in srgb, var(--color-border) 45%, transparent)',
                boxShadow: '0 18px 52px rgba(15, 23, 42, 0.1)',
            }}
        >
            <Box
                sx={{
                    width: 72,
                    height: 72,
                    mx: 'auto',
                    mb: 2,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    color: '#dc2626',
                    backgroundColor: 'color-mix(in srgb, #dc2626 12%, transparent)',
                }}
            >
                <BlockRoundedIcon sx={{ fontSize: 38 }} />
            </Box>

            <Typography
                component="h1"
                sx={{
                    fontSize: { xs: '1.65rem', md: '2rem' },
                    fontWeight: 950,
                }}
            >
                {title}
            </Typography>

            <Typography
                sx={{
                    mt: 1,
                    color: 'var(--color-secondary-text)',
                    fontWeight: 750,
                }}
            >
                {message}
            </Typography>

            {actionPath && actionLabel && (
                <Button
                    component={RouterLink}
                    to={actionPath}
                    variant="contained"
                    sx={{
                        mt: 3,
                        borderRadius: 1.5,
                        px: 2.5,
                        fontWeight: 950,
                    }}
                >
                    {actionLabel}
                </Button>
            )}
        </Paper>
    </Box>
);
