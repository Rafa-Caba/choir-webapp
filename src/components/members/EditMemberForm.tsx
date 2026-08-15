// src/components/members/EditMemberForm.tsx

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
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

import { useMemberStore } from '../../store/admin/useMemberStore';
import { useInstrumentsStore } from '../../store/admin/useInstrumentsStore';
import { InstrumentPickerModal } from '../components-admin/instruments/InstrumentPickerModal';
import type { Instrument } from '../../types/instrument';
import { shouldAutoLoadInstruments } from '../../instruments/instrumentLoadState';
import type { CreateMemberPayload, Member } from '../../types/member';

interface MemberInstrumentFields {
    instrumentId?: string;
    instrumentLabel?: string;
    instrument?: string;
}

type MemberWithInstrument = Member & MemberInstrumentFields;

export const EditMemberForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { getMember, editMember } = useMemberStore();
    const {
        instruments,
        loading: instrumentsLoading,
        hasAttemptedLoad: hasAttemptedInstrumentsLoad,
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
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const [showInstrumentPicker, setShowInstrumentPicker] = useState(false);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);

    useEffect(() => {
        const loadMember = async () => {
            if (!id) {
                setInitialLoading(false);
                return;
            }

            try {
                const member = await getMember(id);

                if (member) {
                    const memberWithInstrument = member as MemberWithInstrument;
                    const baseInstrument = memberWithInstrument.instrumentLabel || memberWithInstrument.instrument || '';

                    setFormData({
                        name: member.name,
                        instrumentId: memberWithInstrument.instrumentId || undefined,
                        instrumentLabel: baseInstrument,
                        instrument: baseInstrument,
                        voice: member.voice,
                        file: undefined,
                    });

                    setSelectedInstrumentId(memberWithInstrument.instrumentId || null);
                    setPreviewUrl(member.imageUrl || null);
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo obtener el miembro', 'error');
                window.setTimeout(() => navigate('/admin/members'), 1500);
            } finally {
                setInitialLoading(false);
            }
        };

        void loadMember();
    }, [id, getMember, navigate]);

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

        if (!id) {
            return;
        }

        if (!formData.name.trim() || !formData.instrumentLabel.trim()) {
            Swal.fire('Campos requeridos', 'El nombre y el instrumento son obligatorios.', 'warning');
            return;
        }

        setLoading(true);

        try {
            await editMember(id, formData);
            Swal.fire('Actualizado', '✅ Miembro actualizado exitosamente', 'success');
            navigate('/admin/members');
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo actualizar el miembro', 'error');
        } finally {
            setLoading(false);
        }
    };

    const selectedInstrumentLabel =
        formData.instrumentLabel && formData.instrumentLabel.trim().length > 0
            ? formData.instrumentLabel
            : 'Ningún instrumento seleccionado';

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
                        Cargando miembro...
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
                                Editar Miembro
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                Actualiza datos, instrumento, voz y foto del integrante.
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
                                label="Nombre completo"
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
                                Cambiar foto
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
                            Regresar a Miembros
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
                            {loading ? 'Actualizando...' : 'Actualizar Miembro'}
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