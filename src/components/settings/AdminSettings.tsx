// src/components/settings/AdminSettings.tsx

import {
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
} from 'react';
import Swal from 'sweetalert2';
import type { JSONContent } from '@tiptap/react';

import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Divider,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from '@mui/material';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

import { useAdminSettingsStore } from '../../store/admin/useSettingsStore';
import { useThemeStore } from '../../store/admin/useThemeStore';
import { useAuth } from '../../context/AuthContext';
import type { HomeLegends, SocialLinks, UpdateSettingsPayload } from '../../types/settings';

import { TiptapEditor } from '../tiptap-components/TiptapEditor';
import { parseText } from '../../utils/handleTextTipTap';
import { emptyEditorContent } from '../../utils/editorDefaults';
import type { TipTapContent } from '../../types/announcement';
import { writeChoirTheme } from '../../storage/choirThemeStorage';
import { writeActiveAdminThemeSnapshot } from '../../storage/adminThemeRuntimeStorage';
import { applyChoirThemeToDocument } from '../../utils/choirThemeDocument';
import { resolvePersonalThemeId } from '../../theme/themeHierarchy';

interface SettingsFormData {
    webTitle: string;
    contactPhone: string;
    socials: SocialLinks;
    homeLegends: HomeLegends;
    history: TipTapContent;
}

const defaultSocialLinks: SocialLinks = {
    facebook: '',
    instagram: '',
    youtube: '',
    whatsapp: '',
    email: '',
};

const defaultHomeLegends: HomeLegends = {
    principal: '',
    secondary: '',
};

const defaultFormData: SettingsFormData = {
    webTitle: '',
    contactPhone: '',
    socials: defaultSocialLinks,
    homeLegends: defaultHomeLegends,
    history: emptyEditorContent,
};

const normalizeHistoryContent = (history: TipTapContent | undefined): TipTapContent => {
    const parsedContent = parseText(history ?? emptyEditorContent);

    return {
        type: parsedContent.type ?? 'doc',
        content: parsedContent.content ?? [],
    };
};

const buildFormDataFromSettings = (settings: UpdateSettingsPayload): SettingsFormData => {
    return {
        webTitle: settings.webTitle ?? '',
        contactPhone: settings.contactPhone ?? '',
        socials: {
            facebook: settings.socials?.facebook ?? '',
            instagram: settings.socials?.instagram ?? '',
            youtube: settings.socials?.youtube ?? '',
            whatsapp: settings.socials?.whatsapp ?? '',
            email: settings.socials?.email ?? '',
        },
        homeLegends: {
            principal: settings.homeLegends?.principal ?? '',
            secondary: settings.homeLegends?.secondary ?? '',
        },
        history: normalizeHistoryContent(settings.history),
    };
};

const buildSettingsPayload = (formData: SettingsFormData): UpdateSettingsPayload => {
    return {
        webTitle: formData.webTitle,
        contactPhone: formData.contactPhone,
        socials: formData.socials,
        homeLegends: formData.homeLegends,
        history: formData.history,
    };
};

export const AdminSettings = () => {
    const {
        settings,
        loading,
        fetchSettings,
        updateSettings,
        updateActiveTheme,
    } = useAdminSettingsStore();
    const { themes, fetchThemes } = useThemeStore();
    const { user, choir, targetChoir, isSuperAdmin } = useAuth();
    const effectiveChoirCode = targetChoir?.code ?? choir?.code ?? user?.choirCode ?? '';
    const personalThemeId = resolvePersonalThemeId(user?.themeId);
    const personalThemeName = personalThemeId
        ? themes.find((theme) => theme.id === personalThemeId)?.name ?? ''
        : '';

    const [formData, setFormData] = useState<SettingsFormData>(defaultFormData);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [initialReady, setInitialReady] = useState(false);

    useEffect(() => {
        void fetchSettings();
        void fetchThemes();
    }, [fetchSettings, fetchThemes]);

    useEffect(() => {
        if (settings) {
            setFormData(buildFormDataFromSettings(settings));
            setPreviewUrl(settings.logoUrl || null);
            setInitialReady(true);
            return;
        }

        setFormData(defaultFormData);
        setInitialReady(true);
    }, [settings]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        setFormData((previousValue) => {
            switch (name) {
                case 'webTitle':
                    return {
                        ...previousValue,
                        webTitle: value,
                    };

                case 'contactPhone':
                    return {
                        ...previousValue,
                        contactPhone: value,
                    };

                case 'homeLegends.principal':
                    return {
                        ...previousValue,
                        homeLegends: {
                            ...previousValue.homeLegends,
                            principal: value,
                        },
                    };

                case 'homeLegends.secondary':
                    return {
                        ...previousValue,
                        homeLegends: {
                            ...previousValue.homeLegends,
                            secondary: value,
                        },
                    };

                case 'socials.facebook':
                    return {
                        ...previousValue,
                        socials: {
                            ...previousValue.socials,
                            facebook: value,
                        },
                    };

                case 'socials.instagram':
                    return {
                        ...previousValue,
                        socials: {
                            ...previousValue.socials,
                            instagram: value,
                        },
                    };

                case 'socials.youtube':
                    return {
                        ...previousValue,
                        socials: {
                            ...previousValue.socials,
                            youtube: value,
                        },
                    };

                case 'socials.whatsapp':
                    return {
                        ...previousValue,
                        socials: {
                            ...previousValue.socials,
                            whatsapp: value,
                        },
                    };

                case 'socials.email':
                    return {
                        ...previousValue,
                        socials: {
                            ...previousValue.socials,
                            email: value,
                        },
                    };

                default:
                    return previousValue;
            }
        });
    };

    const handleHistoryChange = (content: JSONContent) => {
        const parsedContent = parseText(content);

        setFormData((previousValue) => ({
            ...previousValue,
            history: {
                type: parsedContent.type ?? 'doc',
                content: parsedContent.content ?? [],
            },
        }));
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        setLogoFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleGlobalThemeChange = async (themeId: string): Promise<void> => {
        if (!themeId || !effectiveChoirCode) {
            return;
        }

        try {
            const updatedSettings = await updateActiveTheme(themeId);
            const globalTheme = updatedSettings.activeTheme;

            if (globalTheme) {
                writeChoirTheme(effectiveChoirCode, globalTheme);

                const personalOverrideIsActive = !isSuperAdmin && Boolean(personalThemeId);

                if (!personalOverrideIsActive) {
                    applyChoirThemeToDocument(globalTheme, effectiveChoirCode);
                    writeActiveAdminThemeSnapshot({
                        choirCode: effectiveChoirCode,
                        userId: null,
                        source: 'global',
                        theme: globalTheme,
                    });
                }
            }

            Swal.fire({
                icon: 'success',
                title: '¡Tema global actualizado!',
                text: personalThemeId && !isSuperAdmin
                    ? 'La página pública y los usuarios sin tema personal usarán este tema. Tu consola conserva tu tema personal.'
                    : 'El tema se aplicó al coro y a su página pública.',
                timer: 2200,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo cambiar el tema global del coro.', 'error');
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationErrors: string[] = [];

        if (!formData.webTitle.trim()) {
            validationErrors.push('El título de la página es obligatorio.');
        }

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const submissionData = new FormData();
            const payload = buildSettingsPayload(formData);

            submissionData.append('data', JSON.stringify(payload));

            if (logoFile) {
                submissionData.append('file', logoFile);
            }

            await updateSettings(submissionData);

            setErrors([]);

            Swal.fire({
                icon: 'success',
                title: '¡Configuración actualizada!',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo actualizar la configuración.', 'error');
        }
    };

    if (loading && !initialReady) {
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
                        Cargando configuración...
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
                            <SettingsRoundedIcon />
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
                                Configuración General
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                Administra título, logo, leyendas, historia y enlaces de contacto.
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => window.history.back()}
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
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: 'repeat(2, minmax(0, 1fr))',
                                    },
                                    gap: 1.5,
                                    paddingTop: 0.7
                                }}
                            >
                                <TextField
                                    type="text"
                                    name="webTitle"
                                    label="Título de la página"
                                    value={formData.webTitle}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />

                                <TextField
                                    type="text"
                                    name="contactPhone"
                                    label="Teléfono de contacto"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Box>

                            <TextField
                                type="text"
                                name="homeLegends.principal"
                                label="Título principal de inicio"
                                value={formData.homeLegends.principal}
                                onChange={handleChange}
                                disabled={loading}
                            />

                            <TextField
                                type="text"
                                name="homeLegends.secondary"
                                label="Leyenda secundaria de inicio"
                                value={formData.homeLegends.secondary}
                                onChange={handleChange}
                                disabled={loading}
                                multiline
                                minRows={2}
                            />

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%)',
                                    border:
                                        '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 1.25,
                                    }}
                                >
                                    <PaletteRoundedIcon sx={{ color: 'var(--color-primary)' }} />
                                    <Box>
                                        <Typography sx={{ fontWeight: 950 }}>
                                            Tema global del coro
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: 'var(--color-secondary-text)',
                                                fontWeight: 700,
                                                fontSize: '0.84rem',
                                            }}
                                        >
                                            Controla la página pública y es el tema predeterminado del Admin.
                                        </Typography>
                                    </Box>
                                </Box>

                                <TextField
                                    select
                                    fullWidth
                                    label="Tema global"
                                    value={settings?.activeThemeId ?? ''}
                                    onChange={(event) => void handleGlobalThemeChange(event.target.value)}
                                    disabled={loading || themes.length === 0}
                                    helperText={
                                        personalThemeId && !isSuperAdmin
                                            ? `Tu consola mantiene tu tema personal${personalThemeName ? ` (${personalThemeName})` : ''}.`
                                            : 'Este tema también se usa en tu consola mientras no exista un tema personal.'
                                    }
                                >
                                    {themes.map((theme) => (
                                        <MenuItem key={theme.id} value={theme.id}>
                                            {theme.name} · {theme.isDark ? 'Oscuro' : 'Claro'}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Paper>

                            <Box>
                                <Typography sx={{ mb: 1, fontWeight: 950 }}>
                                    Historia / Nosotros
                                </Typography>

                                <TiptapEditor
                                    content={parseText(formData.history)}
                                    onChange={handleHistoryChange}
                                />
                            </Box>

                            <Divider
                                sx={{
                                    borderColor: 'color-mix(in srgb, var(--color-border) 36%, transparent)',
                                }}
                            />

                            <Typography
                                component="h2"
                                sx={{
                                    fontSize: '1.15rem',
                                    fontWeight: 950,
                                }}
                            >
                                Redes Sociales
                            </Typography>

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
                                    name="socials.facebook"
                                    label="Facebook"
                                    value={formData.socials.facebook}
                                    onChange={handleChange}
                                    disabled={loading}
                                />

                                <TextField
                                    type="text"
                                    name="socials.instagram"
                                    label="Instagram"
                                    value={formData.socials.instagram}
                                    onChange={handleChange}
                                    disabled={loading}
                                />

                                <TextField
                                    type="text"
                                    name="socials.youtube"
                                    label="YouTube"
                                    value={formData.socials.youtube}
                                    onChange={handleChange}
                                    disabled={loading}
                                />

                                <TextField
                                    type="text"
                                    name="socials.whatsapp"
                                    label="WhatsApp"
                                    value={formData.socials.whatsapp}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Box>

                            <TextField
                                type="email"
                                name="socials.email"
                                label="Correo (Email)"
                                value={formData.socials.email}
                                onChange={handleChange}
                                disabled={loading}
                            />

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
                                Logo del sitio
                            </Typography>

                            <Avatar
                                src={previewUrl || undefined}
                                alt="Logo del sitio"
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
                                EC
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
                                Elegir logo
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
                                Si seleccionas un nuevo logo, reemplazará el actual.
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
                            onClick={() => window.history.back()}
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
                            {loading ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};