// src/pages/public/HomePage.tsx

import { Box, Paper, Typography, useMediaQuery } from '@mui/material';

import '../../assets/styles/layout/_main.scss';
import { MyCarousel } from '../../components/components-public/MyCarousel';
import { useSettingsStore } from '../../store/public/useSettingsStore';

const acronymLabels = [
    'Sabiduría',
    'Adonai',
    'Renuevo del tronco de Jesé',
    'Llave de David',
    'Sol - Resplandor de eterna Luz',
    'Rey de las naciones',
    'Emmanuel',
];

const reservedPublicSegments = ['members', 'songs', 'about', 'contact', 'blog', 'admin', 'auth'];

export const HomePage = () => {
    const isMobile = useMediaQuery('(max-width:768px)');
    const { settings } = useSettingsStore();

    const firstPathSegment = location.pathname.match(/^\/([^/?#]+)/)?.[1] || null;
    const choirKey =
        firstPathSegment && !reservedPublicSegments.includes(firstPathSegment)
            ? firstPathSegment
            : null;

    const publicTitle = `${settings?.webTitle || 'Ero Cras'}`;

    return (
        <Box
            sx={{
                width: '100%',
                minWidth: 0,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    mb: {
                        xs: 1.5,
                        md: 2,
                    },
                    px: {
                        xs: 1,
                        sm: 1.5,
                        md: 2,
                    },
                    py: {
                        xs: 1.25,
                        md: 1.5,
                    },
                    borderRadius: {
                        xs: 1.5,
                        md: 2,
                    },
                    backgroundColor: 'color-mix(in srgb, var(--color-card) 82%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 84%, transparent)',
                    color: 'var(--color-text)',
                    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
                }}
            >
                <Box
                    className="carousel-container acronym-labels"
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: {
                            xs: 0.75,
                            md: 1,
                        },
                    }}
                >
                    <Typography
                        component="h2"
                        sx={{
                            m: 0,
                            fontSize: {
                                xs: '1.45rem',
                                md: '1.9rem',
                            },
                            fontWeight: 950,
                            lineHeight: 1.1,
                            textAlign: 'center',
                            color: 'var(--color-text)',
                        }}
                    >
                        {isMobile ? publicTitle : choirKey === 'eroc1' ? `${publicTitle}: ` : publicTitle}
                    </Typography>

                    {choirKey === 'eroc1' && (
                        !isMobile ? (
                            <Box
                                sx={{
                                    width: '100%',
                                    display: 'flex',
                                    flexWrap: {
                                        md: 'wrap',
                                        lg: 'nowrap',
                                    },
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 0,
                                }}
                            >
                                {acronymLabels.map((item) => (
                                    <Typography
                                        key={item}
                                        component="span"
                                        sx={{
                                            px: 1,
                                            py: 0.5,
                                            fontSize: {
                                                md: '0.9rem',
                                                lg: '0.96rem',
                                            },
                                            fontWeight: 700,
                                            color: 'var(--color-text)',
                                            borderLeft: '2px solid color-mix(in srgb, var(--color-border) 85%, var(--color-primary) 15%)',
                                            '&:last-of-type': {
                                                borderRight: '2px solid color-mix(in srgb, var(--color-border) 85%, var(--color-primary) 15%)',
                                            },
                                            whiteSpace: {
                                                md: 'normal',
                                                lg: 'nowrap',
                                            },
                                            textAlign: 'center',
                                        }}
                                    >
                                        {item}
                                    </Typography>
                                ))}
                            </Box>
                        ) : (
                            <Typography
                                component="p"
                                sx={{
                                    m: 0,
                                    px: 1.5,
                                    py: 0.5,
                                    borderLeft: '2px solid color-mix(in srgb, var(--color-border) 85%, var(--color-primary) 15%)',
                                    borderRight: '2px solid color-mix(in srgb, var(--color-border) 85%, var(--color-primary) 15%)',
                                    fontSize: '0.92rem',
                                    fontWeight: 800,
                                    color: 'var(--color-secondary-text)',
                                    textAlign: 'center',
                                }}
                            >
                                E · R · O · C · R · A · S
                            </Typography>
                        )
                    )}
                </Box>
            </Paper>

            <MyCarousel />
        </Box>
    );
};