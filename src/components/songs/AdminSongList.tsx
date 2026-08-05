// src/components/songs/AdminSongList.tsx

import { useEffect, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    CircularProgress,
    Paper,
    Typography,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { useSongStore } from '../../store/admin/useSongStore';
import { useSongTypeStore } from '../../store/admin/useSongTypeStore';
import { useAuth } from '../../context/AuthContext';
import type { Song } from '../../types';
import { capitalizeWord } from '../../utils';

interface SongButtonListProps {
    songList: Song[];
}

interface SectionHeaderProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
    action?: ReactNode;
}

const SectionHeader = ({ title, subtitle, icon, action }: SectionHeaderProps) => {
    return (
        <Paper
            elevation={0}
            sx={{
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
                        }}
                    >
                        {icon}
                    </Box>

                    <Box>
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

                {action}
            </Box>
        </Paper>
    );
};

const SongButtonList = ({ songList }: SongButtonListProps) => {
    if (!songList.length) {
        return (
            <Typography
                sx={{
                    color: 'var(--color-secondary-text)',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    py: 1,
                }}
            >
                No hay cantos en esta categoría.
            </Typography>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 1,
            }}
        >
            {songList.map((song) => (
                <Button
                    key={song.id}
                    component={RouterLink}
                    to={`/admin/song/${song.id}`}
                    variant="contained"
                    startIcon={<MusicNoteRoundedIcon />}
                    sx={{
                        borderRadius: 1.5,
                        px: 2,
                        py: 0.85,
                        fontWeight: 950,
                        maxWidth: {
                            xs: '100%',
                            sm: 320,
                        },
                        whiteSpace: 'normal',
                        textAlign: 'center',
                    }}
                >
                    {song.title}
                </Button>
            ))}
        </Box>
    );
};

export const AdminSongList = () => {
    const { songs, loading, fetchSongs } = useSongStore();
    const { types, fetchTypes } = useSongTypeStore();
    const { canManageContent } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([fetchTypes(), fetchSongs()]);
            } catch {
                console.error('Error loading songs.');
            }
        };

        void loadData();
    }, [fetchSongs, fetchTypes]);

    const rootTypes = types
        .filter((typeItem) => !typeItem.parentId)
        .sort((firstType, secondType) => firstType.order - secondType.order);

    const getChildTypes = (parentId: string) =>
        types
            .filter((typeItem) => typeItem.parentId === parentId)
            .sort((firstType, secondType) => firstType.order - secondType.order);

    const getSongsByTypeId = (typeId: string) =>
        songs.filter((song) => song.songTypeId === typeId);

    const existingTypeIds = new Set(types.map((typeItem) => typeItem.id));
    const uncategorizedSongs = songs.filter(
        (song) => !song.songTypeId || !existingTypeIds.has(song.songTypeId),
    );

    return (
        <Box
            component="section"
            sx={{
                width: '100%',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <SectionHeader
                title="Cantos"
                subtitle="Administra y consulta los cantos del coro."
                icon={<QueueMusicRoundedIcon />}
                action={
                    canManageContent ? (
                        <Button
                            component={RouterLink}
                            to="/admin/songs/new"
                            variant="contained"
                            startIcon={<AddRoundedIcon />}
                            sx={{
                                borderRadius: 1.5,
                                px: 2,
                                py: 0.9,
                                fontWeight: 950,
                            }}
                        >
                            Nuevo Canto
                        </Button>
                    ) : null
                }
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
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {loading ? (
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 320,
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress />
                            <Typography sx={{ mt: 2, fontWeight: 800 }}>
                                Cargando cantos...
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                            pr: {
                                xs: 0,
                                md: 0.5,
                            },
                        }}
                    >
                        {rootTypes.length === 0 && uncategorizedSongs.length === 0 ? (
                            <Typography
                                sx={{
                                    py: 5,
                                    textAlign: 'center',
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                }}
                            >
                                No hay tipos de canto ni cantos disponibles.
                            </Typography>
                        ) : (
                            <>
                                {rootTypes.map((rootType) => {
                                    const childTypes = getChildTypes(rootType.id);
                                    const rootSongs = getSongsByTypeId(rootType.id);
                                    const hasChildren = childTypes.length > 0;
                                    const hasRootSongs = rootSongs.length > 0;

                                    return (
                                        <Accordion
                                            key={rootType.id}
                                            disableGutters
                                            sx={{
                                                mb: 1,
                                                borderRadius: '12px !important',
                                                overflow: 'hidden',
                                                backgroundColor:
                                                    'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                                border:
                                                    '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                                boxShadow:
                                                    'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 12%, transparent), 0 8px 24px rgba(15, 23, 42, 0.045)',
                                                '&::before': {
                                                    display: 'none',
                                                },
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={
                                                    <ExpandMoreRoundedIcon
                                                        sx={{ color: 'var(--color-primary)' }}
                                                    />
                                                }
                                                sx={{
                                                    minHeight: 58,
                                                    '& .MuiAccordionSummary-content': {
                                                        alignItems: 'center',
                                                        gap: 1,
                                                    },
                                                }}
                                            >
                                                {rootType.isParent ? (
                                                    <FolderRoundedIcon sx={{ color: '#facc15' }} />
                                                ) : (
                                                    <MusicNoteRoundedIcon sx={{ color: 'var(--color-primary)' }} />
                                                )}

                                                <Typography sx={{ fontWeight: 950 }}>
                                                    {rootType.isParent
                                                        ? capitalizeWord(rootType.name)
                                                        : capitalizeWord(rootType.name)}
                                                </Typography>
                                            </AccordionSummary>

                                            <AccordionDetails
                                                sx={{
                                                    p: {
                                                        xs: 1.25,
                                                        md: 2,
                                                    },
                                                    backgroundColor:
                                                        rootType.isParent
                                                            ? 'color-mix(in srgb, var(--color-card) 92%, var(--color-primary) 8%)'
                                                            : 'var(--color-card)',
                                                }}
                                            >
                                                {rootType.isParent && hasChildren && (
                                                    <Box sx={{ mb: hasRootSongs ? 2 : 0 }}>
                                                        {childTypes.map((childType) => {
                                                            const childSongs = getSongsByTypeId(childType.id);

                                                            return (
                                                                <Accordion
                                                                    key={childType.id}
                                                                    disableGutters
                                                                    sx={{
                                                                        mb: 1,
                                                                        borderRadius: '10px !important',
                                                                        overflow: 'hidden',
                                                                        backgroundColor:
                                                                            'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                                                        border:
                                                                            '1px solid color-mix(in srgb, var(--color-border) 30%, transparent)',
                                                                        boxShadow: 'none',
                                                                        '&::before': {
                                                                            display: 'none',
                                                                        },
                                                                    }}
                                                                >
                                                                    <AccordionSummary
                                                                        expandIcon={
                                                                            <ExpandMoreRoundedIcon
                                                                                sx={{
                                                                                    color: 'var(--color-primary)',
                                                                                }}
                                                                            />
                                                                        }
                                                                    >
                                                                        <Typography sx={{ fontWeight: 900 }}>
                                                                            {capitalizeWord(childType.name)}
                                                                        </Typography>
                                                                    </AccordionSummary>

                                                                    <AccordionDetails>
                                                                        <SongButtonList songList={childSongs} />
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            );
                                                        })}
                                                    </Box>
                                                )}

                                                {hasRootSongs && (
                                                    <Box
                                                        sx={{
                                                            mt: rootType.isParent ? 2 : 0,
                                                            pt: rootType.isParent ? 2 : 0,
                                                            borderTop: rootType.isParent
                                                                ? '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)'
                                                                : 'none',
                                                        }}
                                                    >
                                                        {rootType.isParent && (
                                                            <Typography
                                                                sx={{
                                                                    color: 'var(--color-secondary-text)',
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: 800,
                                                                    mb: 1,
                                                                }}
                                                            >
                                                                Cantos directos en esta carpeta:
                                                            </Typography>
                                                        )}

                                                        <SongButtonList songList={rootSongs} />
                                                    </Box>
                                                )}

                                                {rootType.isParent && !hasChildren && !hasRootSongs && (
                                                    <Typography
                                                        sx={{
                                                            color: 'var(--color-secondary-text)',
                                                            fontWeight: 800,
                                                            textAlign: 'center',
                                                            py: 1,
                                                        }}
                                                    >
                                                        Carpeta vacía
                                                    </Typography>
                                                )}

                                                {!rootType.isParent && !hasRootSongs && (
                                                    <Typography
                                                        sx={{
                                                            color: 'var(--color-secondary-text)',
                                                            fontSize: '0.9rem',
                                                            fontWeight: 800,
                                                            py: 1,
                                                        }}
                                                    >
                                                        No hay cantos en esta categoría.
                                                    </Typography>
                                                )}
                                            </AccordionDetails>
                                        </Accordion>
                                    );
                                })}

                                {uncategorizedSongs.length > 0 && (
                                    <Accordion
                                        disableGutters
                                        sx={{
                                            mt: 1,
                                            borderRadius: '12px !important',
                                            overflow: 'hidden',
                                            backgroundColor:
                                                'color-mix(in srgb, var(--color-card) 88%, #f59e0b 12%)',
                                            border:
                                                '1px solid color-mix(in srgb, #f59e0b 34%, transparent)',
                                            boxShadow:
                                                'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 12%, transparent), 0 8px 24px rgba(15, 23, 42, 0.045)',
                                            '&::before': {
                                                display: 'none',
                                            },
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={
                                                <ExpandMoreRoundedIcon
                                                    sx={{ color: 'var(--color-primary)' }}
                                                />
                                            }
                                            sx={{
                                                '& .MuiAccordionSummary-content': {
                                                    alignItems: 'center',
                                                    gap: 1,
                                                },
                                            }}
                                        >
                                            <WarningAmberRoundedIcon sx={{ color: '#f59e0b' }} />
                                            <Typography sx={{ fontWeight: 950 }}>
                                                Sin tipo de Canto
                                            </Typography>
                                        </AccordionSummary>

                                        <AccordionDetails>
                                            <SongButtonList songList={uncategorizedSongs} />
                                        </AccordionDetails>
                                    </Accordion>
                                )}
                            </>
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
};