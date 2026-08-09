// src/pages/admin/user/UserForm.tsx

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    Avatar,
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
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { useUsersStore } from '../../../store/admin/useUsersStore';
import { useInstrumentsStore } from '../../../store/admin/useInstrumentsStore';
import { InstrumentPickerModal } from '../../../components/components-admin/instruments/InstrumentPickerModal';
import type { Instrument } from '../../../types/instrument';
import { shouldAutoLoadInstruments } from '../../../instruments/instrumentLoadState';
import type { SaveUserPayload, TenantUserRole } from '../../../services/admin/users';
import {
    isValidTemporaryPassword,
    TEMPORARY_PASSWORD_HELP_TEXT,
} from '../../../users/temporaryPassword';

interface UserFormProps {
    readonly usersPath?: string;
    readonly contextLabel?: string;
}

interface UserFormState {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: TenantUserRole;
    instrumentId: string;
    instrumentLabel: string;
    bio: string;
    voice: boolean;
}

const roleOptions: Array<{ value: TenantUserRole; label: string; description: string }> = [
    {
        value: 'USER',
        label: 'Usuario',
        description: 'Acceso estándar al coro',
    },
    {
        value: 'VIEWER',
        label: 'Viewer',
        description: 'Solo ver',
    },
    {
        value: 'EDITOR',
        label: 'Editor',
        description: 'Gestionar contenido',
    },
    {
        value: 'ADMIN',
        label: 'Admin',
        description: 'Control total del coro',
    },
];

const isTenantUserRole = (value: string): value is TenantUserRole => (
    value === 'ADMIN' || value === 'EDITOR' || value === 'USER' || value === 'VIEWER'
);

export const UserForm = ({
    usersPath = '/admin/users',
    contextLabel,
}: UserFormProps) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { saveUserAction, fetchUser } = useUsersStore();

    const isEdit = Boolean(id);

    const {
        instruments,
        loading: instrumentsLoading,
        hasAttemptedLoad: hasAttemptedInstrumentsLoad,
        fetchInstruments,
    } = useInstrumentsStore();

    const [formData, setFormData] = useState<UserFormState>({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'VIEWER',
        instrumentId: '',
        instrumentLabel: '',
        bio: '',
        voice: false,
    });

    const [file, setFile] = useState<File | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [showInstrumentPicker, setShowInstrumentPicker] = useState(false);

    const availableRoleOptions = useMemo(() => roleOptions, []);

    useEffect(() => {
        if (shouldAutoLoadInstruments(hasAttemptedInstrumentsLoad)) {
            fetchInstruments().catch((error: Error) => {
                console.error('Error fetching instruments for UserForm:', error);
            });
        }
    }, [fetchInstruments, hasAttemptedInstrumentsLoad]);

    useEffect(() => {
        const loadData = async () => {
            if (!isEdit || !id) {
                return;
            }

            const userToEdit = await fetchUser(id);

            if (!userToEdit) {
                await Swal.fire(
                    'Usuario no encontrado',
                    'No fue posible cargar el usuario dentro del coro activo.',
                    'error',
                );
                navigate(usersPath, { replace: true });
                return;
            }

            const safeRole = isTenantUserRole(userToEdit.role) ? userToEdit.role : 'VIEWER';

            setFormData({
                name: userToEdit.name,
                username: userToEdit.username,
                email: userToEdit.email,
                password: '',
                confirmPassword: '',
                role: safeRole,
                instrumentId: userToEdit.instrumentId || '',
                instrumentLabel: userToEdit.instrumentLabel || userToEdit.instrument || '',
                bio: userToEdit.bio || '',
                voice: userToEdit.voice || false,
            });

            setPreviewUrl(userToEdit.imageUrl || '');
        };

        void loadData();
    }, [fetchUser, id, isEdit, navigate, usersPath]);

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

    const handleRoleChange = (event: SelectChangeEvent<TenantUserRole>) => {
        setFormData((previousValue) => ({
            ...previousValue,
            role: event.target.value,
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

        if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) {
            Swal.fire('Error', 'Por favor completa los campos obligatorios (*)', 'error');
            return;
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
            return;
        }

        if (formData.password && !isValidTemporaryPassword(formData.password)) {
            Swal.fire('Contraseña inválida', TEMPORARY_PASSWORD_HELP_TEXT, 'warning');
            return;
        }

        setLoading(true);

        const payload: SaveUserPayload = {
            name: formData.name.trim(),
            username: formData.username.trim(),
            email: formData.email.trim(),
            role: formData.role,
            instrumentId: formData.instrumentId,
            instrumentLabel: formData.instrumentLabel,
            bio: formData.bio,
            voice: formData.voice,
            ...(!isEdit && formData.password
                ? { temporaryPassword: formData.password }
                : {}),
        };

        try {
            const result = await saveUserAction(payload, file, id);

            if (result.operation === 'created') {
                await Swal.fire({
                    title: 'Usuario creado',
                    text: 'Esta contraseña temporal solo se mostrará una vez. Cópiala y compártela de forma segura.',
                    icon: 'success',
                    input: 'text',
                    inputValue: result.temporaryPassword,
                    inputAttributes: {
                        readonly: 'true',
                        autocapitalize: 'off',
                    },
                    confirmButtonText: 'Copiar y continuar',
                    showCancelButton: true,
                    cancelButtonText: 'Continuar sin copiar',
                    heightAuto: false,
                    preConfirm: async () => {
                        await navigator.clipboard.writeText(result.temporaryPassword);
                    },
                });
            } else {
                await Swal.fire(
                    'Usuario actualizado',
                    result.sessionsRevoked
                        ? 'Los cambios fueron guardados y las sesiones anteriores fueron revocadas.'
                        : 'Los cambios fueron guardados correctamente.',
                    'success',
                );
            }

            navigate(usersPath);
        } catch {
            Swal.fire('Error', 'No se pudo guardar el usuario', 'error');
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
                                {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                {contextLabel
                                    ? `Gestiona este usuario dentro de ${contextLabel}.`
                                    : 'Gestiona datos personales, rol, instrumento, voz y foto de perfil.'}
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => navigate(usersPath)}
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
                                lg: 'minmax(0, 1fr) 280px',
                            },
                            gap: {
                                xs: 2,
                                lg: 3,
                            },
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
                                        md: 'repeat(2, minmax(0, 1fr))',
                                    },
                                    gap: 1.5,
                                }}
                            >
                                <TextField
                                    type="text"
                                    name="name"
                                    label="Nombre completo *"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />

                                <TextField
                                    type="text"
                                    name="username"
                                    label="Usuario *"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />
                            </Box>

                            <TextField
                                type="email"
                                name="email"
                                label="Correo electrónico *"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
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
                                <FormControl fullWidth disabled={loading}>
                                    <InputLabel id="user-role-label">Rol *</InputLabel>
                                    <Select
                                        labelId="user-role-label"
                                        value={formData.role}
                                        label="Rol *"
                                        onChange={handleRoleChange}
                                    >
                                        {availableRoleOptions.map((roleOption) => (
                                            <MenuItem key={roleOption.value} value={roleOption.value}>
                                                {roleOption.label} ({roleOption.description})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

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
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.voice}
                                            onChange={handleChange}
                                            name="voice"
                                            disabled={loading}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography sx={{ fontWeight: 950 }}>
                                                ¿Es cantante? (Voz)
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    color: 'var(--color-secondary-text)',
                                                    fontWeight: 700,
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                Activa esta opción si el usuario también participa con voz.
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

                            <TextField
                                name="bio"
                                label="Biografía"
                                value={formData.bio}
                                onChange={handleChange}
                                disabled={loading}
                                multiline
                                minRows={3}
                            />

                            {!isEdit && (
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
                                        type="password"
                                        name="password"
                                        label="Contraseña temporal (opcional)"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        helperText={TEMPORARY_PASSWORD_HELP_TEXT}
                                        slotProps={{
                                            htmlInput: {
                                                minLength: 12,
                                                maxLength: 128,
                                            },
                                        }}
                                    />

                                    <TextField
                                        type="password"
                                        name="confirmPassword"
                                        label="Confirmar contraseña temporal"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Box>
                            )}
                        </Box>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor:
                                    'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                border: '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
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
                                src={previewUrl || '/dist/images/default-user.png'}
                                alt="Vista previa"
                                sx={{
                                    width: 150,
                                    height: 150,
                                    mx: 'auto',
                                    mb: 1.5,
                                    border: '3px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
                                    bgcolor: 'var(--color-primary)',
                                    color: 'var(--color-button-text)',
                                    fontSize: '2.5rem',
                                    fontWeight: 950,
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
                                Elegir foto
                                <input hidden type="file" accept="image/*" onChange={handleFileChange} />
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
                            onClick={() => navigate(usersPath)}
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
                            {loading ? 'Guardando...' : 'Guardar Usuario'}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <InstrumentPickerModal
                show={showInstrumentPicker}
                onClose={() => setShowInstrumentPicker(false)}
                instruments={instruments}
                selectedInstrumentId={formData.instrumentId || null}
                onSelectInstrument={handleInstrumentSelected}
            />
        </Box>
    );
};