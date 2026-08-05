// src/components/gallery/AdminGallery.tsx

import { useEffect, useState, type ReactNode } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Typography,
} from '@mui/material';

import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

import { useAuth } from '../../context/AuthContext';
import { useGalleryStore } from '../../store/admin/useGalleryStore';

interface SectionHeaderProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
    action?: ReactNode;
}

interface GalleryFlagOption {
    key: string;
    label: string;
}

const SectionHeader = ({ title, subtitle, icon, action }: SectionHeaderProps) => {
    return (
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
                        }}
                    >
                        {icon}
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

export const AdminGallery = () => {
    const [searchParams] = useSearchParams();

    const [loadingLocal, setLoadingLocal] = useState(true);
    const { user, canManageContent } = useAuth();

    const {
        images,
        fetchGallery,
        updateFlags,
        loading,
    } = useGalleryStore();

    useEffect(() => {
        const fetchImages = async () => {
            try {
                await fetchGallery();
            } catch {
                Swal.fire('Error', 'No se pudieron cargar las imágenes', 'error');
            } finally {
                setLoadingLocal(false);
            }
        };

        void fetchImages();
    }, [fetchGallery, searchParams]);

    const showFlagOptions = async (imageId: string, alreadyInGallery: boolean) => {
        const fields: GalleryFlagOption[] = [
            { key: 'imageStart', label: 'Imagen de Inicio' },
            { key: 'imageLeftMenu', label: 'Menú Izquierdo' },
            { key: 'imageRightMenu', label: 'Menú Derecho' },
            { key: 'imageUs', label: 'Sección Nosotros' },
            { key: 'imageLogo', label: 'Logo' },
            { key: 'imageGallery', label: alreadyInGallery ? 'Quitar de Galería' : 'Agregar a Galería' },
        ];

        const formHtml = fields
            .map(
                (field) => `
                    <div style="display:flex; align-items:center; gap:8px; margin:8px 0; text-align:left;">
                        <input type="checkbox" id="${field.key}" name="field" value="${field.key}" />
                        <label for="${field.key}">${field.label}</label>
                    </div>
                `,
            )
            .join('');

        const { value: selected, isConfirmed } = await Swal.fire({
            title: 'Selecciona los campos',
            html: formHtml,
            focusConfirm: false,
            preConfirm: () => {
                const inputs = document.querySelectorAll<HTMLInputElement>('input[name="field"]:checked');
                const selectedValues = Array.from(inputs).map((input) => input.value);

                if (selectedValues.length === 0) {
                    Swal.showValidationMessage('Selecciona al menos una opción');
                }

                return selectedValues;
            },
            confirmButtonText: 'Guardar',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
        });

        if (!isConfirmed || !selected) {
            return;
        }

        try {
            const flagsUpdate: Record<string, boolean> = {};

            selected.forEach((key: string) => {
                if (key === 'imageGallery') {
                    flagsUpdate[key] = !alreadyInGallery;
                    return;
                }

                flagsUpdate[key] = true;
            });

            await updateFlags(imageId, flagsUpdate);
            await fetchGallery();

            Swal.fire('Actualizado', 'Los campos fueron marcados correctamente', 'success');
        } catch {
            Swal.fire('Error', 'No se pudo actualizar la imagen', 'error');
        }
    };

    const isLoading = loadingLocal || loading;
    const choirName = user?.choirName || '';

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
            <SectionHeader
                title={`Galería ${choirName}`}
                subtitle="Administra imágenes, logos, menús laterales y medios públicos."
                icon={<CollectionsRoundedIcon />}
                action={
                    canManageContent ? (
                        <Button
                            component={RouterLink}
                            to="/admin/gallery/new"
                            variant="contained"
                            startIcon={<AddPhotoAlternateRoundedIcon />}
                            sx={{
                                borderRadius: 1.5,
                                px: 2,
                                py: 0.9,
                                fontWeight: 950,
                            }}
                        >
                            Nueva Imagen
                        </Button>
                    ) : null
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
                {isLoading ? (
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
                                Cargando galería...
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            pr: {
                                xs: 0,
                                md: 0.5,
                            },
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                        }}
                    >
                        {images.length === 0 ? (
                            <Box
                                sx={{
                                    minHeight: 320,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    color: 'var(--color-secondary-text)',
                                }}
                            >
                                <ImageRoundedIcon sx={{ fontSize: 90 }} />

                                <Typography sx={{ mt: 1.5, fontWeight: 950 }}>
                                    No hay imágenes todavía
                                </Typography>

                                <Typography sx={{ mt: 0.5, fontWeight: 700 }}>
                                    Puedes agregar una nueva imagen desde el botón superior.
                                </Typography>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, minmax(0, 1fr))',
                                        lg: 'repeat(3, minmax(0, 1fr))',
                                        xl: 'repeat(4, minmax(0, 1fr))',
                                    },
                                    gap: {
                                        xs: 1.5,
                                        md: 2,
                                    },
                                }}
                            >
                                {images.map((image) => (
                                    <Paper
                                        key={image.id}
                                        elevation={0}
                                        sx={{
                                            p: 1.25,
                                            borderRadius: 2,
                                            backgroundColor:
                                                'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                            border:
                                                '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                            boxShadow:
                                                'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 12%, transparent), 0 10px 28px rgba(15, 23, 42, 0.05)',
                                            color: 'var(--color-text)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1.25,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Box
                                            component={RouterLink}
                                            to={`/admin/gallery/media/${image.id}`}
                                            sx={{
                                                display: 'block',
                                                borderRadius: 1.5,
                                                overflow: 'hidden',
                                                backgroundColor:
                                                    'color-mix(in srgb, var(--color-card) 84%, var(--color-primary) 16%)',
                                                border:
                                                    '1px solid color-mix(in srgb, var(--color-border) 28%, transparent)',
                                                boxShadow: 'inset 0 1px 16px rgba(15, 23, 42, 0.035)',
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={image.imageUrl}
                                                alt={image.title}
                                                sx={{
                                                    width: '100%',
                                                    height: 200,
                                                    objectFit: 'cover',
                                                    display: 'block',
                                                    transition: 'transform 0.2s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.04)',
                                                    },
                                                }}
                                            />
                                        </Box>

                                        <Typography
                                            sx={{
                                                m: 0,
                                                textAlign: 'center',
                                                fontWeight: 950,
                                                color: 'var(--color-text)',
                                                overflowWrap: 'anywhere',
                                            }}
                                        >
                                            {image.title}
                                        </Typography>

                                        {canManageContent && (
                                            <>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<SettingsRoundedIcon />}
                                                    onClick={() => showFlagOptions(image.id, Boolean(image.imageGallery))}
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        fontWeight: 950,
                                                    }}
                                                >
                                                    Opciones de Imagen
                                                </Button>

                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        justifyContent: 'center',
                                                        gap: 0.6,
                                                    }}
                                                >
                                                    {image.imageStart && <Chip size="small" label="Inicio" color="primary" />}
                                                    {image.imageLeftMenu && <Chip size="small" label="Menú Izq" />}
                                                    {image.imageRightMenu && <Chip size="small" label="Menú Der" color="info" />}
                                                    {image.imageUs && <Chip size="small" label="Nosotros" color="warning" />}
                                                    {image.imageLogo && <Chip size="small" label="Logo" color="success" />}
                                                    {image.imageGallery && <Chip size="small" label="Galería" color="secondary" />}
                                                </Box>
                                            </>
                                        )}
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};