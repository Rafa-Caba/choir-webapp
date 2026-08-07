// src/pages/public/Home.tsx

import { Box, Paper, Typography } from '@mui/material';
import '../../assets/styles/layout/_main.scss';
import { MyCarousel } from '../../components/components-public/MyCarousel';
import { usePublicGlobal } from '../../context/PublicGlobalContext';
import { useSettingsStore } from '../../store/public/useSettingsStore';

export const HomePage = () => {
    const { choirCode, choir } = usePublicGlobal();
    const settings = useSettingsStore((state) => (
        state.loadedChoirCode === choirCode ? state.settings : null
    ));

    const publicTitle = settings?.webTitle?.trim() || choir?.name || 'Coro';
    const principalLegend = settings?.homeLegends.principal?.trim() || '';
    const secondaryLegend = settings?.homeLegends.secondary?.trim() || choir?.description || '';

    return (
        <Box sx={{ width: '100%', minWidth: 0 }}>
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    mb: { xs: 1.5, md: 2 },
                    px: { xs: 1, sm: 1.5, md: 2 },
                    py: { xs: 1.25, md: 1.5 },
                    borderRadius: { xs: 1.5, md: 2 },
                    backgroundColor: 'color-mix(in srgb, var(--color-card) 82%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 84%, transparent)',
                    color: 'var(--color-text)',
                    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
                }}
            >
                <Box
                    className="carousel-container"
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.75,
                    }}
                >
                    <Typography
                        component="h1"
                        sx={{
                            m: 0,
                            fontSize: { xs: '1.45rem', md: '1.9rem' },
                            fontWeight: 950,
                            lineHeight: 1.1,
                            textAlign: 'center',
                            color: 'var(--color-text)',
                        }}
                    >
                        {publicTitle}
                    </Typography>

                    {principalLegend && (
                        <Typography
                            sx={{
                                fontSize: { xs: '0.96rem', md: '1.08rem' },
                                fontWeight: 850,
                                textAlign: 'center',
                                color: 'var(--color-primary)',
                            }}
                        >
                            {principalLegend}
                        </Typography>
                    )}

                    {secondaryLegend && (
                        <Typography
                            sx={{
                                maxWidth: 900,
                                fontSize: { xs: '0.88rem', md: '0.98rem' },
                                fontWeight: 650,
                                textAlign: 'center',
                                color: 'var(--color-secondary-text)',
                            }}
                        >
                            {secondaryLegend}
                        </Typography>
                    )}
                </Box>
            </Paper>

            <MyCarousel />
        </Box>
    );
};
