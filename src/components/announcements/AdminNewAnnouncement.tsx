// src/components/announcements/AdminNewAnnouncement.tsx

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import type { JSONContent } from '@tiptap/react';

import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    FormControlLabel,
    Paper,
    Switch,
    TextField,
    Typography,
} from '@mui/material';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { useAnnouncementStore } from '../../store/admin/useAnnouncementStore';
import type { CreateAnnouncementPayload } from '../../types/announcement';
import { TiptapEditor } from '../tiptap-components/TiptapEditor';
import { parseText } from '../../utils/handleTextTipTap';
import { emptyEditorContent } from '../../utils/editorDefaults';

type AnnouncementContent = CreateAnnouncementPayload['content'];

const buildAnnouncementContentPayload = (editorContent: JSONContent): AnnouncementContent => {
    const parsedContent = parseText(editorContent);

    return {
        type: parsedContent.type ?? 'doc',
        content: parsedContent.content ?? [],
    };
};

export const AdminNewAnnouncement = () => {
    const navigate = useNavigate();
    const { addAnnouncement, loading } = useAnnouncementStore();

    const defaultFormData: CreateAnnouncementPayload = {
        title: '',
        content: emptyEditorContent,
        isPublic: true,
        file: undefined,
    };

    const [formData, setFormData] = useState<CreateAnnouncementPayload>(defaultFormData);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        setFormData((previousValue) => ({
            ...previousValue,
            [name]: value,
        }));
    };

    const handlePublicChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFormData((previousValue) => ({
            ...previousValue,
            isPublic: event.target.checked,
        }));
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(URL.createObjectURL(selectedFile));

        setFormData((previousValue) => ({
            ...previousValue,
            file: selectedFile,
        }));
    };

    const handleContentChange = (newContent: JSONContent) => {
        setFormData((previousValue) => ({
            ...previousValue,
            content: buildAnnouncementContentPayload(newContent),
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const newErrors: string[] = [];

        if (!formData.title.trim()) {
            newErrors.push('El título es obligatorio.');
        }

        if (!formData.content) {
            newErrors.push('La descripción es obligatoria.');
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await addAnnouncement(formData);

            Swal.fire('¡Aviso creado!', '', 'success');

            setFormData(defaultFormData);
            setPreviewUrl(null);
            setErrors([]);

            navigate('/admin/announcements');
        } catch {
            Swal.fire('Error', 'No se pudo crear el aviso', 'error');
        }
    };

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
                            <CampaignRoundedIcon />
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
                                Nuevo Aviso
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                Crea un aviso para mostrarlo en el panel y secciones públicas.
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => navigate('/admin/announcements')}
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
                    encType="multipart/form-data"
                    sx={{
                        height: '100%',
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: {
                            xs: 1.5,
                            md: 2,
                        },
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                        p: '0 !important',
                        m: '0 !important',
                        backgroundColor: 'transparent !important',
                    }}
                >
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                lg: 'minmax(0, 1fr) 280px',
                            },
                            gap: {
                                xs: 2,
                                lg: 3,
                            },
                            alignItems: 'start',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                            }}
                        >
                            <TextField
                                type="text"
                                name="title"
                                label="Título"
                                value={formData.title}
                                onChange={handleTextChange}
                                disabled={loading}
                                required
                            />

                            <Box>
                                <Typography sx={{ mb: 1, fontWeight: 950 }}>
                                    Descripción
                                </Typography>

                                <TiptapEditor
                                    content={parseText(formData.content)}
                                    onChange={handleContentChange}
                                />
                            </Box>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                    border:
                                        '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                    boxShadow: 'inset 0 1px 16px rgba(15, 23, 42, 0.035)',
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isPublic}
                                            onChange={handlePublicChange}
                                            name="isPublic"
                                            disabled={loading}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography sx={{ fontWeight: 950 }}>
                                                Publicado
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    color: 'var(--color-secondary-text)',
                                                    fontWeight: 700,
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                Si está activo, el aviso podrá mostrarse en el sidebar.
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{
                                        m: 0,
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                />
                            </Paper>

                            {errors.length > 0 && (
                                <Alert severity="error" sx={{ borderRadius: 1.5, fontWeight: 700 }}>
                                    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                                        {errors.map((errorItem) => (
                                            <li key={errorItem}>{errorItem}</li>
                                        ))}
                                    </Box>
                                </Alert>
                            )}
                        </Box>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor:
                                    'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                border:
                                    '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                boxShadow:
                                    'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 12%, transparent), 0 10px 28px rgba(15, 23, 42, 0.05)',
                                alignSelf: 'start',
                                textAlign: 'center',
                            }}
                        >
                            <Typography sx={{ mb: 1, fontWeight: 950 }}>
                                Imagen del aviso
                            </Typography>

                            <Avatar
                                src={previewUrl || undefined}
                                alt="Vista previa"
                                variant="rounded"
                                sx={{
                                    width: 170,
                                    height: 170,
                                    mx: 'auto',
                                    mb: 1.5,
                                    borderRadius: 2,
                                    bgcolor: 'var(--color-primary)',
                                    color: 'var(--color-button-text)',
                                    fontSize: '2.5rem',
                                    fontWeight: 950,
                                    border: '3px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
                                }}
                            >
                                A
                            </Avatar>

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
                                Elegir imagen
                                <input hidden type="file" name="file" accept="image/*" onChange={handleFileChange} />
                            </Button>
                        </Paper>
                    </Box>

                    <Box
                        sx={{
                            mt: 'auto',
                            flexShrink: 0,
                            display: 'flex',
                            flexDirection: {
                                xs: 'column-reverse',
                                sm: 'row',
                            },
                            justifyContent: 'flex-end',
                            gap: 1,
                            pt: 1,
                        }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackRoundedIcon />}
                            onClick={() => navigate('/admin/announcements')}
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
                            {loading ? 'Creando...' : 'Crear aviso'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};