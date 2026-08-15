// src/components/themes/AdminNewTheme.tsx

import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    Box,
    Button,
    CircularProgress,
    FormControlLabel,
    Paper,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { useThemeStore } from '../../store/admin/useThemeStore';
import type { CreateThemePayload } from '../../types/theme';

type ThemeColorFieldKey =
    | 'primaryColor'
    | 'accentColor'
    | 'backgroundColor'
    | 'cardColor'
    | 'navColor'
    | 'textColor'
    | 'secondaryTextColor'
    | 'buttonColor'
    | 'buttonTextColor'
    | 'borderColor';

interface ThemeColorField {
    key: ThemeColorFieldKey;
    label: string;
}

interface ThemePreviewCardProps {
    formData: CreateThemePayload;
}

const colorFields: ThemeColorField[] = [
    { key: 'primaryColor', label: 'Color Primario' },
    { key: 'accentColor', label: 'Color Acento' },
    { key: 'backgroundColor', label: 'Fondo Pantalla' },
    { key: 'cardColor', label: 'Fondo Tarjetas' },
    { key: 'navColor', label: 'Barra Navegación' },
    { key: 'textColor', label: 'Texto Principal' },
    { key: 'secondaryTextColor', label: 'Texto Secundario' },
    { key: 'buttonColor', label: 'Fondo Botones' },
    { key: 'buttonTextColor', label: 'Texto Botones' },
    { key: 'borderColor', label: 'Bordes' },
];

const defaultThemePayload: CreateThemePayload = {
    name: '',
    isDark: false,
    primaryColor: '#6f42c1',
    accentColor: '#d63384',
    backgroundColor: '#ffffff',
    textColor: '#212529',
    cardColor: '#f8f9fa',
    buttonColor: '#6f42c1',
    navColor: '#ffffff',
    buttonTextColor: '#ffffff',
    secondaryTextColor: '#6c757d',
    borderColor: '#dee2e6',
};

const ThemePreviewCard = ({ formData }: ThemePreviewCardProps) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: formData.backgroundColor,
                border: `1px solid ${formData.borderColor}`,
                color: formData.textColor,
                boxShadow: '0 12px 34px rgba(15, 23, 42, 0.08)',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    p: 1.2,
                    mb: 1.25,
                    borderRadius: 1.5,
                    backgroundColor: formData.navColor,
                    border: `1px solid ${formData.borderColor}`,
                    color: formData.textColor,
                    fontWeight: 950,
                }}
            >
                {formData.name || 'Vista previa del tema'}
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    backgroundColor: formData.cardColor,
                    border: `1px solid ${formData.borderColor}`,
                    color: formData.textColor,
                }}
            >
                <Typography sx={{ fontWeight: 950 }}>
                    Tarjeta de ejemplo
                </Typography>

                <Typography
                    sx={{
                        mt: 0.5,
                        color: formData.secondaryTextColor,
                        fontWeight: 800,
                        fontSize: '0.86rem',
                    }}
                >
                    Texto secundario del tema.
                </Typography>

                <Box
                    sx={{
                        mt: 1.25,
                        display: 'inline-flex',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1.25,
                        backgroundColor: formData.buttonColor,
                        color: formData.buttonTextColor,
                        fontWeight: 950,
                    }}
                >
                    Botón
                </Box>
            </Paper>
        </Paper>
    );
};

export const AdminNewTheme = () => {
    const navigate = useNavigate();
    const { addTheme, loading } = useThemeStore();

    const [formData, setFormData] = useState<CreateThemePayload>(defaultThemePayload);

    const previewColors = useMemo(() => {
        return colorFields.map((field) => ({
            key: field.key,
            label: field.label,
            color: formData[field.key],
        }));
    }, [formData]);

    const handleTextChange = (field: 'name', value: string) => {
        setFormData((previousValue) => ({
            ...previousValue,
            [field]: value,
        }));
    };

    const handleBooleanChange = (field: 'isDark', value: boolean) => {
        setFormData((previousValue) => ({
            ...previousValue,
            [field]: value,
        }));
    };

    const handleColorChange = (field: ThemeColorFieldKey, value: string) => {
        setFormData((previousValue) => ({
            ...previousValue,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!formData.name.trim()) {
            Swal.fire('Error', 'El nombre del tema es obligatorio.', 'error');
            return;
        }

        try {
            await addTheme(formData);
            Swal.fire('¡Creado!', 'Tema creado correctamente', 'success');
            navigate('/admin/themes');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo crear el tema.', 'error');
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
                            <PaletteRoundedIcon />
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
                                Nuevo Tema
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                Crea una nueva paleta visual para el sitio y panel administrativo.
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => navigate('/admin/themes')}
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
                                xl: 'minmax(0, 1fr) 340px',
                            },
                            gap: {
                                xs: 2,
                                xl: 3,
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
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: 'minmax(0, 1fr) 240px',
                                    },
                                    gap: 1.5,
                                    paddingTop: 0.7
                                }}
                            >
                                <TextField
                                    type="text"
                                    label="Nombre del Tema"
                                    placeholder="Ej. Tema Oscuro"
                                    value={formData.name}
                                    onChange={(event) => handleTextChange('name', event.target.value)}
                                    disabled={loading}
                                    required
                                />

                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.25,
                                        borderRadius: 1.5,
                                        backgroundColor:
                                            'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                        border:
                                            '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                    }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.isDark}
                                                onChange={(event) => handleBooleanChange('isDark', event.target.checked)}
                                                disabled={loading}
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography sx={{ fontWeight: 950 }}>
                                                    ¿Es Modo Oscuro?
                                                </Typography>

                                                <Typography
                                                    sx={{
                                                        color: 'var(--color-secondary-text)',
                                                        fontWeight: 700,
                                                        fontSize: '0.82rem',
                                                    }}
                                                >
                                                    Marca esta opción para identificarlo como dark mode.
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

                            <Typography
                                component="h2"
                                sx={{
                                    mt: 1,
                                    fontSize: '1.15rem',
                                    fontWeight: 950,
                                }}
                            >
                                Paleta de Colores
                            </Typography>

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: 'repeat(2, minmax(0, 1fr))',
                                        xl: 'repeat(3, minmax(0, 1fr))',
                                    },
                                    gap: 1.5,
                                }}
                            >
                                {colorFields.map((field) => (
                                    <Paper
                                        key={field.key}
                                        elevation={0}
                                        sx={{
                                            p: 1.25,
                                            borderRadius: 1.5,
                                            backgroundColor:
                                                'color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%)',
                                            border:
                                                '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                mb: 0.75,
                                                color: 'var(--color-secondary-text)',
                                                fontWeight: 900,
                                                fontSize: '0.78rem',
                                            }}
                                        >
                                            {field.label}
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '54px minmax(0, 1fr)',
                                                gap: 1,
                                                alignItems: 'center',
                                            }}
                                        >
                                            <TextField
                                                type="color"
                                                value={formData[field.key]}
                                                onChange={(event) => handleColorChange(field.key, event.target.value)}
                                                disabled={loading}
                                                sx={{
                                                    '& input': {
                                                        height: 42,
                                                        p: 0.5,
                                                        cursor: 'pointer',
                                                    },
                                                }}
                                            />

                                            <TextField
                                                type="text"
                                                value={formData[field.key]}
                                                onChange={(event) => handleColorChange(field.key, event.target.value)}
                                                disabled={loading}
                                                size="small"
                                            />
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                            }}
                        >
                            <ThemePreviewCard formData={formData} />

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                    border:
                                        '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                }}
                            >
                                <Typography sx={{ mb: 1, fontWeight: 950 }}>
                                    Colores activos
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(5, 1fr)',
                                        gap: 0.75,
                                    }}
                                >
                                    {previewColors.map((item) => (
                                        <Tooltip key={item.key} title={`${item.label}: ${item.color}`}>
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    aspectRatio: '1 / 1',
                                                    borderRadius: 1,
                                                    backgroundColor: item.color,
                                                    border:
                                                        '1px solid color-mix(in srgb, var(--color-border) 70%, transparent)',
                                                }}
                                            />
                                        </Tooltip>
                                    ))}
                                </Box>
                            </Paper>
                        </Box>
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
                            onClick={() => navigate('/admin/themes')}
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
                            {loading ? 'Guardando...' : 'Crear Tema'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};