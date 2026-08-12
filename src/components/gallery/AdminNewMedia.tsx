// src/components/gallery/AdminNewMedia.tsx

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    Box,
    Button,
    CircularProgress,
    Paper,
    TextField,
    Typography,
} from '@mui/material';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { useGalleryStore } from '../../store/admin/useGalleryStore';
import type { CreateGalleryPayload } from '../../types';

export const AdminNewMedia = () => {
    const { uploadImage } = useGalleryStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<CreateGalleryPayload>({
        title: '',
        description: '',
        imageGallery: true,
        file: undefined,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        setFormData((previousValue) => ({
            ...previousValue,
            [name]: value,
        }));
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            setPreviewUrl(null);
            setSelectedFileName('');
            setFormData((previousValue) => ({
                ...previousValue,
                file: undefined,
            }));
            return;
        }

        setFormData((previousValue) => ({
            ...previousValue,
            file,
        }));

        setSelectedFileName(file.name);

        const reader = new FileReader();

        reader.onloadend = () => {
            const result = reader.result;

            if (typeof result === 'string') {
                setPreviewUrl(result);
            }
        };

        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!formData.title || !formData.file) {
            Swal.fire('Campos requeridos', 'Llena todos los campos obligatorios', 'warning');
            return;
        }

        setLoading(true);

        try {
            await uploadImage(formData);

            Swal.fire('¡Éxito!', 'Imagen subida correctamente', 'success');
            navigate('/admin/gallery');
        } catch {
            Swal.fire('Error', 'No se pudo subir la imagen', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            component="section"
            sx={{
                width: '100%',
                height: '100%',
                minHeight: 0,
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
                    flexShrink: 0,
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
                            <ImageRoundedIcon />
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
                                Nueva Imagen
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                Sube una imagen para usarla en galería, inicio, logo o menús.
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => navigate('/admin/gallery')}
                        disabled={loading}
                        sx={{
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        Volver
                    </Button>
                </Box>
            </Paper>

            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: 0,
                    p: {
                        xs: 1,
                        sm: 1.25,
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
                }}
            >
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        maxWidth: 760,
                        mx: 'auto',
                        height: '100%',
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: {
                            xs: 1.5,
                            md: 2,
                        },
                        p: '0 !important',
                        m: '0 auto !important',
                        backgroundColor: 'transparent !important',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        pr: {
                            xs: 0.5,
                            sm: 0.75,
                        },
                        pb: 1,
                        scrollbarGutter: 'stable',
                    }}
                >
                    <TextField
                        type="text"
                        name="title"
                        label="Título"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Título de la imagen"
                        disabled={loading}
                        required
                    />

                    <TextField
                        name="description"
                        label="Descripción"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Breve descripción"
                        disabled={loading}
                        multiline
                        minRows={3}
                    />

                    {previewUrl && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                backgroundColor:
                                    'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                border: '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                textAlign: 'center',
                            }}
                        >
                            <Typography
                                sx={{
                                    mb: 1,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                }}
                            >
                                Previsualización
                            </Typography>

                            <Box
                                component="img"
                                src={previewUrl}
                                alt="Previsualización"
                                sx={{
                                    width: '100%',
                                    maxHeight: 260,
                                    objectFit: 'contain',
                                    borderRadius: 1.5,
                                    display: 'block',
                                }}
                            />
                        </Paper>
                    )}

                    <Paper
                        elevation={0}
                        sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            backgroundColor:
                                'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                            border: '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                            boxShadow: 'inset 0 1px 16px rgba(15, 23, 42, 0.035)',
                        }}
                    >
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUploadRoundedIcon />}
                            disabled={loading}
                            sx={{
                                width: '100%',
                                borderRadius: 1.5,
                                py: 0.9,
                                fontWeight: 950,
                            }}
                        >
                            {selectedFileName || 'Seleccionar archivo de imagen'}
                            <input hidden type="file" accept="image/*" onChange={handleFileChange} />
                        </Button>

                        <Typography
                            sx={{
                                mt: 0.75,
                                color: 'var(--color-secondary-text)',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                textAlign: 'center',
                            }}
                        >
                            El archivo es obligatorio para crear una nueva imagen.
                        </Typography>
                    </Paper>

                    <Box
                        sx={{
                            mt: 'auto',
                            display: 'flex',
                            flexDirection: {
                                xs: 'column-reverse',
                                sm: 'row',
                            },
                            justifyContent: 'center',
                            gap: 1,
                        }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackRoundedIcon />}
                            onClick={() => navigate('/admin/gallery')}
                            disabled={loading}
                            sx={{
                                borderRadius: 1.5,
                                px: 2.5,
                                py: 0.9,
                                fontWeight: 950,
                            }}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            endIcon={
                                loading ? (
                                    <CircularProgress size={18} sx={{ color: 'var(--color-button-text)' }} />
                                ) : (
                                    <SaveRoundedIcon />
                                )
                            }
                            sx={{
                                borderRadius: 1.5,
                                px: 2.5,
                                py: 0.9,
                                fontWeight: 950,
                            }}
                        >
                            {loading ? 'Subiendo...' : 'Subir Imagen'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};