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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import { useChoirsStore } from '../../store/admin/useChoirsStore';
import { useAuth } from '../../context/AuthContext';
import { getSelectedChoirLandingRoute } from '../../routing/adminNavigation';
import type { Choir } from '../../types/choir';

export const AdminChoirList = () => {
    const navigate = useNavigate();
    const { enterTenantContext } = useAuth();
    const {
        choirs,
        currentPage,
        totalPages,
        loading,
        fetchChoirs,
        deleteChoirById,
        setCurrentPage,
    } = useChoirsStore();

    const safeChoirs = choirs ?? [];

    useEffect(() => {
        void fetchChoirs(currentPage);
    }, [currentPage, fetchChoirs]);

    const handleDelete = async (id: string) => {
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
            Swal.fire('Coro desactivado', 'El coro ya no está disponible para operaciones tenant.', 'success');
        } catch {
            Swal.fire('Error', 'No se pudo desactivar el coro.', 'error');
        }
    };

    const handleEnterChoir = (choir: Choir): void => {
        try {
            enterTenantContext(choir);
            navigate(getSelectedChoirLandingRoute(), { replace: true });
        } catch {
            Swal.fire(
                'Coro no disponible',
                'Solo puedes administrar coros activos.',
                'warning',
            );
        }
    };

    return (
        <Box
            component="section"
            sx={{
                width: '100%',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: {
                        xs: 1.5,
                        md: 2,
                    },
                    borderRadius: 2,
                    background:
                        'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%) 0%, color-mix(in srgb, var(--color-card) 78%, transparent) 100%)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 38%, transparent)',
                    boxShadow:
                        'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 14%, transparent), 0 12px 38px rgba(15, 23, 42, 0.06)',
                    color: 'var(--color-text)',
                }}
            >
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
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            textAlign: {
                                xs: 'center',
                                sm: 'left',
                            },
                            justifyContent: {
                                xs: 'center',
                                sm: 'flex-start',
                            },
                        }}
                    >
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
                                boxShadow:
                                    '0 10px 24px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.24)',
                            }}
                        >
                            <GroupsRoundedIcon />
                        </Box>

                        <Box>
                            <Typography
                                component="h1"
                                sx={{
                                    m: 0,
                                    fontSize: {
                                        xs: '1.55rem',
                                        md: '2rem',
                                    },
                                    fontWeight: 950,
                                    lineHeight: 1.1,
                                }}
                            >
                                Gestión de Coros
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                Administra los coros configurados en la plataforma.
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        component={RouterLink}
                        to="/admin/choirs/new"
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        sx={{
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        Nuevo Coro
                    </Button>
                </Box>
            </Paper>

            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    background:
                        'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 86%, var(--color-primary) 14%) 0%, color-mix(in srgb, var(--color-card) 76%, transparent) 100%)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 38%, transparent)',
                    boxShadow:
                        'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 14%, transparent), 0 12px 42px rgba(15, 23, 42, 0.06)',
                    color: 'var(--color-text)',
                    overflow: 'hidden',
                }}
            >
                {loading ? (
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 320,
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress />
                            <Typography sx={{ mt: 2, fontWeight: 800 }}>
                                Cargando coros...
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <TableContainer
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflow: 'auto',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                        }}
                    >
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {['Logo', 'Nombre', 'Código', 'Estado', 'Acciones'].map((label) => (
                                        <TableCell
                                            key={label}
                                            align={label === 'Acciones' ? 'right' : 'left'}
                                            sx={{
                                                width: label === 'Logo' ? 92 : 'auto',
                                                backgroundColor:
                                                    'color-mix(in srgb, var(--color-card) 82%, var(--color-primary) 18%)',
                                                color: 'var(--color-text)',
                                                fontWeight: 950,
                                                borderBottom:
                                                    '1px solid color-mix(in srgb, var(--color-border) 42%, transparent)',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {safeChoirs.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            sx={{
                                                py: 5,
                                                textAlign: 'center',
                                                color: 'var(--color-secondary-text)',
                                                fontWeight: 800,
                                                borderBottom: 'none',
                                            }}
                                        >
                                            No se encontraron coros.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    safeChoirs.map((choir) => (
                                        <TableRow
                                            key={choir.id}
                                            hover
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor:
                                                        'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                                                },
                                            }}
                                        >
                                            <TableCell
                                                sx={{
                                                    borderBottom:
                                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                }}
                                            >
                                                <Avatar
                                                    src={choir.logoUrl || undefined}
                                                    alt={choir.name}
                                                    sx={{
                                                        width: 46,
                                                        height: 46,
                                                        bgcolor: 'var(--color-primary)',
                                                        color: 'var(--color-button-text)',
                                                        fontWeight: 950,
                                                        boxShadow:
                                                            '0 8px 20px rgba(15, 23, 42, 0.12)',
                                                    }}
                                                >
                                                    {choir.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    color: 'var(--color-text)',
                                                    fontWeight: 950,
                                                    borderBottom:
                                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                }}
                                            >
                                                {choir.name}
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    borderBottom:
                                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                }}
                                            >
                                                <Box
                                                    component="code"
                                                    sx={{
                                                        px: 1,
                                                        py: 0.45,
                                                        borderRadius: 1,
                                                        backgroundColor:
                                                            'color-mix(in srgb, var(--color-card) 84%, var(--color-primary) 16%)',
                                                        color: 'var(--color-text)',
                                                        fontWeight: 900,
                                                    }}
                                                >
                                                    {choir.code}
                                                </Box>
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    borderBottom:
                                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                }}
                                            >
                                                <Chip
                                                    size="small"
                                                    label={choir.isActive ? 'Activo' : 'Inactivo'}
                                                    sx={{
                                                        color: choir.isActive
                                                            ? '#ffffff'
                                                            : 'var(--color-text)',
                                                        backgroundColor: choir.isActive
                                                            ? '#16a34a'
                                                            : 'color-mix(in srgb, var(--color-card) 74%, var(--color-border) 26%)',
                                                        fontWeight: 950,
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell
                                                align="right"
                                                sx={{
                                                    borderBottom:
                                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                        gap: 0.75,
                                                    }}
                                                >
                                                    <Tooltip title={choir.isActive ? 'Administrar este coro' : 'El coro está inactivo'}>
                                                        <span>
                                                            <IconButton
                                                                aria-label={`Administrar ${choir.name}`}
                                                                disabled={!choir.isActive}
                                                                onClick={() => handleEnterChoir(choir)}
                                                                sx={{
                                                                    color: 'var(--color-button-text)',
                                                                    backgroundColor: 'var(--color-primary)',
                                                                    '&:hover': {
                                                                        backgroundColor: 'var(--color-accent)',
                                                                    },
                                                                }}
                                                            >
                                                                <LoginRoundedIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>

                                                    <Tooltip title="Ver detalles del coro">
                                                        <IconButton
                                                            component={RouterLink}
                                                            to={`/admin/choirs/view/${choir.id}`}
                                                            aria-label={`Ver coro ${choir.name}`}
                                                            sx={{
                                                                color: 'var(--color-primary)',
                                                                backgroundColor:
                                                                    'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                                                                '&:hover': {
                                                                    backgroundColor:
                                                                        'color-mix(in srgb, var(--color-primary) 18%, transparent)',
                                                                },
                                                            }}
                                                        >
                                                            <VisibilityRoundedIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Editar coro">
                                                        <IconButton
                                                            component={RouterLink}
                                                            to={`/admin/choirs/edit/${choir.id}`}
                                                            aria-label={`Editar ${choir.name}`}
                                                            sx={{
                                                                color: 'var(--color-primary)',
                                                                backgroundColor:
                                                                    'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                                                                '&:hover': {
                                                                    backgroundColor:
                                                                        'color-mix(in srgb, var(--color-primary) 18%, transparent)',
                                                                },
                                                            }}
                                                        >
                                                            <EditRoundedIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title={choir.isActive ? 'Desactivar coro' : 'El coro ya está inactivo'}>
                                                        <span>
                                                            <IconButton
                                                                aria-label={`Desactivar ${choir.name}`}
                                                                disabled={!choir.isActive}
                                                                onClick={() => handleDelete(choir.id)}
                                                                sx={{
                                                                    color: '#dc2626',
                                                                    backgroundColor:
                                                                        'color-mix(in srgb, #dc2626 10%, transparent)',
                                                                    '&:hover': {
                                                                        backgroundColor:
                                                                            'color-mix(in srgb, #dc2626 18%, transparent)',
                                                                    },
                                                                }}
                                                            >
                                                                <DeleteRoundedIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {totalPages > 1 && (
                    <Box
                        sx={{
                            flexShrink: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.5,
                        }}
                    >
                        <Button
                            variant="outlined"
                            disabled={currentPage === 1}
                            startIcon={<ChevronLeftRoundedIcon />}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            sx={{
                                borderRadius: 1.5,
                                fontWeight: 950,
                            }}
                        >
                            Anterior
                        </Button>

                        <Typography sx={{ fontWeight: 900 }}>
                            Página {currentPage} de {totalPages}
                        </Typography>

                        <Button
                            variant="outlined"
                            disabled={currentPage === totalPages}
                            endIcon={<ChevronRightRoundedIcon />}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            sx={{
                                borderRadius: 1.5,
                                fontWeight: 950,
                            }}
                        >
                            Siguiente
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};