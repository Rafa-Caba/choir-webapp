// src/components/components-admin/DashboardPanel.tsx

import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    Box,
    Button,
    // Chip,
    CircularProgress,
    Divider,
    Paper,
    Typography,
} from '@mui/material';

import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';

import { useAuth } from '../../context/AuthContext';
import { useGalleryStore } from '../../store/admin/useGalleryStore';
import { useThemeStore } from '../../store/admin/useThemeStore';
import { useUsersStore } from '../../store/admin/useUsersStore';

interface StatCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: ReactNode;
    children?: ReactNode;
}

const StatCard = ({ title, value, subtitle, icon, children }: StatCardProps) => {
    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                p: {
                    xs: 1.5,
                    md: 2,
                },
                borderRadius: 2,
                background:
                    'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%) 0%, color-mix(in srgb, var(--color-card) 82%, var(--color-primary) 18%) 100%)',
                border: '1px solid color-mix(in srgb, var(--color-border) 42%, transparent)',
                color: 'var(--color-text)',
                boxShadow:
                    'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 18%, transparent), 0 12px 34px rgba(15, 23, 42, 0.07)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1.25,
                overflow: 'hidden',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: 'color-mix(in srgb, var(--color-primary) 34%, transparent)',
                    boxShadow:
                        'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 22%, transparent), 0 18px 46px rgba(15, 23, 42, 0.12)',
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 1.5,
                }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        component="h2"
                        sx={{
                            mb: 0.5,
                            fontSize: {
                                xs: '0.9rem',
                                md: '0.98rem',
                            },
                            color: 'var(--color-secondary-text)',
                            fontWeight: 900,
                            lineHeight: 1.2,
                            letterSpacing: '0.02em',
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        component="p"
                        sx={{
                            m: 0,
                            fontSize: {
                                xs: '1.75rem',
                                md: '2.15rem',
                            },
                            fontWeight: 950,
                            lineHeight: 1,
                            color: 'var(--color-text)',
                        }}
                    >
                        {value}
                    </Typography>

                    {subtitle && (
                        <Typography
                            component="p"
                            sx={{
                                mt: 0.8,
                                mb: 0,
                                fontSize: '0.82rem',
                                color: 'var(--color-secondary-text)',
                                fontWeight: 700,
                                lineHeight: 1.25,
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                <Box
                    sx={{
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 1.5,
                        color: 'var(--color-button-text)',
                        background:
                            'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                        boxShadow:
                            '0 10px 24px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.24)',
                    }}
                >
                    {icon}
                </Box>
            </Box>

            {children && (
                <>
                    <Divider
                        sx={{
                            borderColor: 'color-mix(in srgb, var(--color-border) 44%, transparent)',
                        }}
                    />

                    <Box
                        sx={{
                            color: 'var(--color-secondary-text)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                        }}
                    >
                        {children}
                    </Box>
                </>
            )}
        </Paper>
    );
};

export const AdminDashboardPanel = () => {
    const navigate = useNavigate();

    const { images, fetchGallery } = useGalleryStore();
    const {
        user,
        choir,
        targetChoir,
        canManageUsers,
        canManageThemes,
        logout,
    } = useAuth();

    const { users, fetchUsers } = useUsersStore();
    const { themes, fetchThemes } = useThemeStore();

    useEffect(() => {
        if (!user) {
            navigate('/auth/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        void fetchGallery();
    }, [fetchGallery]);

    useEffect(() => {
        if (canManageUsers) {
            fetchUsers(1).catch(() => undefined);
        }
    }, [canManageUsers, fetchUsers]);

    useEffect(() => {
        if (canManageThemes) {
            fetchThemes().catch(() => undefined);
        }
    }, [canManageThemes, fetchThemes]);

    const startImage = images.find((image) => image.imageStart);
    const effectiveChoir = targetChoir ?? choir;
    const choirName = effectiveChoir?.name || user?.choirName || 'Sin coro asignado';

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    if (!user) {
        return (
            <Box
                sx={{
                    minHeight: 320,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--color-text)',
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2, fontWeight: 800 }}>
                        Redirigiendo al inicio de sesión...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            component="section"
            sx={{
                width: '100%',
                height: '100%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: {
                    xs: 1.5,
                    md: 2,
                },
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
                pb: {
                    xs: 1,
                    md: 0,
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: {
                        xs: 'column',
                        md: 'row',
                    },
                    alignItems: {
                        xs: 'stretch',
                        md: 'center',
                    },
                    justifyContent: 'space-between',
                    gap: 1.5,
                }}
            >
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    <Typography
                        component="h1"
                        sx={{
                            m: 0,
                            fontSize: {
                                xs: '1.75rem',
                                md: '2.15rem',
                            },
                            fontWeight: 950,
                            lineHeight: 1.1,
                            color: 'var(--color-text)',
                        }}
                    >
                        Panel de Control
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.75,
                            color: 'var(--color-secondary-text)',
                            fontWeight: 800,
                        }}
                    >
                        Panel administrativo.
                    </Typography>
                </Box>

                {/* <Chip
                    label={`Coro actual: ${choirName}`}
                    sx={{
                        alignSelf: {
                            xs: 'center',
                            md: 'auto',
                        },
                        maxWidth: '100%',
                        color: 'var(--color-button-text)',
                        background:
                            'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                        fontWeight: 900,
                        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
                        '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        },
                    }}
                /> */}
            </Box>

            <Box
                sx={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'repeat(2, minmax(0, 1fr))',
                        md: 'repeat(auto-fit, minmax(180px, 1fr))',
                    },
                    gap: {
                        xs: 1.25,
                        md: 2,
                    },
                }}
            >
                {canManageUsers && (
                    <StatCard
                        title="Usuarios"
                        value={users.length}
                        subtitle="Administrables"
                        icon={<PeopleRoundedIcon />}
                    />
                )}

                {canManageThemes && (
                    <StatCard
                        title="Temas"
                        value={themes.length}
                        subtitle="Disponibles"
                        icon={<PaletteRoundedIcon />}
                    />
                )}

                <StatCard
                    title="Imágenes"
                    value={images.length}
                    subtitle="Galería"
                    icon={<CollectionsRoundedIcon />}
                />
            </Box>

            <Paper
                elevation={0}
                sx={{
                    flex: {
                        xs: '0 0 auto',
                        md: 1,
                    },
                    minHeight: {
                        xs: 320,
                        md: 0,
                    },
                    p: {
                        xs: 1.5,
                        md: 2,
                    },
                    borderRadius: 2,
                    background:
                        'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 84%, var(--color-primary) 16%) 0%, color-mix(in srgb, var(--color-card) 74%, transparent) 100%)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 38%, transparent)',
                    color: 'var(--color-text)',
                    boxShadow:
                        'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 16%, transparent), 0 12px 42px rgba(15, 23, 42, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        flex: {
                            xs: '0 0 auto',
                            md: 1,
                        },
                        minHeight: {
                            xs: 260,
                            md: 320,
                        },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1.5,
                        backgroundColor:
                            'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                        // border: '1px dashed color-mix(in srgb, var(--color-border) 38%, transparent)',
                        boxShadow: 'inset 0 1px 18px rgba(15, 23, 42, 0.035)',
                        overflow: 'hidden',
                        p: {
                            xs: 1.5,
                            md: 2,
                        },
                        lineHeight: 0,
                    }}
                >
                    {startImage ? (
                        <Box
                            component="img"
                            src={startImage.imageUrl}
                            alt={startImage.title || 'Imagen de inicio'}
                            sx={{
                                width: 'auto',
                                height: 'auto',
                                maxWidth: '100%',
                                maxHeight: {
                                    xs: 260,
                                    md: '42vh',
                                },
                                objectFit: 'contain',
                                objectPosition: 'center',
                                display: 'block',
                                m: 0,
                                p: 0,
                                verticalAlign: 'middle',
                                borderRadius: 1.5,
                                filter: 'drop-shadow(0 16px 32px rgba(15, 23, 42, 0.08))',
                                flexShrink: 0,
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                minHeight: {
                                    xs: 240,
                                    md: 320,
                                },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                color: 'var(--color-secondary-text)',
                                lineHeight: 1.2,
                            }}
                        >
                            <ImageRoundedIcon sx={{ fontSize: 92 }} />

                            <Typography
                                sx={{
                                    mt: 1.5,
                                    fontWeight: 900,
                                }}
                            >
                                No hay imagen de inicio aún
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.5,
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                }}
                            >
                                Puedes configurarla desde la galería administrativa.
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: {
                            xs: 'column',
                            sm: 'row',
                        },
                        alignItems: {
                            xs: 'stretch',
                            sm: 'center',
                        },
                        justifyContent: 'space-between',
                        gap: 1.5,
                    }}
                >
                    <Typography
                        sx={{
                            color: 'var(--color-secondary-text)',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            textAlign: {
                                xs: 'center',
                                sm: 'left',
                            },
                        }}
                    >
                        Coro actual:{' '}
                        <Box
                            component="span"
                            sx={{
                                color: 'var(--color-text)',
                                fontWeight: 950,
                            }}
                        >
                            {choirName}
                        </Box>
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={handleLogout}
                        endIcon={<LogoutRoundedIcon />}
                        sx={{
                            alignSelf: {
                                xs: 'stretch',
                                sm: 'center',
                            },
                            borderRadius: 1.5,
                            px: 2.5,
                            py: 0.8,
                            fontWeight: 950,
                        }}
                    >
                        Cerrar Sesión
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};