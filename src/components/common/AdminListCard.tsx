// src/components/common/AdminListCard.tsx

import type { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface AdminListCardProps {
    readonly leading?: ReactNode;
    readonly title: ReactNode;
    readonly subtitle?: ReactNode;
    readonly badges?: ReactNode;
    readonly children?: ReactNode;
    readonly actions?: ReactNode;
    readonly highlighted?: boolean;
}

export const AdminListCard = ({
    leading,
    title,
    subtitle,
    badges,
    children,
    actions,
    highlighted = false,
}: AdminListCardProps) => (
    <Paper
        elevation={0}
        sx={{
            height: '100%',
            minWidth: 0,
            p: { xs: 1.5, sm: 1.75 },
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
            color: 'var(--color-text)',
            background: highlighted
                ? 'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 78%, var(--color-primary) 22%) 0%, color-mix(in srgb, var(--color-card) 88%, var(--color-accent) 12%) 100%)'
                : 'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 92%, var(--color-primary) 8%) 0%, var(--color-card) 100%)',
            border: highlighted
                ? '1px solid color-mix(in srgb, var(--color-primary) 62%, var(--color-border) 38%)'
                : '1px solid color-mix(in srgb, var(--color-border) 42%, transparent)',
            boxShadow: highlighted
                ? '0 14px 34px color-mix(in srgb, var(--color-primary) 16%, transparent)'
                : '0 10px 26px rgba(15, 23, 42, 0.055)',
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, minWidth: 0 }}>
            {leading && <Box sx={{ flexShrink: 0 }}>{leading}</Box>}
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                    component="h2"
                    sx={{
                        fontSize: '1.05rem',
                        lineHeight: 1.2,
                        fontWeight: 950,
                        overflowWrap: 'anywhere',
                    }}
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Box
                        sx={{
                            mt: 0.35,
                            color: 'var(--color-secondary-text)',
                            fontSize: '0.86rem',
                            fontWeight: 750,
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {subtitle}
                    </Box>
                )}
            </Box>
        </Box>

        {badges && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {badges}
            </Box>
        )}

        {children && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {children}
            </Box>
        )}

        {actions && (
            <Box
                sx={{
                    mt: 'auto',
                    pt: 0.5,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 0.75,
                }}
            >
                {actions}
            </Box>
        )}
    </Paper>
);
