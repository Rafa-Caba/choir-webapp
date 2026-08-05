// src/pages/auth/Login.tsx

import {
    useEffect,
    useState,
    type FormEvent,
    type MouseEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Alert,
    AppBar,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Typography,
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { AdminFooter } from '../../components/components-admin/AdminFooter';
import { getAuthErrorMessage } from '../../auth/authErrorMessages';
import { useAuth } from '../../context/AuthContext';
import { MuiAppThemeProvider } from '../../theme/mui/MuiAppThemeProvider';
import type { ApiErrorResponse } from '../../types/api/http';
import type { AccessMode } from '../../types/auth';

const TENANT_LOGIN_FALLBACK = 'No fue posible iniciar sesión en el coro.';
const PLATFORM_LOGIN_FALLBACK = 'No fue posible iniciar sesión en la plataforma.';

export const Login = () => {
    const navigate = useNavigate();
    const {
        accessMode: activeAccessMode,
        clearError,
        errorMessage: sessionErrorMessage,
        lastChoirCode,
        loginPlatform,
        loginTenant,
        requiresPasswordChange,
        status,
    } = useAuth();

    const [selectedMode, setSelectedMode] = useState<AccessMode>('tenant');
    const [choirCode, setChoirCode] = useState(lastChoirCode);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formErrorMessage, setFormErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (submitting || status !== 'authenticated') {
            return;
        }

        if (requiresPasswordChange) {
            navigate('/auth/change-password', { replace: true });
            return;
        }

        navigate(
            activeAccessMode === 'platform' ? '/admin/choirs' : '/admin',
            { replace: true },
        );
    }, [activeAccessMode, navigate, requiresPasswordChange, status, submitting]);

    const handleModeChange = (
        _event: MouseEvent<HTMLElement>,
        nextMode: AccessMode | null,
    ): void => {
        if (!nextMode || submitting) {
            return;
        }

        clearError();
        setFormErrorMessage('');
        setSelectedMode(nextMode);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        clearError();
        setFormErrorMessage('');

        const normalizedIdentifier = identifier.trim();
        const normalizedChoirCode = choirCode.trim().toLowerCase();

        if (selectedMode === 'tenant' && normalizedChoirCode.length < 2) {
            setFormErrorMessage('Ingresa el código del coro.');
            return;
        }

        if (normalizedIdentifier.length < 3) {
            setFormErrorMessage('Ingresa tu usuario o correo electrónico.');
            return;
        }

        if (!password) {
            setFormErrorMessage('Ingresa tu contraseña.');
            return;
        }

        setSubmitting(true);

        try {
            const session = selectedMode === 'tenant'
                ? await loginTenant({
                    choirCode: normalizedChoirCode,
                    identifier: normalizedIdentifier,
                    password,
                })
                : await loginPlatform({
                    identifier: normalizedIdentifier,
                    password,
                });

            if (session.requiresPasswordChange) {
                navigate('/auth/change-password', { replace: true });
                return;
            }

            navigate(
                selectedMode === 'platform' ? '/admin/choirs' : '/admin',
                { replace: true },
            );
        } catch (error) {
            const fallbackMessage = selectedMode === 'tenant'
                ? TENANT_LOGIN_FALLBACK
                : PLATFORM_LOGIN_FALLBACK;
            const message = axios.isAxiosError<ApiErrorResponse>(error)
                ? getAuthErrorMessage(error.response?.data?.code, fallbackMessage)
                : fallbackMessage;

            setFormErrorMessage(message);
        } finally {
            setSubmitting(false);
        }
    };

    const visibleErrorMessage = formErrorMessage || sessionErrorMessage;

    return (
        <MuiAppThemeProvider>
            <Box
                sx={{
                    minHeight: '100vh',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowX: 'hidden',
                    background:
                        'linear-gradient(135deg, color-mix(in srgb, var(--color-background) 94%, var(--color-primary) 6%) 0%, var(--color-background) 55%, color-mix(in srgb, var(--color-background) 92%, var(--color-accent) 8%) 100%)',
                    color: 'var(--color-text)',
                }}
            >
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        background:
                            'linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 92%, #000 8%) 0%, var(--color-primary) 55%, var(--color-accent) 100%)',
                        borderBottom: '1px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
                    }}
                >
                    <Toolbar
                        sx={{
                            minHeight: '72px !important',
                            px: { xs: 1.5, sm: 2, md: 3 },
                            gap: 1.25,
                        }}
                    >
                        <Avatar
                            src="/images/erocrasLogo.png"
                            alt="Choir App"
                            sx={{
                                width: 44,
                                height: 44,
                                border: '1px solid rgba(255, 255, 255, 0.28)',
                                bgcolor: 'rgba(255, 255, 255, 0.18)',
                                color: 'var(--color-button-text)',
                                fontWeight: 950,
                            }}
                        >
                            CA
                        </Avatar>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 950,
                                    lineHeight: 1.1,
                                    color: 'var(--color-button-text)',
                                }}
                            >
                                Choir App
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: { xs: 'none', sm: 'block' },
                                    color: 'color-mix(in srgb, var(--color-button-text) 86%, transparent)',
                                    fontWeight: 800,
                                }}
                            >
                                Acceso administrativo seguro
                            </Typography>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        width: '100%',
                        display: 'grid',
                        placeItems: 'center',
                        px: { xs: 1.5, sm: 2, md: 3 },
                        py: { xs: 3, md: 5 },
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            maxWidth: 560,
                            p: { xs: 2, sm: 3, md: 4 },
                            borderRadius: 3,
                            backgroundColor: 'color-mix(in srgb, var(--color-card) 88%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--color-border) 88%, transparent)',
                            color: 'var(--color-text)',
                            boxShadow: '0 18px 60px rgba(15, 23, 42, 0.12)',
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Avatar
                                src="/images/erocrasLogo.png"
                                alt="Choir App"
                                sx={{
                                    width: { xs: 108, md: 126 },
                                    height: { xs: 108, md: 126 },
                                    mx: 'auto',
                                    mb: 2,
                                    border: '3px solid var(--color-primary)',
                                    boxShadow: '0 14px 38px rgba(15, 23, 42, 0.18)',
                                }}
                            />
                            <Typography
                                component="h1"
                                sx={{
                                    fontSize: { xs: '1.75rem', md: '2rem' },
                                    fontWeight: 950,
                                    lineHeight: 1.1,
                                }}
                            >
                                Iniciar sesión
                            </Typography>
                            <Typography
                                sx={{
                                    mt: 0.75,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 700,
                                }}
                            >
                                Selecciona el tipo de acceso correspondiente a tu cuenta.
                            </Typography>
                        </Box>

                        <ToggleButtonGroup
                            value={selectedMode}
                            exclusive
                            fullWidth
                            onChange={handleModeChange}
                            aria-label="Tipo de acceso"
                            sx={{ mb: 3 }}
                        >
                            <ToggleButton value="tenant" aria-label="Acceso de coro">
                                <GroupsRoundedIcon sx={{ mr: 1 }} />
                                Acceso de coro
                            </ToggleButton>
                            <ToggleButton value="platform" aria-label="Acceso de plataforma">
                                <SecurityRoundedIcon sx={{ mr: 1 }} />
                                Plataforma
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Divider sx={{ mb: 3 }} />

                        {visibleErrorMessage && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {visibleErrorMessage}
                            </Alert>
                        )}

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{ display: 'grid', gap: 2 }}
                        >
                            {selectedMode === 'tenant' && (
                                <TextField
                                    label="Código del coro"
                                    value={choirCode}
                                    onChange={(event) => setChoirCode(event.target.value)}
                                    placeholder="Ej. coro-san-jose"
                                    required
                                    autoComplete="organization"
                                    slotProps={{
                                        htmlInput: {
                                            minLength: 2,
                                            maxLength: 60,
                                            pattern: '[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*',
                                        },
                                    }}
                                    helperText="Usa el código proporcionado por el administrador de tu coro."
                                    disabled={submitting}
                                />
                            )}

                            <TextField
                                label="Usuario o correo"
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
                                required
                                autoComplete="username"
                                slotProps={{
                                    htmlInput: { minLength: 3, maxLength: 254 },
                                }}
                                disabled={submitting}
                            />

                            <TextField
                                type={showPassword ? 'text' : 'password'}
                                label="Contraseña"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                autoComplete="current-password"
                                disabled={submitting}
                                slotProps={{
                                    htmlInput: { maxLength: 128 },
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label={showPassword
                                                        ? 'Ocultar contraseña'
                                                        : 'Mostrar contraseña'}
                                                    onClick={() => setShowPassword((current) => !current)}
                                                    edge="end"
                                                >
                                                    {showPassword
                                                        ? <VisibilityOffRoundedIcon />
                                                        : <VisibilityRoundedIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={submitting || status === 'checking'}
                                startIcon={submitting
                                    ? <CircularProgress size={18} color="inherit" />
                                    : <LoginRoundedIcon />}
                                sx={{ mt: 1, minHeight: 48, fontWeight: 900 }}
                            >
                                {submitting ? 'Validando acceso...' : 'Entrar'}
                            </Button>
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{
                                mt: 3,
                                textAlign: 'center',
                                color: 'var(--color-secondary-text)',
                            }}
                        >
                            Las cuentas son creadas por un administrador. No existe registro público.
                        </Typography>
                    </Paper>
                </Box>

                <AdminFooter />
            </Box>
        </MuiAppThemeProvider>
    );
};
