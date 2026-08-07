// src/components/users/AdminUsersList.tsx

import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { useAuth } from '../../context/AuthContext';
import { useUsersStore } from '../../store/admin/useUsersStore';
import type { User, UserRole } from '../../types/auth';
import { TemporaryPasswordDialog } from './TemporaryPasswordDialog';

interface SectionHeaderProps {
    readonly title: string;
    readonly subtitle: string;
    readonly icon: ReactNode;
    readonly action?: ReactNode;
}

const getRolePresentation = (role: UserRole) => {
    const presentations: Record<UserRole, {
        readonly label: string;
        readonly backgroundColor: string;
        readonly color: string;
    }> = {
        SUPER_ADMIN: { label: 'Super Admin', backgroundColor: '#111827', color: '#ffffff' },
        ADMIN: { label: 'Admin', backgroundColor: '#dc2626', color: '#ffffff' },
        EDITOR: { label: 'Editor', backgroundColor: '#f59e0b', color: '#111827' },
        USER: { label: 'Usuario', backgroundColor: '#2563eb', color: '#ffffff' },
        VIEWER: {
            label: 'Viewer',
            backgroundColor: 'color-mix(in srgb, var(--color-card) 74%, var(--color-border) 26%)',
            color: 'var(--color-text)',
        },
    };

    return presentations[role];
};

const formatDate = (value: string | null | undefined): string => {
    if (!value) {
        return 'Sin acceso';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? 'Sin acceso'
        : new Intl.DateTimeFormat('es-MX', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(date);
};

const SectionHeader = ({ title, subtitle, icon, action }: SectionHeaderProps) => (
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
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{ width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 1.5, color: 'var(--color-button-text)', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}>
                    {icon}
                </Box>
                <Box>
                    <Typography component="h1" sx={{ fontSize: { xs: '1.55rem', md: '2rem' }, fontWeight: 950 }}>
                        {title}
                    </Typography>
                    <Typography sx={{ color: 'var(--color-secondary-text)', fontWeight: 800 }}>
                        {subtitle}
                    </Typography>
                </Box>
            </Box>
            {action}
        </Box>
    </Paper>
);

export const AdminUsersList = () => {
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [temporaryPassword, setTemporaryPassword] = useState('');
    const [temporaryPasswordUser, setTemporaryPasswordUser] = useState('');
    const {
        users,
        currentPage,
        totalPages,
        totalUsers,
        loading,
        mutationUserId,
        fetchUsers,
        deleteUserById,
        changeUserActiveStatus,
        resetUserPasswordAction,
        setCurrentPage,
    } = useUsersStore();

    useEffect(() => {
        void fetchUsers(currentPage);
    }, [currentPage, fetchUsers]);

    const filteredUsers = useMemo(() => {
        const searchValue = searchTerm.trim().toLocaleLowerCase('es-MX');

        if (!searchValue) {
            return users;
        }

        return users.filter((userItem) => (
            userItem.name.toLocaleLowerCase('es-MX').includes(searchValue)
            || userItem.username.toLocaleLowerCase('es-MX').includes(searchValue)
            || userItem.email.toLocaleLowerCase('es-MX').includes(searchValue)
        ));
    }, [searchTerm, users]);

    const handleDelete = async (targetUser: User): Promise<void> => {
        const result = await Swal.fire({
            title: '¿Eliminar usuario?',
            text: `Esta acción eliminará permanentemente a ${targetUser.name}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            heightAuto: false,
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await deleteUserById(targetUser.id);
            await Swal.fire('Eliminado', 'El usuario fue eliminado.', 'success');
        } catch {
            await Swal.fire(
                'No fue posible eliminarlo',
                'Revisa que no sea el último administrador activo del coro.',
                'error',
            );
        }
    };

    const handleStatusChange = async (targetUser: User): Promise<void> => {
        const nextStatus = !targetUser.isActive;
        const verb = nextStatus ? 'reactivar' : 'suspender';
        const result = await Swal.fire({
            title: `¿${nextStatus ? 'Reactivar' : 'Suspender'} usuario?`,
            text: nextStatus
                ? `${targetUser.name} recuperará el acceso al coro.`
                : `${targetUser.name} perderá sus sesiones y acceso activo.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Sí, ${verb}`,
            cancelButtonText: 'Cancelar',
            heightAuto: false,
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await changeUserActiveStatus(targetUser.id, nextStatus);
            await Swal.fire(
                nextStatus ? 'Usuario reactivado' : 'Usuario suspendido',
                nextStatus
                    ? 'El usuario puede iniciar sesión nuevamente.'
                    : 'Sus sesiones activas fueron revocadas.',
                'success',
            );
        } catch {
            await Swal.fire(
                'No fue posible actualizarlo',
                'Revisa que no sea el último administrador activo del coro.',
                'error',
            );
        }
    };

    const handleResetPassword = async (targetUser: User): Promise<void> => {
        const result = await Swal.fire({
            title: 'Restablecer contraseña',
            text: `Se generará una contraseña temporal para ${targetUser.name} y sus sesiones serán revocadas.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Generar contraseña',
            cancelButtonText: 'Cancelar',
            heightAuto: false,
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const response = await resetUserPasswordAction(targetUser.id);
            setTemporaryPasswordUser(targetUser.name);
            setTemporaryPassword(response.temporaryPassword);
        } catch {
            await Swal.fire('Error', 'No se pudo restablecer la contraseña.', 'error');
        }
    };

    return (
        <Box component="section" sx={{ width: '100%', minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <SectionHeader
                title="Gestión de Usuarios"
                subtitle={`${totalUsers} usuario${totalUsers === 1 ? '' : 's'} en el coro activo.`}
                icon={<PeopleRoundedIcon />}
                action={(
                    <Button component={RouterLink} to="/admin/users/new" variant="contained" startIcon={<AddRoundedIcon />} sx={{ borderRadius: 1.5, fontWeight: 950 }}>
                        Nuevo usuario
                    </Button>
                )}
            />

            <Paper elevation={0} sx={{ flex: 1, minHeight: 0, p: { xs: 1.25, md: 2 }, borderRadius: 2, backgroundColor: 'var(--color-card)', border: '1px solid color-mix(in srgb, var(--color-border) 38%, transparent)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                    label="Buscar"
                    placeholder="Nombre, usuario o correo"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                {loading ? (
                    <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: 260 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer sx={{ flex: 1 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Usuario</TableCell>
                                    <TableCell>Rol</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell>Contraseña</TableCell>
                                    <TableCell>Último acceso</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.map((userItem) => {
                                    const role = getRolePresentation(userItem.role);
                                    const busy = mutationUserId === userItem.id;
                                    const isSelf = currentUser?.id === userItem.id;

                                    return (
                                        <TableRow key={userItem.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar src={userItem.imageUrl || undefined}>{userItem.name.slice(0, 1).toUpperCase()}</Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 950 }}>{userItem.name}</Typography>
                                                        <Typography sx={{ color: 'var(--color-secondary-text)', fontSize: '0.82rem' }}>@{userItem.username} · {userItem.email}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" label={role.label} sx={{ fontWeight: 900, backgroundColor: role.backgroundColor, color: role.color }} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" label={userItem.isActive ? 'Activo' : 'Suspendido'} color={userItem.isActive ? 'success' : 'default'} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" label={userItem.mustChangePassword ? 'Cambio pendiente' : 'Configurada'} color={userItem.mustChangePassword ? 'warning' : 'success'} variant="outlined" />
                                            </TableCell>
                                            <TableCell>{formatDate(userItem.lastAccess)}</TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                    <Tooltip title="Editar">
                                                        <span>
                                                            <IconButton component={RouterLink} to={`/admin/users/edit/${userItem.id}`} disabled={busy} aria-label={`Editar ${userItem.name}`}>
                                                                <EditRoundedIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Restablecer contraseña">
                                                        <span>
                                                            <IconButton disabled={busy} onClick={() => { void handleResetPassword(userItem); }} aria-label={`Restablecer contraseña de ${userItem.name}`}>
                                                                <LockResetRoundedIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title={userItem.isActive ? 'Suspender' : 'Reactivar'}>
                                                        <span>
                                                            <IconButton disabled={busy || isSelf} onClick={() => { void handleStatusChange(userItem); }} aria-label={`${userItem.isActive ? 'Suspender' : 'Reactivar'} ${userItem.name}`}>
                                                                {userItem.isActive ? <PauseCircleOutlineRoundedIcon /> : <PlayCircleOutlineRoundedIcon />}
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Eliminar">
                                                        <span>
                                                            <IconButton disabled={busy || isSelf} onClick={() => { void handleDelete(userItem); }} aria-label={`Eliminar ${userItem.name}`} sx={{ color: '#dc2626' }}>
                                                                <DeleteRoundedIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        <Button variant="outlined" disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}>Anterior</Button>
                        <Typography sx={{ fontWeight: 900 }}>Página {currentPage} de {totalPages}</Typography>
                        <Button variant="outlined" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Siguiente</Button>
                    </Box>
                )}
            </Paper>

            <TemporaryPasswordDialog
                open={Boolean(temporaryPassword)}
                password={temporaryPassword}
                title={`Contraseña temporal de ${temporaryPasswordUser}`}
                onClose={() => {
                    setTemporaryPassword('');
                    setTemporaryPasswordUser('');
                }}
            />
        </Box>
    );
};
