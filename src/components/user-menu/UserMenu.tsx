// src/components/user-menu/UserMenu.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    Avatar,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
} from '@mui/material';

import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';

import { useThemeStore } from '../../store/admin/useThemeStore';
import { useUsersStore } from '../../store/admin/useUsersStore';
import { ThemeSelectorModal } from './ThemeSelectorModal';
import { applyThemeToDocument } from '../../utils/applyThemeToDocument';
import type { Theme } from '../../types/theme';
import { useAuth } from '../../context/AuthContext';

export const UserMenu = () => {
    const navigate = useNavigate();
    const {
        user,
        updateUser,
        logout,
        isSuperAdmin,
        hasTenantContext,
        returnToPlatform,
    } = useAuth();

    const { updateMyTheme } = useUsersStore();
    const { themes, fetchThemes } = useThemeStore();

    const [showModal, setShowModal] = useState(false);
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

    const menuOpen = Boolean(anchorElement);

    useEffect(() => {
        if (hasTenantContext) {
            void fetchThemes();
        }
    }, [fetchThemes, hasTenantContext]);

    const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElement(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorElement(null);
    };

    const handleNavigate = (path: string) => {
        handleCloseMenu();
        navigate(path);
    };

    const handleOpenPlatformConsole = (): void => {
        handleCloseMenu();
        returnToPlatform();
        navigate('/admin/choirs', { replace: true });
    };

    const handleLogout = () => {
        handleCloseMenu();
        logout();
        navigate('/auth/login');
    };

    const handleOpenThemeModal = () => {
        handleCloseMenu();

        if (!user?.id) {
            Swal.fire('Aviso', 'Usuario no disponible.', 'warning');
            return;
        }

        setShowModal(true);
    };

    const handleSelectTheme = async (theme: Theme) => {
        try {
            if (!theme.id || !user?.id) {
                return;
            }

            const updatedUser = await updateMyTheme(theme.id);

            updateUser(updatedUser);

            applyThemeToDocument(theme);

            setShowModal(false);
            Swal.fire('¡Tema aplicado!', 'Se ha guardado tu preferencia.', 'success');
        } catch (error) {
            console.error('Error applying theme:', error);
            Swal.fire('Error', 'No se pudo guardar el tema. Intenta más tarde.', 'error');
        }
    };

    return (
        <>
            <Tooltip title="Menú de usuario">
                <IconButton
                    id="admin-user-menu-button"
                    aria-controls={menuOpen ? 'admin-user-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={menuOpen ? 'true' : undefined}
                    onClick={handleOpenMenu}
                    sx={{
                        p: 0,
                        // border: '2px solid rgba(255, 255, 255, 0.35)',
                    }}
                >
                    <Avatar
                        src={user?.imageUrl || '/default-avatar.png'}
                        alt="Perfil"
                        sx={{
                            width: 50,
                            height: 50,
                            bgcolor: 'var(--color-primary)',
                            color: 'var(--color-button-text)',
                            fontWeight: 950,
                        }}
                    >
                        {user?.name?.slice(0, 1).toUpperCase() || 'U'}
                    </Avatar>
                </IconButton>
            </Tooltip>

            <Menu
                id="admin-user-menu"
                anchorEl={anchorElement}
                open={menuOpen}
                onClose={handleCloseMenu}
                slotProps={{
                    paper: {
                        sx: {
                            mt: 1,
                            minWidth: 260,
                            borderRadius: 2,
                            backgroundColor: 'var(--color-card)',
                            color: 'var(--color-text)',
                            border: '1px solid color-mix(in srgb, var(--color-border) 42%, transparent)',
                            boxShadow: '0 18px 54px rgba(15, 23, 42, 0.2)',
                            overflow: 'hidden',
                        },
                    },
                }}
            >
                <Typography
                    sx={{
                        px: 2,
                        py: 1.25,
                        fontWeight: 950,
                        color: 'var(--color-text)',
                    }}
                >
                    👋 ¡Hola, {user?.name?.split(' ')[0]}!
                </Typography>

                <Divider sx={{ borderColor: 'color-mix(in srgb, var(--color-border) 36%, transparent)' }} />

                <MenuItem
                    onClick={() => (
                        isSuperAdmin && !hasTenantContext
                            ? handleNavigate('/admin/choirs')
                            : handleNavigate('/admin')
                    )}
                >
                    <ListItemIcon>
                        <DashboardRoundedIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                    </ListItemIcon>
                    <ListItemText primary="Ir a Inicio" />
                </MenuItem>

                <MenuItem onClick={() => handleNavigate('/admin/edit-profile')}>
                    <ListItemIcon>
                        <AccountCircleRoundedIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                    </ListItemIcon>
                    <ListItemText primary="Ajustes de usuario" />
                </MenuItem>

                <MenuItem onClick={() => handleNavigate('/admin/profile')}>
                    <ListItemIcon>
                        <ArticleRoundedIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                    </ListItemIcon>
                    <ListItemText primary="Ver mi perfil" />
                </MenuItem>

                {hasTenantContext && (
                    <MenuItem onClick={handleOpenThemeModal}>
                        <ListItemIcon>
                            <PaletteRoundedIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                        </ListItemIcon>
                        <ListItemText primary="Cambiar tema del admin" />
                    </MenuItem>
                )}

                {isSuperAdmin && (
                    <>
                        {hasTenantContext && (
                            <MenuItem onClick={handleOpenPlatformConsole}>
                                <ListItemIcon>
                                    <DashboardRoundedIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                                </ListItemIcon>
                                <ListItemText primary="Volver a consola de coros" />
                            </MenuItem>
                        )}
                        <MenuItem onClick={() => handleNavigate('/admin/public-test')}>
                            <ListItemIcon>
                                <ScienceRoundedIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                            </ListItemIcon>
                            <ListItemText primary="Entorno de pruebas" />
                        </MenuItem>
                    </>
                )}

                <Divider sx={{ borderColor: 'color-mix(in srgb, var(--color-border) 36%, transparent)' }} />

                <MenuItem onClick={handleLogout} sx={{ color: '#dc2626', fontWeight: 900 }}>
                    <ListItemIcon>
                        <LogoutRoundedIcon fontSize="small" sx={{ color: '#dc2626' }} />
                    </ListItemIcon>
                    <ListItemText primary="Cerrar sesión" />
                </MenuItem>
            </Menu>

            <ThemeSelectorModal
                show={showModal}
                onClose={() => setShowModal(false)}
                themes={themes}
                onSelect={handleSelectTheme}
            />
        </>
    );
};