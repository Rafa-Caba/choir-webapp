// src/components/gallery/AdminEditMedia.tsx

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { useGalleryStore } from '../../store/admin/useGalleryStore';

export const AdminEditMedia = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { getImage, editImage, loading } = useGalleryStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [newFile, setNewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchImage = async () => {
            if (!id) {
                return;
            }

            try {
                const data = await getImage(id);

                if (data) {
                    setTitle(data.title);
                    setDescription(data.description);
                    setPreviewUrl(data.imageUrl);
                }
            } catch {
                Swal.fire('Error', 'No se pudo cargar la imagen.', 'error');
            } finally {
                setInitialLoading(false);
            }
        };

        void fetchImage();
    }, [id, getImage]);

    useEffect(() => {
        return () => {
            if (previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        setNewFile(file);
        setSelectedFileName(file.name);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!title || !description) {
            Swal.fire('Campos requeridos', 'Llena todos los campos', 'warning');
            return;
        }

        const formData = new FormData();
        const dataPayload = { title, description };

        formData.append('data', JSON.stringify(dataPayload));

        if (newFile) {
            formData.append('file', newFile);
        }

        try {
            await editImage(id || '', formData);
            Swal.fire('Éxito', 'Imagen actualizada correctamente', 'success');
            navigate(`/admin/gallery/media/${id}`);
        } catch {
            Swal.fire('Error', 'No se pudo actualizar la imagen', 'error');
        }
    };

    if (initialLoading) {
        return (
            <Box
                sx={{
                    minHeight: 360,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--color-text)',
                    flexShrink: 0,
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2, fontWeight: 800 }}>
                        Cargando imagen...
                    </Typography>
                </Box>
            </Box>
        );
    }

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
                            <EditRoundedIcon />
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
                                Editar Imagen
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                Actualiza el título, descripción o archivo de la imagen.
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => navigate(`/admin/gallery/media/${id}`)}
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
                        label="Título"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Título de la imagen"
                        disabled={loading}
                        required
                    />

                    <TextField
                        label="Descripción"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Descripción de la imagen"
                        disabled={loading}
                        multiline
                        minRows={3}
                        required
                    />

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
                            {selectedFileName || 'Seleccionar nueva imagen opcional'}
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
                            Si no seleccionas una nueva imagen, se conservará la actual.
                        </Typography>
                    </Paper>

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
                                Vista previa
                            </Typography>

                            <Box
                                component="img"
                                src={previewUrl}
                                alt="Vista previa"
                                sx={{
                                    width: '100%',
                                    maxHeight: 320,
                                    objectFit: 'contain',
                                    borderRadius: 1.5,
                                    display: 'block',
                                }}
                            />
                        </Paper>
                    )}

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
                            onClick={() => navigate(`/admin/gallery/media/${id}`)}
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
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};