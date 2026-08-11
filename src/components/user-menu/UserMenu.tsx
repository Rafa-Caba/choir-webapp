// src/components/user-menu/UserMenu.tsx

import { useEffect, useMemo, useState } from 'react';
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
import { getAdminSettings } from '../../services/admin/settings';
import {
    readThemePreference,
    removeThemePreference,
    writeThemePreference,
} from '../../storage/themePreferenceStorage';
import { readChoirTheme, writeChoirTheme } from '../../storage/choirThemeStorage';
import { writeActiveAdminThemeSnapshot } from '../../storage/adminThemeRuntimeStorage';
import {
    applyChoirThemeToDocument,
    applyDefaultChoirThemeToDocument,
} from '../../utils/choirThemeDocument';
import { resolvePersonalThemeId } from '../../theme/themeHierarchy';
import type { Theme } from '../../types/theme';
import { useAuth } from '../../context/AuthContext';

export const UserMenu = () => {
    const navigate = useNavigate();
    const {
        user,
        choir,
        targetChoir,
        effectiveChoirId,
        logout,
        isSuperAdmin,
        hasTenantContext,
        returnToPlatform,
        updateUser,
    } = useAuth();

    const { updateMyTheme } = useUsersStore();
    const { themes, fetchThemes } = useThemeStore();
    const effectiveChoirCode = targetChoir?.code ?? choir?.code ?? user?.choirCode ?? '';
    const personalThemeId = resolvePersonalThemeId(user?.themeId);
    const cachedGlobalTheme = useMemo(
        () => effectiveChoirCode ? readChoirTheme(effectiveChoirCode) : null,
        [effectiveChoirCode],
    );

    const [showModal, setShowModal] = useState(false);
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
    const [globalThemeName, setGlobalThemeName] = useState(cachedGlobalTheme?.name ?? '');

    const menuOpen = Boolean(anchorElement);
    const canUsePersonalTheme = Boolean(
        user
        && user.role !== 'SUPER_ADMIN'
        && hasTenantContext
        && effectiveChoirId
        && effectiveChoirCode,
    );

    useEffect(() => {
        if (canUsePersonalTheme) {
            void fetchThemes();
        }
    }, [canUsePersonalTheme, fetchThemes]);

    useEffect(() => {
        setGlobalThemeName(cachedGlobalTheme?.name ?? '');
    }, [cachedGlobalTheme?.name]);

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
        void logout();
    };

    const handleOpenThemeModal = async (): Promise<void> => {
        handleCloseMenu();

        if (!canUsePersonalTheme) {
            Swal.fire(
                'Aviso',
                'El tema personal está disponible únicamente para usuarios pertenecientes a un coro.',
                'info',
            );
            return;
        }

        try {
            const settings = await getAdminSettings();

            if (settings.activeTheme) {
                writeChoirTheme(effectiveChoirCode, settings.activeTheme);
                setGlobalThemeName(settings.activeTheme.name);
            }
        } catch {
            // The modal can still use the cached global theme and the available theme list.
        }

        setShowModal(true);
    };

    const handleSelectTheme = async (theme: Theme): Promise<void> => {
        if (!user?.id || !effectiveChoirId || !effectiveChoirCode || isSuperAdmin) {
            return;
        }

        try {
            const updatedUser = await updateMyTheme(theme.id);

            updateUser(updatedUser);
            writeThemePreference(effectiveChoirId, user.id, theme);
            applyChoirThemeToDocument(theme, effectiveChoirCode);
            writeActiveAdminThemeSnapshot({
                choirCode: effectiveChoirCode,
                userId: user.id,
                source: 'personal',
                theme,
            });

            setShowModal(false);
            Swal.fire(
                '¡Tema personal aplicado!',
                'Este tema se usará en tu consola Admin. La página pública conserva el tema global del coro.',
                'success',
            );
        } catch (error) {
            console.error('Error applying personal theme:', error);
            Swal.fire('Error', 'No se pudo guardar tu tema personal.', 'error');
        }
    };

    const handleUseGlobalTheme = async (): Promise<void> => {
        if (!user?.id || !effectiveChoirId || !effectiveChoirCode || isSuperAdmin) {
            return;
        }

        try {
            const updatedUser = await updateMyTheme(null);
            updateUser(updatedUser);
            removeThemePreference(effectiveChoirId, user.id);

            let globalTheme = readChoirTheme(effectiveChoirCode);

            if (!globalTheme) {
                const settings = await getAdminSettings();
                globalTheme = settings.activeTheme;

                if (globalTheme) {
                    writeChoirTheme(effectiveChoirCode, globalTheme);
                }
            }

            if (globalTheme) {
                applyChoirThemeToDocument(globalTheme, effectiveChoirCode);
                writeActiveAdminThemeSnapshot({
                    choirCode: effectiveChoirCode,
                    userId: null,
                    source: 'global',
                    theme: globalTheme,
                });
                setGlobalThemeName(globalTheme.name);
            } else {
                applyDefaultChoirThemeToDocument(effectiveChoirCode);
            }

            setShowModal(false);
            Swal.fire(
                'Tema personal desactivado',
                'Tu consola volverá a seguir automáticamente el tema global del coro.',
                'success',
            );
        } catch (error) {
            console.error('Error restoring global choir theme:', error);
            Swal.fire('Error', 'No se pudo restaurar el tema global del coro.', 'error');
        }
    };

    const selectedPersonalTheme = personalThemeId
        ? themes.find((theme) => theme.id === personalThemeId)
            ?? (effectiveChoirId && user?.id ? readThemePreference(effectiveChoirId, user.id) : null)
        : null;

    return (
        <>
            <Tooltip title="Menú de usuario">
                <IconButton
                    id="admin-user-menu-button"
                    aria-controls={menuOpen ? 'admin-user-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={menuOpen ? 'true' : undefined}
                    onClick={handleOpenMenu}
                    sx={{ p: 0 }}
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

                {canUsePersonalTheme && (
                    <MenuItem onClick={() => void handleOpenThemeModal()}>
                        <ListItemIcon>
                            <PaletteRoundedIcon fontSize="small" sx={{ color: 'var(--color-primary)' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Tema personal"
                            secondary={selectedPersonalTheme?.name || 'Usando tema global del coro'}
                        />
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
                selectedThemeId={personalThemeId}
                globalThemeName={globalThemeName}
                onUseGlobalTheme={handleUseGlobalTheme}
                onSelect={handleSelectTheme}
            />
        </>
    );
};
