// src/components/members/NewMemberForm.tsx

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import type { CreateMemberPayload } from '../../types/member';
import { useMemberStore } from '../../store/admin/useMemberStore';
import { useInstrumentsStore } from '../../store/admin/useInstrumentsStore';
import { InstrumentPickerModal } from '../components-admin/instruments/InstrumentPickerModal';
import type { Instrument } from '../../types/instrument';
import {
    shouldAutoLoadInstruments,
    shouldShowNoInstrumentsState,
} from '../../instruments/instrumentLoadState';

export const NewMemberForm = () => {
    const navigate = useNavigate();
    const { addMember } = useMemberStore();

    const {
        instruments,
        loading: instrumentsLoading,
        hasAttemptedLoad: hasAttemptedInstrumentsLoad,
        loadFailed: instrumentsLoadFailed,
        fetchInstruments,
    } = useInstrumentsStore();

    const [formData, setFormData] = useState<CreateMemberPayload>({
        name: '',
        instrumentId: undefined,
        instrumentLabel: '',
        instrument: '',
        voice: false,
        file: undefined,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const [showInstrumentPicker, setShowInstrumentPicker] = useState(false);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);

    useEffect(() => {
        if (shouldAutoLoadInstruments(hasAttemptedInstrumentsLoad)) {
            fetchInstruments().catch((error: Error) => {
                console.error('Error fetching instruments:', error);
            });
        }
    }, [fetchInstruments, hasAttemptedInstrumentsLoad]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = event.target;

        if (type === 'file') {
            const selectedFile = (event.target as HTMLInputElement).files?.[0];

            if (!selectedFile) {
                return;
            }

            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }

            setFormData((previousValue) => ({
                ...previousValue,
                file: selectedFile,
            }));
            setPreviewUrl(URL.createObjectURL(selectedFile));
            return;
        }

        if (name === 'instrument') {
            setFormData((previousValue) => ({
                ...previousValue,
                instrument: value,
                instrumentLabel: value,
                instrumentId: undefined,
            }));
            setSelectedInstrumentId(null);
            return;
        }

        setFormData((previousValue) => ({
            ...previousValue,
            [name]: value,
        }));
    };

    const handleVoiceChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFormData((previousValue) => ({
            ...previousValue,
            voice: event.target.checked,
        }));
    };

    const handleOpenInstrumentPicker = () => {
        setShowInstrumentPicker(true);
    };

    const handleCloseInstrumentPicker = () => {
        setShowInstrumentPicker(false);
    };

    const handleInstrumentSelected = (instrument: Instrument | null) => {
        if (!instrument) {
            setSelectedInstrumentId(null);
            setFormData((previousValue) => ({
                ...previousValue,
                instrumentId: undefined,
                instrumentLabel: '',
                instrument: '',
            }));
            return;
        }

        setSelectedInstrumentId(instrument.id);
        setFormData((previousValue) => ({
            ...previousValue,
            instrumentId: instrument.id,
            instrumentLabel: instrument.name,
            instrument: instrument.name,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const newErrors: string[] = [];

        if (!formData.name.trim()) {
            newErrors.push('El nombre es requerido.');
        }

        if (!formData.instrumentLabel.trim()) {
            newErrors.push('El instrumento es requerido.');
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            await addMember(formData);

            Swal.fire('¡Miembro creado!', '✅ El miembro ha sido creado', 'success');

            setFormData({
                name: '',
                instrumentId: undefined,
                instrumentLabel: '',
                instrument: '',
                voice: false,
                file: undefined,
            });
            setSelectedInstrumentId(null);
            setPreviewUrl(null);
            setErrors([]);

            navigate('/admin/members');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    const selectedInstrumentLabel =
        formData.instrumentLabel && formData.instrumentLabel.trim().length > 0
            ? formData.instrumentLabel
            : 'Ningún instrumento seleccionado';

    const hasNoConfiguredInstruments = shouldShowNoInstrumentsState(
        hasAttemptedInstrumentsLoad,
        instrumentsLoadFailed,
        instrumentsLoading,
        instruments.length,
    );

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
                            <GroupsRoundedIcon />
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
                                Nuevo Miembro
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                Registra un nuevo integrante del coro.
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => navigate('/admin/members')}
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
                                name="name"
                                label="Nombre"
                                placeholder="Nombre completo"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: 'minmax(0, 1fr) auto',
                                    },
                                    gap: 1,
                                }}
                            >
                                <TextField
                                    type="text"
                                    name="instrument"
                                    label="Instrumento"
                                    placeholder="Selecciona un instrumento o escribe uno"
                                    value={formData.instrument}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />

                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={handleOpenInstrumentPicker}
                                    disabled={instrumentsLoading || loading}
                                    sx={{
                                        borderRadius: 1.5,
                                        px: 2,
                                        fontWeight: 950,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {instrumentsLoading ? 'Cargando...' : 'Elegir'}
                                </Button>
                            </Box>

                            <Typography
                                sx={{
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.86rem',
                                }}
                            >
                                Seleccionado:{' '}
                                <Box component="span" sx={{ color: 'var(--color-text)', fontWeight: 950 }}>
                                    {selectedInstrumentLabel}
                                </Box>
                            </Typography>

                            {hasNoConfiguredInstruments && (
                                <Alert severity="info">
                                    No hay instrumentos configurados para este coro. Puedes escribir uno
                                    manualmente en el campo Instrumento o crearlo desde la sección Instrumentos.
                                </Alert>
                            )}

                            {instrumentsLoadFailed && !instrumentsLoading && (
                                <Alert
                                    severity="warning"
                                    action={(
                                        <Button
                                            type="button"
                                            size="small"
                                            onClick={() => {
                                                void fetchInstruments();
                                            }}
                                            disabled={loading}
                                        >
                                            Reintentar
                                        </Button>
                                    )}
                                >
                                    No fue posible cargar los instrumentos. Puedes reintentar o escribir uno
                                    manualmente.
                                </Alert>
                            )}

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
                                            checked={formData.voice}
                                            onChange={handleVoiceChange}
                                            disabled={loading}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography sx={{ fontWeight: 950 }}>
                                                ¿Tiene voz?
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    color: 'var(--color-secondary-text)',
                                                    fontWeight: 700,
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                Activa esta opción si el miembro también participa como cantante.
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
                                Foto de perfil
                            </Typography>

                            <Avatar
                                src={previewUrl || undefined}
                                alt="Vista previa"
                                sx={{
                                    width: 150,
                                    height: 150,
                                    mx: 'auto',
                                    mb: 1.5,
                                    bgcolor: 'var(--color-primary)',
                                    color: 'var(--color-button-text)',
                                    fontSize: '2.5rem',
                                    fontWeight: 950,
                                    border: '3px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
                                }}
                            >
                                {formData.name.slice(0, 1).toUpperCase() || 'M'}
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
                                Elegir foto
                                <input hidden type="file" name="file" accept="image/*" onChange={handleChange} />
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
                            onClick={() => navigate('/admin/members')}
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
                            {loading ? 'Creando...' : 'Crear miembro'}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <InstrumentPickerModal
                show={showInstrumentPicker}
                onClose={handleCloseInstrumentPicker}
                instruments={instruments || []}
                selectedInstrumentId={selectedInstrumentId}
                onSelectInstrument={handleInstrumentSelected}
            />
        </Box>
    );
};