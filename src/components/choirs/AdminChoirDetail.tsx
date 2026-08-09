// src/components/choirs/AdminChoirDetail.tsx

import { useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import { useChoirsStore } from '../../store/admin/useChoirsStore';
import { useAuth } from '../../context/AuthContext';
import { getEnteredChoirLandingRoute } from '../../routing/adminNavigation';
import { buildPlatformChoirUsersRoute } from '../../routing';
import { useTargetChoirStore } from '../../store/platform/useTargetChoirStore';

const formatDate = (value: string | undefined): string => {
    if (!value) {
        return 'No disponible';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'No disponible';
    }

    return new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
};

export const AdminChoirDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { enterTenantContext } = useAuth();
    const selectPlatformChoir = useTargetChoirStore((state) => state.selectChoir);
    const {
        selectedChoir,
        fetchChoir,
    } = useChoirsStore();

    useEffect(() => {
        if (id) {
            void fetchChoir(id);
        }
    }, [fetchChoir, id]);

    if (!id) {
        return (
            <Typography sx={{ fontWeight: 850 }}>
                No se recibió un identificador de coro válido.
            </Typography>
        );
    }

    if (!selectedChoir || selectedChoir.id !== id) {
        return (
            <Box
                sx={{
                    minHeight: 360,
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <CircularProgress aria-label="Cargando información del coro" />
            </Box>
        );
    }

    const handleEnterTenantContext = (): void => {
        enterTenantContext(selectedChoir);
        navigate(getEnteredChoirLandingRoute(), { replace: true });
    };

    const handleManageUsers = (): void => {
        selectPlatformChoir(selectedChoir);
        navigate(buildPlatformChoirUsersRoute(selectedChoir.id));
    };

    return (
        <Box
            component="section"
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 2,
                    color: 'var(--color-text)',
                    background:
                        'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%) 0%, var(--color-card) 100%)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 38%, transparent)',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'stretch', md: 'center' },
                        justifyContent: 'space-between',
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                display: 'grid',
                                placeItems: 'center',
                                borderRadius: 1.5,
                                color: 'var(--color-button-text)',
                                background:
                                    'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                            }}
                        >
                            <GroupsRoundedIcon />
                        </Box>

                        <Box>
                            <Typography
                                component="h1"
                                sx={{
                                    fontSize: { xs: '1.55rem', md: '2rem' },
                                    fontWeight: 950,
                                }}
                            >
                                {selectedChoir.name}
                            </Typography>
                            <Typography
                                sx={{
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                }}
                            >
                                Detalle de plataforma. Entra al contexto para administrar sus recursos.
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 1,
                        }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackRoundedIcon />}
                            onClick={() => navigate('/admin/choirs')}
                            sx={{ borderRadius: 1.5, fontWeight: 950 }}
                        >
                            Volver
                        </Button>
                        <Button
                            component={RouterLink}
                            to={`/admin/choirs/edit/${selectedChoir.id}`}
                            variant="outlined"
                            startIcon={<EditRoundedIcon />}
                            sx={{ borderRadius: 1.5, fontWeight: 950 }}
                        >
                            Editar
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<PeopleRoundedIcon />}
                            disabled={!selectedChoir.isActive}
                            onClick={handleManageUsers}
                            sx={{ borderRadius: 1.5, fontWeight: 950 }}
                        >
                            Usuarios
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<LoginRoundedIcon />}
                            disabled={!selectedChoir.isActive}
                            onClick={handleEnterTenantContext}
                            sx={{ borderRadius: 1.5, fontWeight: 950 }}
                        >
                            Entrar al coro
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 3 },
                    borderRadius: 2,
                    color: 'var(--color-text)',
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 38%, transparent)',
                }}
            >
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' },
                        gap: { xs: 2, md: 3 },
                    }}
                >
                    <Box sx={{ display: 'grid', placeItems: 'center' }}>
                        <Avatar
                            src={selectedChoir.logoUrl || undefined}
                            alt={selectedChoir.name}
                            sx={{
                                width: 160,
                                height: 160,
                                bgcolor: 'var(--color-primary)',
                                color: 'var(--color-button-text)',
                                fontSize: '3rem',
                                fontWeight: 950,
                            }}
                        >
                            {selectedChoir.name.charAt(0).toUpperCase()}
                        </Avatar>
                    </Box>

                    <Box sx={{ display: 'grid', gap: 1.5 }}>
                        <Box>
                            <Typography sx={{ fontWeight: 950 }}>Estado</Typography>
                            <Chip
                                size="small"
                                label={selectedChoir.isActive ? 'Activo' : 'Inactivo'}
                                sx={{
                                    mt: 0.5,
                                    color: selectedChoir.isActive ? '#ffffff' : 'var(--color-text)',
                                    backgroundColor: selectedChoir.isActive
                                        ? '#16a34a'
                                        : 'color-mix(in srgb, var(--color-card) 72%, var(--color-border) 28%)',
                                    fontWeight: 950,
                                }}
                            />
                        </Box>

                        <Box>
                            <Typography sx={{ fontWeight: 950 }}>Código público</Typography>
                            <Typography component="code" sx={{ fontWeight: 850 }}>
                                {selectedChoir.code}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ fontWeight: 950 }}>Descripción</Typography>
                            <Typography sx={{ color: 'var(--color-secondary-text)', fontWeight: 700 }}>
                                {selectedChoir.description || 'Sin descripción registrada.'}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                                gap: 1.5,
                            }}
                        >
                            <Box>
                                <Typography sx={{ fontWeight: 950 }}>Creado</Typography>
                                <Typography sx={{ color: 'var(--color-secondary-text)' }}>
                                    {formatDate(selectedChoir.createdAt)}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 950 }}>Actualizado</Typography>
                                <Typography sx={{ color: 'var(--color-secondary-text)' }}>
                                    {formatDate(selectedChoir.updatedAt)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};
