// src/pages/auth/ChangePassword.tsx

import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { getAuthErrorMessage } from '../../auth/authErrorMessages';
import { useAuth } from '../../context/AuthContext';
import { MuiAppThemeProvider } from '../../theme/mui/MuiAppThemeProvider';
import type { ApiErrorResponse } from '../../types/api/http';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,128}$/;
const CHANGE_PASSWORD_FALLBACK = 'No fue posible cambiar la contraseña.';

export const ChangePassword = () => {
    const navigate = useNavigate();
    const {
        accessMode,
        changePassword,
        requiresPasswordChange,
        status,
        user,
    } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (submitting) {
            return;
        }

        if (status === 'unauthenticated') {
            navigate('/auth/login', { replace: true });
            return;
        }

        if (status === 'authenticated' && !requiresPasswordChange) {
            navigate(accessMode === 'platform' ? '/admin/choirs' : '/admin', {
                replace: true,
            });
        }
    }, [accessMode, navigate, requiresPasswordChange, status, submitting]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setErrorMessage('');

        if (!currentPassword) {
            setErrorMessage('Ingresa la contraseña temporal actual.');
            return;
        }

        if (!PASSWORD_PATTERN.test(newPassword)) {
            setErrorMessage(
                'La nueva contraseña debe tener entre 12 y 128 caracteres e incluir mayúscula, minúscula, número y símbolo.',
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('La confirmación no coincide con la nueva contraseña.');
            return;
        }

        setSubmitting(true);

        try {
            await changePassword({ currentPassword, newPassword });
            navigate(accessMode === 'platform' ? '/admin/choirs' : '/admin', {
                replace: true,
            });
        } catch (error) {
            const message = axios.isAxiosError<ApiErrorResponse>(error)
                ? getAuthErrorMessage(
                    error.response?.data?.code,
                    CHANGE_PASSWORD_FALLBACK,
                )
                : CHANGE_PASSWORD_FALLBACK;

            setErrorMessage(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MuiAppThemeProvider>
            <Box
                component="main"
                sx={{
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                    px: 2,
                    py: 4,
                    background:
                        'linear-gradient(135deg, color-mix(in srgb, var(--color-background) 92%, var(--color-primary) 8%) 0%, var(--color-background) 60%, color-mix(in srgb, var(--color-background) 90%, var(--color-accent) 10%) 100%)',
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        maxWidth: 540,
                        p: { xs: 2.5, sm: 4 },
                        borderRadius: 3,
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-card)',
                        boxShadow: '0 20px 70px rgba(15, 23, 42, 0.16)',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Avatar
                            sx={{
                                width: 72,
                                height: 72,
                                mx: 'auto',
                                mb: 2,
                                bgcolor: 'var(--color-primary)',
                            }}
                        >
                            <LockResetRoundedIcon fontSize="large" />
                        </Avatar>
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 950 }}>
                            Crea una contraseña nueva
                        </Typography>
                        <Typography sx={{ mt: 1, color: 'var(--color-secondary-text)' }}>
                            {user?.name
                                ? `${user.name}, debes reemplazar la contraseña temporal antes de continuar.`
                                : 'Debes reemplazar la contraseña temporal antes de continuar.'}
                        </Typography>
                    </Box>

                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
                        <TextField
                            type={showCurrentPassword ? 'text' : 'password'}
                            label="Contraseña temporal actual"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            required
                            autoComplete="current-password"
                            disabled={submitting}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={showCurrentPassword
                                                    ? 'Ocultar contraseña temporal'
                                                    : 'Mostrar contraseña temporal'}
                                                onClick={() => setShowCurrentPassword((current) => !current)}
                                                edge="end"
                                            >
                                                {showCurrentPassword
                                                    ? <VisibilityOffRoundedIcon />
                                                    : <VisibilityRoundedIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            type={showNewPassword ? 'text' : 'password'}
                            label="Nueva contraseña"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                            autoComplete="new-password"
                            disabled={submitting}
                            helperText="Mínimo 12 caracteres con mayúscula, minúscula, número y símbolo."
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={showNewPassword
                                                    ? 'Ocultar nueva contraseña'
                                                    : 'Mostrar nueva contraseña'}
                                                onClick={() => setShowNewPassword((current) => !current)}
                                                edge="end"
                                            >
                                                {showNewPassword
                                                    ? <VisibilityOffRoundedIcon />
                                                    : <VisibilityRoundedIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            type={showNewPassword ? 'text' : 'password'}
                            label="Confirmar nueva contraseña"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                            autoComplete="new-password"
                            disabled={submitting}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={submitting || status !== 'authenticated'}
                            startIcon={submitting
                                ? <CircularProgress size={18} color="inherit" />
                                : <LockResetRoundedIcon />}
                            sx={{ minHeight: 48, mt: 1, fontWeight: 900 }}
                        >
                            {submitting ? 'Actualizando contraseña...' : 'Guardar y continuar'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </MuiAppThemeProvider>
    );
};
