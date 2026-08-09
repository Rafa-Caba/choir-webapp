// src/components/themes/AdminThemeList.tsx

import { useEffect, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
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
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import { useThemeStore } from '../../store/admin/useThemeStore';
import { useClientPagination } from '../../hooks/useClientPagination';
import { AdminCardGrid } from '../common/AdminCardGrid';
import { AdminCardPagination } from '../common/AdminCardPagination';
import { AdminListCard } from '../common/AdminListCard';
import { applyThemeToDocument } from '../../utils/applyThemeToDocument';
import type { Theme } from '../../types/theme';

interface SectionHeaderProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
    action?: ReactNode;
}

interface ColorPreviewProps {
    label: string;
    color: string;
}

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

const ColorPreview = ({ label, color }: ColorPreviewProps) => {
    return (
        <Tooltip title={`${label}: ${color}`}>
            <Box
                sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1,
                    backgroundColor: color,
                    border: '1px solid color-mix(in srgb, var(--color-border) 70%, transparent)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.18)',
                    flexShrink: 0,
                }}
            />
        </Tooltip>
    );
};

export const AdminThemeList = () => {
    const {
        themes,
        loading,
        fetchThemes,
        removeTheme,
    } = useThemeStore();

    useEffect(() => {
        void fetchThemes();
    }, [fetchThemes]);

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el tema permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await removeTheme(id);
            Swal.fire('Eliminado', 'El tema ha sido eliminado.', 'success');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo eliminar el tema', 'error');
        }
    };

    const handleApplyPreview = (theme: Theme) => {
        applyThemeToDocument(theme);
        Swal.fire('Vista Previa', 'Se ha aplicado el tema temporalmente a esta sesión.', 'info');
    };

    const {
        page, pageSize, totalPages, totalItems, paginatedItems: paginatedThemes, setPage, setPageSize,
    } = useClientPagination(themes);

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
                title="Temas del Sitio"
                subtitle="Administra paletas visuales, modos claro/oscuro y previsualizaciones del panel."
                icon={<PaletteRoundedIcon />}
                action={
                    <Button
                        component={RouterLink}
                        to="/admin/themes/new"
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        sx={{
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        Nuevo Tema
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
                                Cargando temas...
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                        {themes.length === 0 ? (
                            <Typography sx={{ py: 5, textAlign: 'center', color: 'var(--color-secondary-text)', fontWeight: 800 }}>
                                No hay temas registrados.
                            </Typography>
                        ) : (
                            <AdminCardGrid>
                                {paginatedThemes.map((theme) => (
                                    <AdminListCard
                                        key={theme.id}
                                        title={theme.name}
                                        badges={(
                                            <Chip
                                                size="small"
                                                label={theme.isDark ? '🌙 Oscuro' : '☀️ Claro'}
                                                sx={{ fontWeight: 950, color: theme.isDark ? '#ffffff' : '#111827', backgroundColor: theme.isDark ? '#111827' : '#facc15' }}
                                            />
                                        )}
                                        actions={(
                                            <>
                                                <Tooltip title="Probar tema">
                                                    <IconButton aria-label={`Probar ${theme.name}`} onClick={() => handleApplyPreview(theme)} sx={{ color: 'var(--color-secondary-text)' }}>
                                                        <VisibilityRoundedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar tema">
                                                    <IconButton component={RouterLink} to={`/admin/themes/edit/${theme.id}`} aria-label={`Editar ${theme.name}`} sx={{ color: 'var(--color-primary)' }}>
                                                        <EditRoundedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar tema">
                                                    <IconButton aria-label={`Eliminar ${theme.name}`} onClick={() => handleDelete(theme.id)} sx={{ color: '#dc2626' }}>
                                                        <DeleteRoundedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    >
                                        <Typography sx={{ mb: 0.75, color: 'var(--color-secondary-text)', fontSize: '0.82rem', fontWeight: 800 }}>
                                            Vista previa
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                            <ColorPreview label="Fondo" color={theme.backgroundColor} />
                                            <ColorPreview label="Primario" color={theme.primaryColor} />
                                            <ColorPreview label="Acento" color={theme.accentColor} />
                                            <ColorPreview label="Tarjeta" color={theme.cardColor} />
                                            <ColorPreview label="Texto" color={theme.textColor} />
                                        </Box>
                                    </AdminListCard>
                                ))}
                            </AdminCardGrid>
                        )}
                    </Box>
                )}


                <AdminCardPagination
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    disabled={loading}
                />
            </Paper>
        </Box>
    );
};