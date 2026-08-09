// src/components/user-menu/UserSettings.tsx

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Paper,
    TextField,
    Typography,
} from '@mui/material';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { useUsersStore } from '../../store/admin/useUsersStore';
import { useAuth } from '../../context/AuthContext';
import { useInstrumentsStore } from '../../store/admin/useInstrumentsStore';
import { InstrumentPickerModal } from '../components-admin/instruments/InstrumentPickerModal';
import type { Instrument } from '../../types/instrument';
import { shouldAutoLoadInstruments } from '../../instruments/instrumentLoadState';

interface UserSettingsFormState {
    name: string;
    username: string;
    email: string;
    imageUrl: string;
    instrumentId: string;
    instrumentLabel: string;
}

interface UserInstrumentFields {
    instrumentId?: string;
    instrumentLabel?: string;
}

export const UserSettings = () => {
    const { user, updateUser, hasTenantContext } = useAuth();
    const { updateMyProfile } = useUsersStore();

    const {
        instruments,
        loading: instrumentsLoading,
        hasAttemptedLoad: hasAttemptedInstrumentsLoad,
        fetchInstruments,
    } = useInstrumentsStore();

    const [formData, setFormData] = useState<UserSettingsFormState>({
        name: '',
        username: '',
        email: '',
        imageUrl: '',
        instrumentId: '',
        instrumentLabel: '',
    });

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showInstrumentPicker, setShowInstrumentPicker] = useState(false);

    useEffect(() => {
        if (!user) {
            return;
        }

        const userWithInstrument = user as typeof user & UserInstrumentFields;

        setFormData({
            name: user.name || '',
            username: user.username || '',
            email: user.email || '',
            imageUrl: user.imageUrl || '',
            instrumentId: userWithInstrument.instrumentId || '',
            instrumentLabel: userWithInstrument.instrumentLabel || '',
        });

        setPreviewUrl(user.imageUrl || null);
    }, [user]);

    useEffect(() => {
        if (hasTenantContext && shouldAutoLoadInstruments(hasAttemptedInstrumentsLoad)) {
            fetchInstruments().catch((error: Error) => {
                console.error('Error fetching instruments for UserSettings:', error);
            });
        }
    }, [fetchInstruments, hasAttemptedInstrumentsLoad, hasTenantContext]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        setFormData((previousValue) => ({
            ...previousValue,
            [name]: value,
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

        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const handleOpenInstrumentPicker = () => {
        setShowInstrumentPicker(true);
    };

    const handleInstrumentSelected = (instrument: Instrument | null) => {
        if (!instrument) {
            setFormData((previousValue) => ({
                ...previousValue,
                instrumentId: '',
                instrumentLabel: '',
            }));
            return;
        }

        setFormData((previousValue) => ({
            ...previousValue,
            instrumentId: instrument.id,
            instrumentLabel: instrument.name,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!user?.id) {
            return;
        }

        setLoading(true);

        const payload = new FormData();
        payload.append('name', formData.name.trim());
        payload.append('username', formData.username.trim());
        payload.append('email', formData.email.trim());

        if (hasTenantContext && formData.instrumentId) {
            payload.append('instrumentId', formData.instrumentId);
        }

        if (hasTenantContext && formData.instrumentLabel) {
            payload.append('instrumentLabel', formData.instrumentLabel);
        }

        if (file) {
            payload.append('file', file);
        }

        try {
            const updatedUser = await updateMyProfile(payload);

            updateUser(updatedUser);

            Swal.fire('Actualizado', '✅ Datos actualizados con éxito', 'success');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', '❌ No se pudo actualizar el usuario', 'error');
        } finally {
            setLoading(false);
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
                            <ManageAccountsRoundedIcon />
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
                                Ajustes del Usuario
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                {hasTenantContext
                                    ? 'Actualiza tu información personal, instrumento y foto de perfil.'
                                    : 'Actualiza tu información personal y foto de perfil de plataforma.'}
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        component={RouterLink}
                        to="/admin"
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        disabled={loading}
                        sx={{
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        Ir al Inicio
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
                    mt: 3,
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
                        maxWidth: 860,
                        mx: 'auto',
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
                        m: '0 auto !important',
                        backgroundColor: 'transparent !important',
                    }}
                >
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '300px minmax(0, 1fr)',
                            },
                            gap: 2,
                            alignItems: 'start',
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor:
                                    'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                border: '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                textAlign: 'center',
                            }}
                        >
                            <Avatar
                                src={previewUrl || undefined}
                                alt="Vista previa"
                                sx={{
                                    width: 250,
                                    height: 250,
                                    mx: 'auto',
                                    mb: 1.5,
                                    bgcolor: 'var(--color-primary)',
                                    color: 'var(--color-button-text)',
                                    fontSize: '2.5rem',
                                    fontWeight: 950,
                                    border: '3px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
                                }}
                            >
                                {formData.name.slice(0, 1).toUpperCase() || 'U'}
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
                                Cambiar foto
                                <input hidden type="file" name="file" accept="image/*" onChange={handleFileChange} />
                            </Button>
                        </Paper>

                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                                mt: 1,
                            }}
                        >
                            <TextField
                                type="text"
                                name="name"
                                label="Nombre"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />

                            <TextField
                                type="text"
                                name="username"
                                label="Username"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />

                            <TextField
                                type="email"
                                name="email"
                                label="Correo"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />

                            {hasTenantContext && (
                                <>
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'minmax(0, 1fr) auto',
                                            gap: 1,
                                        }}
                                    >
                                        <TextField
                                            type="text"
                                            name="instrumentLabel"
                                            label="Instrumento"
                                            placeholder="Selecciona un instrumento..."
                                            value={formData.instrumentLabel}
                                            disabled
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

                                    {formData.instrumentId && (
                                        <Typography
                                            sx={{
                                                color: 'var(--color-secondary-text)',
                                                fontWeight: 800,
                                                fontSize: '0.86rem',
                                            }}
                                        >
                                            Instrumento seleccionado: {formData.instrumentLabel}
                                        </Typography>
                                    )}
                                </>
                            )}
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
                            justifyContent: 'center',
                            gap: 1,
                            pt: 1,
                        }}
                    >
                        <Button
                            component={RouterLink}
                            to="/admin"
                            variant="outlined"
                            startIcon={<ArrowBackRoundedIcon />}
                            disabled={loading}
                            sx={{
                                borderRadius: 1.5,
                                px: 2.5,
                                py: 0.9,
                                fontWeight: 950,
                            }}
                        >
                            Ir al Inicio
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
                            {loading ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {hasTenantContext && (
                <InstrumentPickerModal
                    show={showInstrumentPicker}
                    onClose={() => setShowInstrumentPicker(false)}
                    instruments={instruments}
                    selectedInstrumentId={formData.instrumentId || null}
                    onSelectInstrument={handleInstrumentSelected}
                />
            )}
        </Box>
    );
};