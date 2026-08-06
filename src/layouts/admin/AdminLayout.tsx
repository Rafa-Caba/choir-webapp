// src/layouts/admin/AdminLayout.tsx

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    AppBar,
    Avatar,
    Box,
    Button,
    // BottomNavigation, // Enable again if you want to use the mobile bottom nav
    // BottomNavigationAction, // Enable again if you want to use the mobile bottom nav
    Chip,
    CircularProgress,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';

import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

import { AnnouncementSidebar } from '../../components/announcements/AnnouncementSidebar';
import { UserMenu } from '../../components/user-menu/UserMenu';
import { useAuth } from '../../context/AuthContext';
import { useAdminSettingsStore } from '../../store/admin/useSettingsStore';
import { useGalleryStore } from '../../store/admin/useGalleryStore';
import { formatName } from '../../utils';
import { MuiAppThemeProvider } from '../../theme/mui/MuiAppThemeProvider';

interface AdminNavigationItem {
    label: string;
    path: string;
    icon: ReactNode;
    visible: boolean;
    showInBottomNav: boolean;
}

const drawerWidth = 280;
const collapsedDrawerWidth = 86;
const rightRailWidth = 270;
const headerHeight = 76;
const footerHeight = 58;
// const bottomNavHeight = 74; // Enable again if you want to use the mobile bottom nav

const brandTitleStoragePrefix = 'choir-web:brand-title';
const brandLogoStoragePrefix = 'choir-web:brand-logo';
const defaultFaviconUrl = '/images/erocrasLogo.png';

interface CachedBrand {
    readonly choirId: string | null;
    readonly webTitle: string;
    readonly logoUrl: string;
}

const getTenantBrandStorageKey = (prefix: string, choirId: string): string => (
    `${prefix}:${choirId}`
);

const readLocalStorageValue = (key: string): string => {
    if (typeof window === 'undefined') {
        return '';
    }

    try {
        return window.localStorage.getItem(key) || '';
    } catch {
        return '';
    }
};

const writeLocalStorageValue = (key: string, value: string): void => {
    if (typeof window === 'undefined' || value.trim() === '') {
        return;
    }

    try {
        window.localStorage.setItem(key, value);
    } catch {
        return;
    }
};

const setDocumentFavicon = (href: string): void => {
    if (typeof document === 'undefined' || href.trim() === '') {
        return;
    }

    const existingFavicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;

    if (existingFavicon) {
        existingFavicon.href = href;
        return;
    }

    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = href;
    document.head.appendChild(favicon);
};

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        user,
        choir,
        targetChoir,
        effectiveChoirId,
        viewMode,
        hasTenantContext,
        loading,
        isSuperAdmin,
        canManageUsers,
        canManageContent,
        canManageInstruments,
        canManageMembers,
        canManageSettings,
        canManageSongTypes,
        canManageThemes,
        canViewTenantLogs,
        returnToPlatform,
    } = useAuth();
    const { settings, fetchSettings } = useAdminSettingsStore();
    const { images, fetchGallery } = useGalleryStore();

    const isDesktop = useMediaQuery('(min-width:1200px)');
    const showRightRail = useMediaQuery('(min-width:1400px)');

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [desktopDrawerCollapsed, setDesktopDrawerCollapsed] = useState(false);
    const [cachedBrand, setCachedBrand] = useState<CachedBrand>({
        choirId: null,
        webTitle: '',
        logoUrl: '',
    });

    const isAuthenticated = Boolean(user);
    const activeDrawerWidth = desktopDrawerCollapsed ? collapsedDrawerWidth : drawerWidth;

    const logoImage = images.find((image) => image.imageLogo);
    const realWebTitle = settings?.webTitle?.trim() || '';
    const realLogoUrl = logoImage?.imageUrl?.trim() || '';
    const cachedWebTitle = cachedBrand.choirId === effectiveChoirId
        ? cachedBrand.webTitle
        : '';
    const cachedLogoUrl = cachedBrand.choirId === effectiveChoirId
        ? cachedBrand.logoUrl
        : '';
    const resolvedWebTitle = realWebTitle || cachedWebTitle;
    const resolvedLogoUrl = realLogoUrl || cachedLogoUrl;
    const layoutTitle = isSuperAdmin && !hasTenantContext
        ? 'Choir Platform'
        : resolvedWebTitle || 'Cargando sitio...';
    const layoutLogoFallback = resolvedWebTitle
        ? resolvedWebTitle
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join('')
        : '';

    useEffect(() => {
        if (!effectiveChoirId) {
            setCachedBrand({ choirId: null, webTitle: '', logoUrl: '' });
            return;
        }

        setCachedBrand({
            choirId: effectiveChoirId,
            webTitle: readLocalStorageValue(
                getTenantBrandStorageKey(brandTitleStoragePrefix, effectiveChoirId),
            ),
            logoUrl: readLocalStorageValue(
                getTenantBrandStorageKey(brandLogoStoragePrefix, effectiveChoirId),
            ),
        });
    }, [effectiveChoirId]);

    useEffect(() => {
        document.title = isSuperAdmin && !hasTenantContext
            ? 'Choir Platform'
            : resolvedWebTitle || 'Choir App';
        setDocumentFavicon(resolvedLogoUrl || defaultFaviconUrl);

        if (!effectiveChoirId) {
            return;
        }

        if (realWebTitle && realWebTitle !== cachedWebTitle) {
            writeLocalStorageValue(
                getTenantBrandStorageKey(brandTitleStoragePrefix, effectiveChoirId),
                realWebTitle,
            );
            setCachedBrand((currentBrand) => ({
                choirId: effectiveChoirId,
                webTitle: realWebTitle,
                logoUrl: currentBrand.choirId === effectiveChoirId
                    ? currentBrand.logoUrl
                    : '',
            }));
        }

        if (realLogoUrl && realLogoUrl !== cachedLogoUrl) {
            writeLocalStorageValue(
                getTenantBrandStorageKey(brandLogoStoragePrefix, effectiveChoirId),
                realLogoUrl,
            );
            setCachedBrand((currentBrand) => ({
                choirId: effectiveChoirId,
                webTitle: currentBrand.choirId === effectiveChoirId
                    ? currentBrand.webTitle
                    : '',
                logoUrl: realLogoUrl,
            }));
        }
    }, [
        cachedLogoUrl,
        cachedWebTitle,
        effectiveChoirId,
        hasTenantContext,
        isSuperAdmin,
        realLogoUrl,
        realWebTitle,
        resolvedLogoUrl,
        resolvedWebTitle,
    ]);

    useEffect(() => {
        if (!loading && isAuthenticated && hasTenantContext) {
            void fetchSettings();
            void fetchGallery();
        }
    }, [loading, isAuthenticated, hasTenantContext, fetchSettings, fetchGallery]);

    const effectiveChoir = targetChoir ?? choir;
    const choirCode = effectiveChoir?.code || user?.choirCode || '';
    const choirName = effectiveChoir?.name || user?.choirName || '';
    const choirLabel = hasTenantContext
        ? choirName || choirCode || 'Coro seleccionado'
        : 'Consola de plataforma';

    const navigationItems = useMemo<AdminNavigationItem[]>(() => {
        return [
            {
                label: 'Inicio',
                path: '/admin',
                icon: <DashboardRoundedIcon />,
                visible: hasTenantContext,
                showInBottomNav: true,
            },
            {
                label: 'Coros',
                path: '/admin/choirs',
                icon: <AccountTreeRoundedIcon />,
                visible: isSuperAdmin,
                showInBottomNav: false,
            },
            {
                label: 'Cantos',
                path: '/admin/songs',
                icon: <QueueMusicRoundedIcon />,
                visible: hasTenantContext,
                showInBottomNav: true,
            },
            {
                label: 'Galería',
                path: '/admin/gallery',
                icon: <CollectionsRoundedIcon />,
                visible: hasTenantContext,
                showInBottomNav: true,
            },
            {
                label: 'Blog',
                path: '/admin/blog/view',
                icon: <ArticleRoundedIcon />,
                visible: hasTenantContext,
                showInBottomNav: true,
            },
            {
                label: 'Usuarios',
                path: '/admin/users',
                icon: <PeopleRoundedIcon />,
                visible: hasTenantContext && canManageUsers,
                showInBottomNav: false,
            },
            {
                label: 'Logs del sitio',
                path: '/admin/logs',
                icon: <HistoryRoundedIcon />,
                visible: hasTenantContext && canViewTenantLogs,
                showInBottomNav: false,
            },
            {
                label: 'Instrumentos',
                path: '/admin/instruments',
                icon: <BuildRoundedIcon />,
                visible: hasTenantContext && canManageInstruments,
                showInBottomNav: false,
            },
            {
                label: 'Tipos de Cantos',
                path: '/admin/song-types',
                icon: <CategoryRoundedIcon />,
                visible: hasTenantContext && canManageSongTypes,
                showInBottomNav: false,
            },
            {
                label: 'Miembros',
                path: '/admin/members',
                icon: <GroupsRoundedIcon />,
                visible: hasTenantContext && canManageMembers,
                showInBottomNav: false,
            },
            {
                label: 'Admin Avisos',
                path: '/admin/announcements',
                icon: <CampaignRoundedIcon />,
                visible: hasTenantContext && canManageContent,
                showInBottomNav: false,
            },
            {
                label: 'Admin Blogs',
                path: '/admin/blog',
                icon: <MusicNoteRoundedIcon />,
                visible: hasTenantContext && canManageContent,
                showInBottomNav: false,
            },
            {
                label: 'Ajustes de Página',
                path: '/admin/settings',
                icon: <SettingsRoundedIcon />,
                visible: hasTenantContext && canManageSettings,
                showInBottomNav: false,
            },
            {
                label: 'Temas de Color',
                path: '/admin/themes',
                icon: <PaletteRoundedIcon />,
                visible: hasTenantContext && canManageThemes,
                showInBottomNav: false,
            },
            {
                label: 'Página Pública',
                path: `/${choirCode}?fromAdmin=true`,
                icon: <PublicRoundedIcon />,
                visible: hasTenantContext && Boolean(choirCode),
                showInBottomNav: false,
            },
        ];
    }, [
        canManageContent,
        canManageInstruments,
        canManageMembers,
        canManageSettings,
        canManageSongTypes,
        canManageThemes,
        choirCode,
        hasTenantContext,
        canManageUsers,
        canViewTenantLogs,
        isSuperAdmin,
    ]);

    const visibleNavigationItems = navigationItems.filter((item) => item.visible);

    const isActive = (path: string) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }

        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        setMobileDrawerOpen(false);
    };

    const handleReturnToPlatform = (): void => {
        returnToPlatform();
        navigate('/admin/choirs', { replace: true });
        setMobileDrawerOpen(false);
    };

    const drawerPaperSx = {
        width: isDesktop ? activeDrawerWidth : drawerWidth,
        top: `${headerHeight}px`,
        bottom: isDesktop ? `${footerHeight}px` : 0,
        height: isDesktop
            ? `calc(100vh - ${headerHeight + footerHeight}px)`
            : `calc(100vh - ${headerHeight}px)`,
        background:
            'linear-gradient(180deg, color-mix(in srgb, var(--color-card) 96%, var(--color-primary) 4%) 0%, var(--color-card) 100%)',
        color: 'var(--color-text)',
        borderRight: '1px solid var(--color-border)',
        boxShadow: '0 16px 48px rgba(15, 23, 42, 0.12)',
        overflowX: 'hidden',
        transition: (theme: Theme) =>
            theme.transitions.create(['width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
            }),
    };

    const renderDrawerContent = (collapsed: boolean) => (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            <Toolbar
                sx={{
                    minHeight: '76px !important',
                    px: collapsed ? 1 : 2,
                    gap: 1.5,
                    borderBottom: '1px solid var(--color-border)',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                }}
            >
                <Avatar
                    src={resolvedLogoUrl || undefined}
                    alt={layoutTitle}
                    sx={{
                        width: 46,
                        height: 46,
                        bgcolor: 'var(--color-primary)',
                        color: 'var(--color-button-text)',
                        fontWeight: 800,
                        flexShrink: 0,
                    }}
                >
                    {layoutLogoFallback}
                </Avatar>

                {!collapsed && (
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 900,
                                lineHeight: 1.1,
                                color: 'var(--color-text)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {layoutTitle}
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                color: 'var(--color-secondary-text)',
                                fontWeight: 700,
                            }}
                        >
                            Panel administrativo
                        </Typography>
                    </Box>
                )}

                {!isDesktop && (
                    <IconButton
                        aria-label="Cerrar menú"
                        onClick={() => setMobileDrawerOpen(false)}
                        sx={{ color: 'var(--color-text)' }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                )}
            </Toolbar>

            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    px: collapsed ? 0.75 : 1.25,
                    py: 1.5,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                }}
            >
                <List disablePadding>
                    {visibleNavigationItems.map((item) => {
                        const selected = isActive(item.path);

                        const navigationButton = (
                            <ListItemButton
                                selected={selected}
                                onClick={() => handleNavigate(item.path)}
                                sx={{
                                    mb: 0.6,
                                    borderRadius: 2.5,
                                    minHeight: 48,
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    px: collapsed ? 1 : 2,
                                    color: selected ? 'var(--color-button-text)' : 'var(--color-text)',
                                    backgroundColor: selected ? 'var(--color-button)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: selected
                                            ? 'var(--color-button)'
                                            : 'color-mix(in srgb, var(--color-button) 14%, transparent)',
                                        transform: collapsed ? 'none' : 'translateX(2px)',
                                    },
                                    '&.Mui-selected': {
                                        backgroundColor: 'var(--color-button)',
                                    },
                                    '&.Mui-selected:hover': {
                                        backgroundColor: 'var(--color-button)',
                                    },
                                    transition: 'all 0.18s ease',
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: collapsed ? 0 : 38,
                                        color: selected ? 'var(--color-button-text)' : 'var(--color-primary)',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>

                                {!collapsed && (
                                    <ListItemText
                                        primary={
                                            <Typography
                                                component="span"
                                                sx={{
                                                    fontSize: '0.94rem',
                                                    fontWeight: selected ? 900 : 700,
                                                }}
                                            >
                                                {item.label}
                                            </Typography>
                                        }
                                    />
                                )}
                            </ListItemButton>
                        );

                        if (collapsed) {
                            return (
                                <Tooltip key={item.path} title={item.label} placement="right">
                                    {navigationButton}
                                </Tooltip>
                            );
                        }

                        return <Box key={item.path}>{navigationButton}</Box>;
                    })}
                </List>
            </Box>

            {isDesktop && (
                <Box
                    sx={{
                        borderTop: '1px solid var(--color-border)',
                        p: 1,
                    }}
                >
                    <Tooltip title={desktopDrawerCollapsed ? 'Expandir menú' : 'Colapsar menú'} placement="right">
                        <IconButton
                            aria-label={desktopDrawerCollapsed ? 'Expandir menú' : 'Colapsar menú'}
                            onClick={() => setDesktopDrawerCollapsed((currentValue) => !currentValue)}
                            sx={{
                                width: '100%',
                                borderRadius: 2,
                                color: 'var(--color-primary)',
                                backgroundColor: 'color-mix(in srgb, var(--color-button) 10%, transparent)',
                                '&:hover': {
                                    backgroundColor: 'color-mix(in srgb, var(--color-button) 18%, transparent)',
                                },
                            }}
                        >
                            {desktopDrawerCollapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </Box>
    );

    if (loading) {
        return (
            <MuiAppThemeProvider>
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'grid',
                        placeItems: 'center',
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text)',
                    }}
                >
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 2, fontWeight: 700 }}>
                            Cargando panel...
                        </Typography>
                    </Box>
                </Box>
            </MuiAppThemeProvider>
        );
    }

    if (!user) {
        return <Navigate to="/auth/login" />;
    }

    return (
        <MuiAppThemeProvider>
            <Box
                className="admin-mui-shell"
                sx={{
                    height: '100vh',
                    width: '100%',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    background:
                        'linear-gradient(135deg, color-mix(in srgb, var(--color-background) 94%, var(--color-primary) 6%) 0%, var(--color-background) 55%, color-mix(in srgb, var(--color-background) 92%, var(--color-accent) 8%) 100%)',
                    color: 'var(--color-text)',
                }}
            >
                <AppBar
                    position="fixed"
                    elevation={0}
                    sx={{
                        top: 0,
                        left: 0,
                        right: 0,
                        width: '100%',
                        height: headerHeight,
                        background:
                            'linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 92%, #000 8%) 0%, var(--color-primary) 55%, var(--color-accent) 100%)',
                        color: 'var(--color-button-text)',
                        borderBottom: '1px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
                        boxShadow: '0 10px 32px rgba(15, 23, 42, 0.16)',
                        zIndex: (theme: Theme) => theme.zIndex.drawer + 2,
                    }}
                >
                    <Toolbar sx={{ minHeight: `${headerHeight}px !important`, gap: 1.5 }}>
                        {!isDesktop && (
                            <IconButton
                                aria-label="Abrir menú"
                                onClick={() => setMobileDrawerOpen(true)}
                                sx={{
                                    color: 'var(--color-button-text)',
                                    border: '1px solid color-mix(in srgb, var(--color-button-text) 35%, transparent)',
                                }}
                            >
                                <MenuRoundedIcon />
                            </IconButton>
                        )}

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    alignItems: { xs: 'flex-start', md: 'center' },
                                    gap: { xs: 0.6, md: 1.5 },
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 950,
                                        lineHeight: 1.1,
                                        maxWidth: { xs: '58vw', sm: 'none' },
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {layoutTitle} - Admin
                                </Typography>

                                <Chip
                                    size="small"
                                    label={hasTenantContext
                                        ? `Coro: ${choirLabel}${choirName && choirCode ? ` (${choirCode})` : ''}`
                                        : choirLabel}
                                    sx={{
                                        width: 'fit-content',
                                        maxWidth: { xs: '62vw', md: 'none' },
                                        color: 'var(--color-button-text)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.18)',
                                        border: '1px solid rgba(255, 255, 255, 0.25)',
                                        fontWeight: 800,
                                        '& .MuiChip-label': {
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        },
                                    }}
                                />
                            </Box>
                        </Box>

                        {isSuperAdmin && viewMode === 'tenant' && targetChoir && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ArrowBackRoundedIcon />}
                                onClick={handleReturnToPlatform}
                                sx={{
                                    display: { xs: 'none', md: 'inline-flex' },
                                    color: 'var(--color-button-text)',
                                    borderColor: 'rgba(255, 255, 255, 0.4)',
                                    fontWeight: 900,
                                    '&:hover': {
                                        borderColor: 'rgba(255, 255, 255, 0.72)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                    },
                                }}
                            >
                                Volver a consola
                            </Button>
                        )}

                        <Typography
                            variant="body2"
                            sx={{
                                mt: 0.5,
                                display: { xs: 'none', sm: 'block' },
                                color: 'color-mix(in srgb, var(--color-button-text) 88%, transparent)',
                                fontWeight: 700,
                                fontSize: 22,
                            }}
                        >
                            ¡Hola {formatName(user.name)}!
                        </Typography>

                        {hasTenantContext && (
                            <Tooltip title="Abrir chat grupal">
                                <IconButton
                                    aria-label="Abrir chat grupal"
                                    onClick={() => navigate('/admin/chat-group')}
                                    sx={{
                                        color: 'var(--color-button-text)',
                                        border: '1px solid rgba(255, 255, 255, 0.22)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.18)',
                                        },
                                    }}
                                >
                                    <ChatRoundedIcon />
                                </IconButton>
                            </Tooltip>
                        )}

                        <UserMenu />
                    </Toolbar>
                </AppBar>

                <Box
                    component="nav"
                    aria-label="Navegación administrativa"
                    sx={{ width: { xl: activeDrawerWidth }, flexShrink: { xl: 0 } }}
                >
                    <Drawer
                        variant="temporary"
                        open={mobileDrawerOpen}
                        onClose={() => setMobileDrawerOpen(false)}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        slotProps={{
                            paper: {
                                sx: drawerPaperSx,
                            },
                        }}
                        sx={{
                            display: { xs: 'block', xl: 'none' },
                        }}
                    >
                        {renderDrawerContent(false)}
                    </Drawer>

                    <Drawer
                        variant="permanent"
                        open
                        slotProps={{
                            paper: {
                                sx: drawerPaperSx,
                            },
                        }}
                        sx={{
                            display: { xs: 'none', xl: 'block' },
                        }}
                    >
                        {renderDrawerContent(desktopDrawerCollapsed)}
                    </Drawer>
                </Box>

                {showRightRail && hasTenantContext && (
                    <Box
                        component="aside"
                        aria-label="Avisos administrativos"
                        sx={{
                            position: 'fixed',
                            top: `${headerHeight}px`,
                            right: 0,
                            bottom: `${footerHeight}px`,
                            width: rightRailWidth,
                            height: `calc(100vh - ${headerHeight + footerHeight}px)`,
                            display: { xs: 'none', xl: 'flex' },
                            flexDirection: 'column',
                            p: 2,
                            backgroundColor: 'color-mix(in srgb, var(--color-card) 78%, transparent)',
                            borderLeft: '1px solid var(--color-border)',
                            color: 'var(--color-text)',
                            overflow: 'hidden',
                            zIndex: (theme: Theme) => theme.zIndex.drawer,
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                p: 1,
                                borderRadius: 2,
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: 'var(--color-text)',
                                boxShadow: 'none',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                            }}
                        >
                            <AnnouncementSidebar />
                        </Paper>
                    </Box>
                )}

                <Box
                    component="main"
                    sx={{
                        position: 'fixed',
                        top: `${headerHeight}px`,
                        bottom: {
                            xs: 0,
                            xl: `${footerHeight}px`,
                        },
                        left: {
                            xs: 0,
                            xl: `${activeDrawerWidth}px`,
                        },
                        right: {
                            xs: 0,
                            xl: showRightRail ? `${rightRailWidth}px` : 0,
                        },
                        width: {
                            xs: '100%',
                            xl: showRightRail
                                ? `calc(100% - ${activeDrawerWidth + rightRailWidth}px)`
                                : `calc(100% - ${activeDrawerWidth}px)`,
                        },
                        height: {
                            xs: `calc(100vh - ${headerHeight}px)`,
                            xl: `calc(100vh - ${headerHeight + footerHeight}px)`,
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        px: {
                            xs: 1.5,
                            sm: 2,
                            md: 3,
                            xl: 3,
                        },
                        py: {
                            xs: 2,
                            xl: 2,
                        },
                        pb: {
                            xs: 2,
                            xl: 2,
                        },
                        transition: (theme: Theme) =>
                            theme.transitions.create(['left', 'right', 'width'], {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.standard,
                            }),
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: '1480px',
                            mx: 'auto',
                            flex: 1,
                            minHeight: 0,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                p: {
                                    xs: 1.25,
                                    sm: 2,
                                    md: 3,
                                },
                                borderRadius: {
                                    xs: 2,
                                    md: 2.5,
                                },
                                backgroundColor: 'color-mix(in srgb, var(--color-card) 86%, transparent)',
                                border: '1px solid color-mix(in srgb, var(--color-border) 88%, transparent)',
                                color: 'var(--color-text)',
                                boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)',
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                className="admin-outlet-scroll"
                                sx={{
                                    flex: 1,
                                    minHeight: 0,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    pr: {
                                        xs: 0,
                                        md: 0.5,
                                    },
                                    '& > *': {
                                        flex: 1,
                                        minHeight: 0,
                                    },
                                }}
                            >
                                <Outlet />
                            </Box>
                        </Paper>
                    </Box>
                </Box>

                {/*
                    Enable again if you want to use the mobile bottom nav.

                    {!isDesktop && (
                        <Paper
                            elevation={10}
                            sx={{
                                position: 'fixed',
                                left: 12,
                                right: 12,
                                bottom: 12,
                                zIndex: (theme: Theme) => theme.zIndex.appBar + 1,
                                borderRadius: 2,
                                overflow: 'hidden',
                                backgroundColor: 'var(--color-card)',
                                border: '1px solid var(--color-border)',
                                boxShadow: '0 14px 40px rgba(15, 23, 42, 0.22)',
                            }}
                        >
                            <BottomNavigation
                                value={bottomNavigationValue}
                                onChange={(_event, newValue: string) => handleNavigate(newValue)}
                                showLabels
                                sx={{
                                    height: bottomNavHeight,
                                    backgroundColor: 'var(--color-card)',
                                    '& .MuiBottomNavigationAction-root': {
                                        color: 'var(--color-secondary-text)',
                                        minWidth: 0,
                                        px: 0.5,
                                    },
                                    '& .Mui-selected': {
                                        color: 'var(--color-primary)',
                                    },
                                    '& .MuiBottomNavigationAction-label': {
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                    },
                                }}
                            >
                                {bottomNavigationItems.map((item) => (
                                    <BottomNavigationAction
                                        key={item.path}
                                        label={item.label}
                                        value={item.path}
                                        icon={item.icon}
                                    />
                                ))}
                            </BottomNavigation>
                        </Paper>
                    )}
                */}

                <Box
                    component="footer"
                    sx={{
                        position: 'fixed',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100%',
                        minHeight: footerHeight,
                        px: 3,
                        py: 1.5,
                        display: {
                            xs: 'none',
                            xl: 'flex',
                        },
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-button-text)',
                        borderTop: '1px solid var(--color-border)',
                        zIndex: (theme: Theme) => theme.zIndex.drawer + 1,
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--color-button-text)' }}>
                        Creada por Rafael Cabanillas - 2022
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box
                            component="a"
                            href={settings?.socials.facebook || '/'}
                            sx={{ color: 'var(--color-button-text)', fontSize: 22 }}
                            aria-label="Facebook"
                        >
                            <FontAwesomeIcon icon={['fab', 'facebook']} />
                        </Box>

                        <Box
                            component="a"
                            href={settings?.socials.instagram || '/'}
                            sx={{ color: 'var(--color-button-text)', fontSize: 22 }}
                            aria-label="Instagram"
                        >
                            <FontAwesomeIcon icon={['fab', 'instagram']} />
                        </Box>

                        <Box
                            component="a"
                            href={settings?.socials.youtube || '/'}
                            sx={{ color: 'var(--color-button-text)', fontSize: 22 }}
                            aria-label="YouTube"
                        >
                            <FontAwesomeIcon icon={['fab', 'youtube']} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </MuiAppThemeProvider>
    );
};

export default AdminLayout;