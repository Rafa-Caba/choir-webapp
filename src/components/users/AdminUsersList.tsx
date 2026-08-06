// src/components/users/AdminUsersList.tsx

import { useEffect, useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { useUsersStore } from '../../store/admin/useUsersStore';
import type { UserRole } from '../../types/auth';

interface SectionHeaderProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
    action?: ReactNode;
}

const getRoleChipColor = (role: UserRole) => {
    if (role === 'SUPER_ADMIN') {
        return {
            label: 'Super Admin',
            backgroundColor: '#111827',
            color: '#ffffff',
        };
    }

    if (role === 'ADMIN') {
        return {
            label: 'Admin',
            backgroundColor: '#dc2626',
            color: '#ffffff',
        };
    }

    if (role === 'EDITOR') {
        return {
            label: 'Editor',
            backgroundColor: '#f59e0b',
            color: '#111827',
        };
    }

    if (role === 'USER') {
        return {
            label: 'Usuario',
            backgroundColor: '#2563eb',
            color: '#ffffff',
        };
    }

    return {
        label: 'Viewer',
        backgroundColor: 'color-mix(in srgb, var(--color-card) 74%, var(--color-border) 26%)',
        color: 'var(--color-text)',
    };
};

const SectionHeader = ({ title, subtitle, icon, action }: SectionHeaderProps) => {
    return (
        <Paper
            elevation={0}
            sx={{
                flexShrink: 0,
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
                overflow: 'hidden',
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
                        justifyContent: {
                            xs: 'center',
                            sm: 'flex-start',
                        },
                        gap: 1.25,
                        textAlign: {
                            xs: 'center',
                            sm: 'left',
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
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
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
                            {title}
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.4,
                                color: 'var(--color-secondary-text)',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                            }}
                        >
                            {subtitle}
                        </Typography>
                    </Box>
                </Box>

                {action}
            </Box>
        </Paper>
    );
};

export const AdminUsersList = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const {
        users,
        currentPage,
        totalPages,
        loading,
        fetchUsers,
        deleteUserById,
        setCurrentPage,
    } = useUsersStore();

    useEffect(() => {
        void fetchUsers(currentPage);
    }, [currentPage, fetchUsers]);

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará al usuario permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await deleteUserById(id);
            Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
        } catch {
            Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
        }
    };

    const filteredUsers = users.filter((userItem) => {
        const searchValue = searchTerm.toLowerCase();

        return (
            userItem.name.toLowerCase().includes(searchValue) ||
            userItem.username.toLowerCase().includes(searchValue) ||
            userItem.email.toLowerCase().includes(searchValue)
        );
    });

    return (
        <Box
            component="section"
            sx={{
                width: '100%',
                minHeight: 0,
                height: '100%',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                overflow: 'hidden',
            }}
        >
            <SectionHeader
                title="Gestión de Usuarios"
                subtitle="Administra perfiles, roles, instrumentos y accesos del coro."
                icon={<PeopleRoundedIcon />}
                action={
                    <Button
                        component={RouterLink}
                        to="/admin/users/new"
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        sx={{
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        Nuevo Usuario
                    </Button>
                }
            />

            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: 0,
                    p: {
                        xs: 1.25,
                        md: 2,
                    },
                    borderRadius: 2,
                    background:
                        'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 86%, var(--color-primary) 14%) 0%, color-mix(in srgb, var(--color-card) 76%, transparent) 100%)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 38%, transparent)',
                    boxShadow:
                        'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 14%, transparent), 0 12px 42px rgba(15, 23, 42, 0.06)',
                    color: 'var(--color-text)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                }}
            >
                <TextField
                    type="text"
                    label="Buscar"
                    placeholder="Buscar por nombre, usuario o correo..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon sx={{ color: 'var(--color-primary)' }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

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
                                Cargando usuarios...
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <TableContainer
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflow: 'auto',
                            borderRadius: 1.5,
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
                                    {['Avatar', 'Nombre', 'Usuario', 'Rol', 'Instrumento', 'Acciones'].map((label) => (
                                        <TableCell
                                            key={label}
                                            align={label === 'Acciones' ? 'right' : 'left'}
                                            sx={{
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
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            sx={{
                                                py: 5,
                                                textAlign: 'center',
                                                color: 'var(--color-secondary-text)',
                                                fontWeight: 800,
                                                borderBottom: 'none',
                                            }}
                                        >
                                            No se encontraron usuarios.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((userItem) => {
                                        const roleChip = getRoleChipColor(userItem.role);

                                        return (
                                            <TableRow
                                                key={userItem.id}
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
                                                        width: 86,
                                                        borderBottom:
                                                            '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                    }}
                                                >
                                                    <Avatar
                                                        src={userItem.imageUrl || '/default-avatar.png'}
                                                        alt={userItem.username}
                                                        sx={{
                                                            width: 50,
                                                            height: 50,
                                                            bgcolor: 'var(--color-primary)',
                                                            color: 'var(--color-button-text)',
                                                            fontWeight: 900,
                                                            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
                                                        }}
                                                    >
                                                        {userItem.name?.slice(0, 1).toUpperCase() || 'U'}
                                                    </Avatar>
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: 'var(--color-text)',
                                                        fontWeight: 950,
                                                        borderBottom:
                                                            '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                        minWidth: 190,
                                                    }}
                                                >
                                                    {userItem.name}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: 'var(--color-secondary-text)',
                                                        fontWeight: 850,
                                                        borderBottom:
                                                            '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                        minWidth: 160,
                                                    }}
                                                >
                                                    @{userItem.username}
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        borderBottom:
                                                            '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                    }}
                                                >
                                                    <Chip
                                                        size="small"
                                                        label={roleChip.label}
                                                        sx={{
                                                            fontWeight: 950,
                                                            backgroundColor: roleChip.backgroundColor,
                                                            color: roleChip.color,
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        color: 'var(--color-text)',
                                                        fontWeight: 800,
                                                        borderBottom:
                                                            '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                        minWidth: 150,
                                                    }}
                                                >
                                                    {userItem.instrumentLabel || userItem.instrument || '-'}
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
                                                        <Tooltip title="Editar usuario">
                                                            <IconButton
                                                                component={RouterLink}
                                                                to={`/admin/users/edit/${userItem.id}`}
                                                                aria-label={`Editar ${userItem.name}`}
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

                                                        <Tooltip title="Eliminar usuario">
                                                            <IconButton
                                                                aria-label={`Eliminar ${userItem.name}`}
                                                                onClick={() => handleDelete(userItem.id)}
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
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
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
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Button
                            variant="outlined"
                            disabled={currentPage === 1}
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