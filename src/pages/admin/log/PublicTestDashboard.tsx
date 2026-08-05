// src/pages/admin/log/PublicTestDashboard.tsx

import { useEffect, useState, type ReactNode } from 'react';

import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Typography,
} from '@mui/material';

import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useSongStore } from '../../../store/public/useSongStore';
import { useGalleryStore } from '../../../store/public/useGalleryStore';
import { useSettingsStore } from '../../../store/public/useSettingsStore';
import { useMemberStore } from '../../../store/public/useMemberStore';
import { useThemeStore } from '../../../store/public/useThemeStore';



interface SectionHeaderProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
}

interface SummaryCardProps {
    label: string;
    value: number | string;
    icon: ReactNode;
}

const SectionHeader = ({ title, subtitle, icon }: SectionHeaderProps) => {
    return (
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
                    {icon}
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
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.4,
                            color: 'var(--color-secondary-text)',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                        }}
                    >
                        {subtitle}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};

const SummaryCard = ({ label, value, icon }: SummaryCardProps) => {
    return (
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
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                minWidth: 0,
            }}
        >
            <Box
                sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--color-button-text)',
                    background:
                        'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>

            <Box sx={{ minWidth: 0 }}>
                <Typography
                    sx={{
                        color: 'var(--color-secondary-text)',
                        fontWeight: 900,
                        fontSize: '0.76rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}
                >
                    {label}
                </Typography>

                <Typography
                    sx={{
                        mt: 0.1,
                        color: 'var(--color-text)',
                        fontWeight: 950,
                        fontSize: '1.45rem',
                        lineHeight: 1.05,
                    }}
                >
                    {value}
                </Typography>
            </Box>
        </Paper>
    );
};

export const PublicTestDashboard = () => {
    const { songs, fetchSongs } = useSongStore();
    const { images, fetchGallery } = useGalleryStore();
    const { settings, fetchSettings } = useSettingsStore();
    const { members, fetchMembers } = useMemberStore();
    const { themes, fetchThemes } = useThemeStore();

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        const loadAllPublicData = async () => {
            setLoading(true);
            setLoadError('');

            try {
                await Promise.all([
                    fetchSongs(),
                    fetchGallery(),
                    fetchSettings(),
                    fetchMembers(),
                    fetchThemes(),
                ]);
            } catch {
                setLoadError('No se pudieron cargar todos los datos públicos de prueba.');
            } finally {
                setLoading(false);
            }
        };

        void loadAllPublicData();
    }, [fetchSongs, fetchGallery, fetchSettings, fetchMembers, fetchThemes]);

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
            <SectionHeader
                title="Panel Público de Pruebas"
                subtitle="Vista técnica para validar datos públicos cargados desde stores públicos."
                icon={<BugReportRoundedIcon />}
            />

            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: 0,
                    p: {
                        xs: 1.25,
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
                {loading ? (
                    <Box
                        sx={{
                            height: '100%',
                            minHeight: 320,
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress />
                            <Typography sx={{ mt: 2, fontWeight: 800 }}>
                                Cargando datos públicos...
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            height: '100%',
                            minHeight: 0,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        {loadError && (
                            <Alert severity="warning" sx={{ borderRadius: 1.5, fontWeight: 800 }}>
                                {loadError}
                            </Alert>
                        )}

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, minmax(0, 1fr))',
                                    xl: 'repeat(5, minmax(0, 1fr))',
                                },
                                gap: 1.5,
                            }}
                        >
                            <SummaryCard label="Cantos" value={songs.length} icon={<MusicNoteRoundedIcon />} />
                            <SummaryCard label="Galería" value={images.length} icon={<CollectionsRoundedIcon />} />
                            <SummaryCard label="Miembros" value={members.length} icon={<GroupsRoundedIcon />} />
                            <SummaryCard label="Themes" value={themes.length} icon={<PaletteRoundedIcon />} />
                            <SummaryCard label="Settings" value={settings ? 'OK' : 'N/A'} icon={<SettingsRoundedIcon />} />
                        </Box>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    lg: 'repeat(2, minmax(0, 1fr))',
                                },
                                gap: 2,
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%)',
                                    border:
                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                    color: 'var(--color-text)',
                                }}
                            >
                                <Typography
                                    component="h2"
                                    sx={{
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        fontSize: '1.15rem',
                                        fontWeight: 950,
                                    }}
                                >
                                    <MusicNoteRoundedIcon />
                                    Cantos ({songs.length})
                                </Typography>

                                <Box
                                    component="ul"
                                    sx={{
                                        m: 0,
                                        pl: 2.25,
                                        maxHeight: 190,
                                        overflowY: 'auto',
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                        '&::-webkit-scrollbar': {
                                            display: 'none',
                                        },
                                    }}
                                >
                                    {songs.slice(0, 5).map((song) => (
                                        <Box
                                            component="li"
                                            key={song.id}
                                            sx={{
                                                mb: 0.75,
                                                fontWeight: 800,
                                                overflowWrap: 'anywhere',
                                            }}
                                        >
                                            {song.title} - {song.songTypeName}
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%)',
                                    border:
                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                    color: 'var(--color-text)',
                                }}
                            >
                                <Typography
                                    component="h2"
                                    sx={{
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        fontSize: '1.15rem',
                                        fontWeight: 950,
                                    }}
                                >
                                    <ImageRoundedIcon />
                                    Galería ({images.length})
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: 'repeat(2, minmax(0, 1fr))',
                                            sm: 'repeat(3, minmax(0, 1fr))',
                                        },
                                        gap: 1,
                                    }}
                                >
                                    {images.slice(0, 3).map((image) => (
                                        <Box
                                            key={image.id}
                                            component="img"
                                            src={image.imageUrl}
                                            alt={image.title}
                                            sx={{
                                                width: '100%',
                                                height: 116,
                                                borderRadius: 1.5,
                                                objectFit: 'cover',
                                                display: 'block',
                                                border:
                                                    '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Paper>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%)',
                                    border:
                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                    color: 'var(--color-text)',
                                }}
                            >
                                <Typography
                                    component="h2"
                                    sx={{
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        fontSize: '1.15rem',
                                        fontWeight: 950,
                                    }}
                                >
                                    <GroupsRoundedIcon />
                                    Miembros ({members.length})
                                </Typography>

                                <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
                                    {members.slice(0, 5).map((member) => (
                                        <Box
                                            component="li"
                                            key={member.id}
                                            sx={{
                                                mb: 0.75,
                                                fontWeight: 800,
                                                overflowWrap: 'anywhere',
                                            }}
                                        >
                                            {member.name} - {member.instrument}
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%)',
                                    border:
                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                    color: 'var(--color-text)',
                                }}
                            >
                                <Typography
                                    component="h2"
                                    sx={{
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        fontSize: '1.15rem',
                                        fontWeight: 950,
                                    }}
                                >
                                    <PaletteRoundedIcon />
                                    Themes ({themes.length})
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 1,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {themes.map((theme) => (
                                        <Chip
                                            key={theme.id}
                                            label={`${theme.name} · ${theme.isDark ? 'Dark' : 'Light'}`}
                                            sx={{
                                                fontWeight: 950,
                                                color: theme.buttonTextColor || '#ffffff',
                                                backgroundColor: theme.primaryColor,
                                                border:
                                                    '1px solid color-mix(in srgb, var(--color-border) 38%, transparent)',
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Paper>
                        </Box>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor:
                                    'color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%)',
                                border: '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                color: 'var(--color-text)',
                            }}
                        >
                            <Typography
                                component="h2"
                                sx={{
                                    mb: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    fontSize: '1.15rem',
                                    fontWeight: 950,
                                }}
                            >
                                <SettingsRoundedIcon />
                                Settings
                            </Typography>

                            <Divider
                                sx={{
                                    mb: 1.5,
                                    borderColor:
                                        'color-mix(in srgb, var(--color-border) 36%, transparent)',
                                }}
                            />

                            <Box
                                component="pre"
                                sx={{
                                    m: 0,
                                    p: 1.5,
                                    maxHeight: 320,
                                    overflow: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    borderRadius: 1.5,
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-card) 82%, var(--color-primary) 18%)',
                                    border:
                                        '1px solid color-mix(in srgb, var(--color-border) 24%, transparent)',
                                    color: 'var(--color-text)',
                                    fontSize: '0.82rem',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    '&::-webkit-scrollbar': {
                                        display: 'none',
                                    },
                                }}
                            >
                                {JSON.stringify(settings, null, 2)}
                            </Box>
                        </Paper>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};