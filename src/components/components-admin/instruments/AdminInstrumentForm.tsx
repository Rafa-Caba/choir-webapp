// src/components/components-admin/instruments/AdminInstrumentForm.tsx

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { useInstrumentsStore } from '../../../store/admin/useInstrumentsStore';
import type { CreateInstrumentPayload, Instrument } from '../../../types/instrument';

interface InstrumentFormState {
    name: string;
    slug: string;
    category: string;
    iconKey: string;
    isActive: boolean;
    order: string;
}

const defaultInstrumentCategories = [
    'Cuerdas',
    'Viento',
    'Percusión',
    'Teclado',
    'Voz',
    'Electrónico',
    'Accesorios',
    'Ensamble',
    'Otro',
];

const buildInstrumentPayload = (formData: InstrumentFormState): CreateInstrumentPayload => {
    const parsedOrder = formData.order.trim() === '' ? 0 : Number(formData.order);

    return {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        category: formData.category.trim(),
        iconKey: formData.iconKey.trim(),
        isActive: formData.isActive,
        order: Number.isNaN(parsedOrder) ? 0 : parsedOrder,
    };
};

export const AdminInstrumentForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const {
        instruments,
        fetchInstruments,
        fetchInstrumentById,
        saveInstrumentAction,
    } = useInstrumentsStore();

    const [formData, setFormData] = useState<InstrumentFormState>({
        name: '',
        slug: '',
        category: '',
        iconKey: '',
        isActive: true,
        order: '0',
    });

    const [file, setFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);

    const categoryOptions = formData.category.trim() &&
        !defaultInstrumentCategories.includes(formData.category.trim())
        ? [...defaultInstrumentCategories, formData.category.trim()]
        : defaultInstrumentCategories;

    useEffect(() => {
        const loadData = async () => {
            if (!isEdit || !id) {
                return;
            }

            setInitialLoading(true);

            try {
                let instrument: Instrument | undefined | null = instruments.find(
                    (instrumentItem) => instrumentItem.id === id,
                );

                if (!instrument) {
                    instrument = await fetchInstrumentById(id);
                }

                if (instrument) {
                    setFormData({
                        name: instrument.name,
                        slug: instrument.slug,
                        category: instrument.category || '',
                        iconKey: instrument.iconKey,
                        isActive: instrument.isActive,
                        order: String(instrument.order ?? 0),
                    });

                    setPreviewUrl(instrument.iconUrl || '');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo cargar el instrumento.', 'error');
            } finally {
                setInitialLoading(false);
            }
        };

        void loadData();
    }, [id, isEdit, instruments, fetchInstrumentById]);

    useEffect(() => {
        return () => {
            if (previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = event.target;

        if (type === 'checkbox') {
            setFormData((previousValue) => ({
                ...previousValue,
                [name]: (event.target as HTMLInputElement).checked,
            }));
            return;
        }

        setFormData((previousValue) => ({
            ...previousValue,
            [name]: value,
        }));
    };

    const handleCategoryChange = (event: SelectChangeEvent<string>) => {
        setFormData((previousValue) => ({
            ...previousValue,
            category: event.target.value,
        }));
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        if (previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedName = formData.name.trim();
        const trimmedSlug = formData.slug.trim();
        const trimmedIconKey = formData.iconKey.trim();
        const parsedOrder = formData.order.trim() === '' ? 0 : Number(formData.order);

        if (!trimmedName || !trimmedSlug || !trimmedIconKey) {
            Swal.fire(
                'Error',
                'Por favor completa Nombre, Slug e Icon Key (requeridos).',
                'error',
            );
            return;
        }

        if (Number.isNaN(parsedOrder)) {
            Swal.fire('Orden inválido', 'El orden debe ser un número válido.', 'warning');
            return;
        }

        setLoading(true);

        try {
            await saveInstrumentAction(buildInstrumentPayload(formData), file, id);

            Swal.fire(
                'Éxito',
                `Instrumento ${isEdit ? 'actualizado' : 'creado'} correctamente`,
                'success',
            );

            void fetchInstruments();

            navigate('/admin/instruments');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo guardar el instrumento', 'error');
        } finally {
            setLoading(false);
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
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2, fontWeight: 800 }}>
                        Cargando instrumento...
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
                            <BuildRoundedIcon />
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
                                {isEdit ? 'Editar Instrumento' : 'Nuevo Instrumento'}
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                Configura nombre, slug, categoría, icon key, orden y visual del instrumento.
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => navigate('/admin/instruments')}
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
                                lg: 'minmax(0, 1fr) 300px',
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
                                name="name"
                                label="Nombre *"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                                style={{ marginTop: 5 }}
                                required
                            />

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: 'repeat(2, minmax(0, 1fr))',
                                    },
                                    gap: 1.5,
                                }}
                            >
                                <TextField
                                    type="text"
                                    name="slug"
                                    label="Slug *"
                                    placeholder="guitarra-acustica"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                    helperText="Identificador único sin espacios."
                                />

                                <TextField
                                    type="text"
                                    name="iconKey"
                                    label="Icon Key *"
                                    placeholder="guitar, piano, drums..."
                                    value={formData.iconKey}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                    helperText="Clave para tu sistema de íconos o ilustraciones."
                                />
                            </Box>

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: 'minmax(0, 1fr) 160px',
                                    },
                                    gap: 1.5,
                                }}
                            >
                                <FormControl fullWidth disabled={loading}>
                                    <InputLabel id="instrument-category-label">Categoría</InputLabel>
                                    <Select
                                        labelId="instrument-category-label"
                                        value={formData.category}
                                        label="Categoría"
                                        onChange={handleCategoryChange}
                                    >
                                        <MenuItem value="">
                                            <em>Sin categoría</em>
                                        </MenuItem>

                                        {categoryOptions.map((category) => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    type="number"
                                    name="order"
                                    label="Orden"
                                    value={formData.order}
                                    onChange={handleChange}
                                    disabled={loading}
                                    slotProps={{
                                        htmlInput: {
                                            inputMode: 'numeric',
                                        },
                                    }}
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
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                            name="isActive"
                                            disabled={loading}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography sx={{ fontWeight: 950 }}>
                                                Activo
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    color: 'var(--color-secondary-text)',
                                                    fontWeight: 700,
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                Si está activo, podrá usarse en selectores y formularios públicos/admin.
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
                                Ícono del Instrumento
                            </Typography>

                            <Box
                                sx={{
                                    width: 170,
                                    height: 170,
                                    mx: 'auto',
                                    mb: 1.5,
                                    borderRadius: 2,
                                    border:
                                        '2px dashed color-mix(in srgb, var(--color-border) 60%, transparent)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-card) 80%, var(--color-primary) 20%)',
                                }}
                            >
                                {previewUrl ? (
                                    <Box
                                        component="img"
                                        src={previewUrl}
                                        alt="Vista previa del icono"
                                        sx={{
                                            position: 'absolute',
                                            // top: '50%',
                                            // left: '50%',
                                            width: '100%',
                                            height: '100%',
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            objectFit: 'contain',
                                            objectPosition: 'center',
                                            // transform: 'translate(-50%, -50%)',
                                            display: 'block',
                                            m: 0,
                                            p: 0,
                                            border: 0,
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 0.75,
                                            color: 'var(--color-secondary-text)',
                                            lineHeight: 1.2,
                                            p: 1,
                                        }}
                                    >
                                        <MusicNoteRoundedIcon sx={{ fontSize: 42 }} />

                                        <Typography
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: '0.82rem',
                                            }}
                                        >
                                            Sin icono seleccionado
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

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
                                Elegir ícono
                                <input hidden type="file" accept="image/*" onChange={handleFileChange} />
                            </Button>

                            <Typography
                                sx={{
                                    mt: 0.75,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                }}
                            >
                                Opcional. Puedes subir una ilustración del instrumento.
                            </Typography>
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
                            onClick={() => navigate('/admin/instruments')}
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
                            {loading
                                ? 'Guardando...'
                                : isEdit
                                    ? 'Actualizar Instrumento'
                                    : 'Crear Instrumento'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};