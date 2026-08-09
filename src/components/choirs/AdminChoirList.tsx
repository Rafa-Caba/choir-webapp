// src/components/choirs/AdminChoirList.tsx

import { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Tooltip,
    Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import { buildPlatformChoirUsersRoute } from '../../routing';
import { getEnteredChoirLandingRoute } from '../../routing/adminNavigation';
import { useAuth } from '../../context/AuthContext';
import { useChoirsStore } from '../../store/admin/useChoirsStore';
import { useTargetChoirStore } from '../../store/platform/useTargetChoirStore';
import type { Choir } from '../../types/choir';
import { AdminCardGrid } from '../common/AdminCardGrid';
import { AdminCardPagination } from '../common/AdminCardPagination';
import { AdminListCard } from '../common/AdminListCard';

export const AdminChoirList = () => {
    const navigate = useNavigate();
    const { enterTenantContext, targetChoir } = useAuth();
    const selectPlatformChoir = useTargetChoirStore((state) => state.selectChoir);
    const {
        choirs,
        currentPage,
        totalPages,
        totalChoirs,
        pageSize,
        loading,
        fetchChoirs,
        deleteChoirById,
        setCurrentPage,
        setPageSize,
    } = useChoirsStore();

    const safeChoirs = choirs ?? [];

    useEffect(() => {
        void fetchChoirs(currentPage, pageSize);
    }, [currentPage, pageSize, fetchChoirs]);

    const handleDelete = async (id: string): Promise<void> => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'El coro quedará inactivo y ya no podrá usarse como contexto administrativo.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, desactivar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await deleteChoirById(id);
            await Swal.fire('Coro desactivado', 'El coro ya no está disponible para operaciones tenant.', 'success');
        } catch {
            await Swal.fire('Error', 'No se pudo desactivar el coro.', 'error');
        }
    };

    const handleEnterChoir = (choir: Choir): void => {
        try {
            enterTenantContext(choir);
            navigate(getEnteredChoirLandingRoute(), { replace: true });
        } catch {
            void Swal.fire('Coro no disponible', 'Solo puedes administrar coros activos.', 'warning');
        }
    };

    const handleManageUsers = (choir: Choir): void => {
        try {
            selectPlatformChoir(choir);
            navigate(buildPlatformChoirUsersRoute(choir.id));
        } catch {
            void Swal.fire('Coro no disponible', 'Activa el coro antes de administrar sus usuarios.', 'warning');
        }
    };

    return (
        <Box component="section" sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%) 0%, color-mix(in srgb, var(--color-card) 78%, transparent) 100%)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 38%, transparent)',
                    color: 'var(--color-text)',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1.25, textAlign: { xs: 'center', sm: 'left' } }}>
                        <Box sx={{ width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 1.5, color: 'var(--color-button-text)', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
                            <GroupsRoundedIcon />
                        </Box>
                        <Box>
                            <Typography component="h1" sx={{ fontSize: { xs: '1.55rem', md: '2rem' }, fontWeight: 950, lineHeight: 1.1 }}>
                                Gestión de Coros
                            </Typography>
                            <Typography sx={{ mt: 0.4, color: 'var(--color-secondary-text)', fontWeight: 800, fontSize: '0.9rem' }}>
                                Administra los coros configurados en la plataforma.
                            </Typography>
                        </Box>
                    </Box>
                    <Button component={RouterLink} to="/admin/choirs/new" variant="contained" startIcon={<AddRoundedIcon />} sx={{ borderRadius: 1.5, px: 2, py: 0.9, fontWeight: 950 }}>
                        Nuevo Coro
                    </Button>
                </Box>
            </Paper>

            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: 0,
                    p: { xs: 1.25, md: 2 },
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 86%, var(--color-primary) 14%) 0%, color-mix(in srgb, var(--color-card) 76%, transparent) 100%)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 38%, transparent)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    overflow: 'hidden',
                }}
            >
                {loading ? (
                    <Box sx={{ flex: 1, minHeight: 320, display: 'grid', placeItems: 'center' }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress />
                            <Typography sx={{ mt: 2, fontWeight: 800 }}>Cargando coros...</Typography>
                        </Box>
                    </Box>
                ) : safeChoirs.length === 0 ? (
                    <Typography sx={{ py: 5, textAlign: 'center', color: 'var(--color-secondary-text)', fontWeight: 800 }}>
                        No se encontraron coros.
                    </Typography>
                ) : (
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                        <AdminCardGrid>
                            {safeChoirs.map((choir) => (
                                <AdminListCard
                                    key={choir.id}
                                    highlighted={targetChoir?.id === choir.id}
                                    leading={(
                                        <Avatar src={choir.logoUrl || undefined} alt={choir.name} sx={{ width: 66, height: 66, bgcolor: 'var(--color-primary)', fontWeight: 950 }}>
                                            {choir.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                    )}
                                    title={choir.name}
                                    subtitle={<>Código: <Box component="code" sx={{ fontWeight: 900 }}>{choir.code}</Box></>}
                                    badges={(
                                        <>
                                            <Chip size="small" label={choir.isActive ? 'Activo' : 'Inactivo'} color={choir.isActive ? 'success' : 'default'} sx={{ fontWeight: 950 }} />
                                            {targetChoir?.id === choir.id && <Chip size="small" label="Seleccionado" variant="outlined" sx={{ fontWeight: 950 }} />}
                                        </>
                                    )}
                                    actions={(
                                        <>
                                            <Tooltip title={choir.isActive ? 'Entrar al admin del coro' : 'El coro está inactivo'}>
                                                <span>
                                                    <Button size="small" variant="contained" startIcon={<LoginRoundedIcon />} disabled={!choir.isActive} onClick={() => handleEnterChoir(choir)} sx={{ borderRadius: 1.5, fontWeight: 950 }}>
                                                        Entrar
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title={choir.isActive ? 'Administrar usuarios del coro' : 'El coro está inactivo'}>
                                                <span>
                                                    <Button size="small" variant="outlined" startIcon={<PeopleRoundedIcon />} disabled={!choir.isActive} onClick={() => handleManageUsers(choir)} sx={{ borderRadius: 1.5, fontWeight: 950 }}>
                                                        Usuarios
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Ver detalles del coro">
                                                <IconButton component={RouterLink} to={`/admin/choirs/view/${choir.id}`} aria-label={`Ver coro ${choir.name}`} sx={{ color: 'var(--color-primary)' }}>
                                                    <VisibilityRoundedIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Editar coro">
                                                <IconButton component={RouterLink} to={`/admin/choirs/edit/${choir.id}`} aria-label={`Editar ${choir.name}`} sx={{ color: 'var(--color-primary)' }}>
                                                    <EditRoundedIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={choir.isActive ? 'Desactivar coro' : 'El coro ya está inactivo'}>
                                                <span>
                                                    <IconButton aria-label={`Desactivar ${choir.name}`} disabled={!choir.isActive} onClick={() => { void handleDelete(choir.id); }} sx={{ color: '#dc2626' }}>
                                                        <DeleteRoundedIcon />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </>
                                    )}
                                >
                                    {choir.description && (
                                        <Typography sx={{ color: 'var(--color-secondary-text)', fontSize: '0.88rem', fontWeight: 750 }}>
                                            {choir.description}
                                        </Typography>
                                    )}
                                </AdminListCard>
                            ))}
                        </AdminCardGrid>
                    </Box>
                )}

                <AdminCardPagination
                    page={currentPage}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    totalItems={totalChoirs}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    disabled={loading}
                />
            </Paper>
        </Box>
    );
};
