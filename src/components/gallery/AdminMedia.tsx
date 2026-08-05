// src/components/gallery/AdminMedia.tsx

import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    IconButton,
    Paper,
    Typography,
} from '@mui/material';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';

import { useAuth } from '../../context/AuthContext';
import { useGalleryStore } from '../../store/admin/useGalleryStore';
import type { GalleryImage } from '../../types/gallery';

export const AdminMedia = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { canManageContent } = useAuth();

    const { getImage, deleteImage, loading } = useGalleryStore();

    const [image, setImage] = useState<GalleryImage | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                if (!id) {
                    return;
                }

                const data = await getImage(id);
                setImage(data);
            } catch {
                Swal.fire('Error', 'No se pudo cargar la imagen.', 'error');
            }
        };

        void fetchImage();
    }, [id, getImage]);

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¡Esta acción no se puede deshacer!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed && id) {
            try {
                await deleteImage(id);
                await Swal.fire('Borrado', 'La imagen ha sido eliminada.', 'success');
                navigate('/admin/gallery');
            } catch {
                Swal.fire('Error', 'No se pudo eliminar la imagen.', 'error');
            }
        }
    };

    const handleDownload = async () => {
        if (!image?.imageUrl) {
            return;
        }

        setDownloading(true);

        try {
            const response = await fetch(image.imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const anchor = document.createElement('a');
            anchor.style.display = 'none';
            anchor.href = url;

            const ext = image.mediaType === 'VIDEO' ? 'mp4' : 'jpg';
            anchor.download = `${image.title.replace(/\s+/g, '_')}.${ext}`;

            document.body.appendChild(anchor);
            anchor.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(anchor);
        } catch {
            window.open(image.imageUrl, '_blank');
        } finally {
            setDownloading(false);
        }
    };

    if (loading || !image) {
        return (
            <Box
                sx={{
                    minHeight: 360,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--color-text)',
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2, fontWeight: 800 }}>
                        Cargando media...
                    </Typography>
                </Box>
            </Box>
        );
    }

    const isVideo = image.mediaType === 'VIDEO';

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
                            md: 'row',
                        },
                        alignItems: {
                            xs: 'center',
                            md: 'center',
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
                                md: 'flex-start',
                            },
                            gap: 1.25,
                            textAlign: {
                                xs: 'center',
                                md: 'left',
                            },
                            minWidth: 0,
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
                            {isVideo ? <MovieRoundedIcon /> : <ImageRoundedIcon />}
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
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                {isVideo ? 'Video:' : 'Imagen:'} {image.title}
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                Haz clic en el contenido para ampliarlo.
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        component={RouterLink}
                        to="/admin/gallery"
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        sx={{
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        Regresar
                    </Button>
                </Box>
            </Paper>

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
                    gap: 2,
                }}
            >
                <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => setShowModal(true)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            setShowModal(true);
                        }
                    }}
                    title="Clic para ampliar"
                    sx={{
                        flex: 1,
                        minHeight: {
                            xs: 280,
                            md: 420,
                        },
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        backgroundColor:
                            'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                        border: '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                        boxShadow: 'inset 0 1px 16px rgba(15, 23, 42, 0.035)',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    {isVideo ? (
                        <Box sx={{ width: '100%', position: 'relative' }}>
                            <Box
                                component="video"
                                src={image.imageUrl}
                                muted
                                sx={{
                                    width: '100%',
                                    maxHeight: {
                                        xs: '58vh',
                                        md: '68vh',
                                    },
                                    objectFit: 'contain',
                                    backgroundColor: '#000000',
                                    display: 'block',
                                    borderRadius: 1.5,
                                }}
                            />

                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'grid',
                                    placeItems: 'center',
                                    pointerEvents: 'none',
                                }}
                            >
                                <Box
                                    sx={{
                                        px: 2,
                                        py: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        borderRadius: 999,
                                        backgroundColor: 'rgba(0, 0, 0, 0.68)',
                                        color: '#ffffff',
                                        fontWeight: 950,
                                    }}
                                >
                                    <OpenInFullRoundedIcon />
                                    Ampliar
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            component="img"
                            src={image.imageUrl}
                            alt={image.title}
                            sx={{
                                width: '100%',
                                maxHeight: {
                                    xs: '58vh',
                                    md: '58vh',
                                },
                                objectFit: 'contain',
                                display: 'block',
                                borderRadius: 1.5,
                                filter: 'drop-shadow(0 16px 32px rgba(15, 23, 42, 0.12))',
                            }}
                        />
                    )}
                </Box>

                {image.description && (
                    <Paper
                        elevation={0}
                        sx={{
                            maxWidth: 900,
                            width: '100%',
                            mx: 'auto',
                            p: 1.5,
                            borderRadius: 1.5,
                            backgroundColor:
                                'color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%)',
                            border: '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                            color: 'var(--color-text)',
                        }}
                    >
                        <Typography sx={{ fontWeight: 800, textAlign: 'left' }}>
                            <Box component="span" sx={{ fontWeight: 950 }}>
                                Descripción:{' '}
                            </Box>
                            {image.description}
                        </Typography>
                    </Paper>
                )}

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: {
                            xs: 'column',
                            sm: 'row',
                        },
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: 1,
                        pb: 0.5,
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={handleDownload}
                        disabled={downloading}
                        startIcon={
                            downloading ? (
                                <CircularProgress size={18} sx={{ color: 'var(--color-button-text)' }} />
                            ) : (
                                <DownloadRoundedIcon />
                            )
                        }
                        sx={{
                            borderRadius: 1.5,
                            px: 2.5,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        {downloading ? 'Descargando...' : 'Descargar'}
                    </Button>

                    {canManageContent && (
                        <>
                            <Button
                                component={RouterLink}
                                to={`/admin/gallery/edit/${image.id}`}
                                variant="contained"
                                startIcon={<EditRoundedIcon />}
                                sx={{
                                    borderRadius: 1.5,
                                    px: 2.5,
                                    py: 0.9,
                                    fontWeight: 950,
                                }}
                            >
                                Editar
                            </Button>

                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteRoundedIcon />}
                                onClick={handleDelete}
                                sx={{
                                    borderRadius: 1.5,
                                    px: 2.5,
                                    py: 0.9,
                                    fontWeight: 950,
                                }}
                            >
                                Borrar
                            </Button>
                        </>
                    )}

                    <Button
                        component={RouterLink}
                        to="/admin/gallery"
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        sx={{
                            borderRadius: 1.5,
                            px: 2.5,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        Regresar
                    </Button>
                </Box>
            </Paper>

            <Dialog
                open={showModal}
                onClose={() => setShowModal(false)}
                fullWidth
                maxWidth="xl"
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: '#000000',
                            color: '#ffffff',
                            borderRadius: {
                                xs: 0,
                                md: 2,
                            },
                            overflow: 'hidden',
                        },
                    },
                }}
            >
                <DialogContent
                    sx={{
                        minHeight: '80vh',
                        p: 0,
                        position: 'relative',
                        display: 'grid',
                        placeItems: 'center',
                        backgroundColor: '#000000',
                    }}
                >
                    <IconButton
                        aria-label="Cerrar vista ampliada"
                        onClick={() => setShowModal(false)}
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            zIndex: 2,
                            color: '#ffffff',
                            backgroundColor: 'rgba(255, 255, 255, 0.18)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.28)',
                            },
                        }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>

                    {isVideo ? (
                        <Box
                            component="video"
                            src={image.imageUrl}
                            controls
                            autoPlay
                            sx={{
                                width: '100%',
                                maxHeight: '90vh',
                                objectFit: 'contain',
                            }}
                        />
                    ) : (
                        <Box
                            component="img"
                            src={image.imageUrl}
                            alt={image.title}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '90vh',
                                objectFit: 'contain',
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};