// src/components/components-public/SongsSection.tsx

import { useEffect, useState } from 'react';

import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Typography,
} from '@mui/material';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';

import { SongModal } from './SongModal';

import type { Song, SongType } from '../../types/song';
import { useSongStore } from '../../store/public/useSongStore';
import { useSongTypeStore } from '../../store/public/useSongTypeStore';

const sortSongTypes = (a: SongType, b: SongType) => {
    const orderA = typeof a.order === 'number' ? a.order : 99;
    const orderB = typeof b.order === 'number' ? b.order : 99;

    if (orderA !== orderB) {
        return orderA - orderB;
    }

    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();

    if (nameA < nameB) {
        return -1;
    }

    if (nameA > nameB) {
        return 1;
    }

    return 0;
};

export const SongsSection = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalSongs, setModalSongs] = useState<Song[]>([]);
    const [currentCategoryName, setCurrentCategoryName] = useState('');
    const [currentParent, setCurrentParent] = useState<SongType | null>(null);

    const { songs, fetchSongs, loading } = useSongStore();
    const { types, fetchTypes } = useSongTypeStore();

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([fetchTypes(), fetchSongs()]);
            } catch (error) {
                console.error('Error loading songs data:', error);
            }
        };

        void loadData();
    }, [fetchSongs, fetchTypes]);

    const sortedTypes = [...types].sort(sortSongTypes);

    const visibleTypes = currentParent
        ? sortedTypes.filter((type) => type.parentId === currentParent.id)
        : sortedTypes.filter((type) => !type.parentId);

    const handleTypeClick = (type: SongType) => {
        if (type.isParent) {
            setCurrentParent(type);
            return;
        }

        openModal(type);
    };

    const handleBack = () => {
        setCurrentParent(null);
    };

    const openModal = (typeOrSpecial: SongType | 'SinTipo') => {
        if (typeOrSpecial === 'SinTipo') {
            setCurrentCategoryName('Sin categoría');

            const existingTypeIds = types.map((type) => type.id);
            const uncategorized = songs.filter(
                (song) => !song.songTypeId || !existingTypeIds.includes(song.songTypeId),
            );

            setModalSongs(uncategorized);
            setModalVisible(true);
            return;
        }

        const type = typeOrSpecial;
        setCurrentCategoryName(type.name);

        const matchingSongs = songs.filter((song) => song.songTypeId === type.id);
        setModalSongs(matchingSongs);
        setModalVisible(true);
    };

    const renderUncategorizedButton = () => {
        if (currentParent) {
            return null;
        }

        const existingTypeIds = types.map((type) => type.id);
        const hasUncategorized = songs.some(
            (song) => !song.songTypeId || !existingTypeIds.includes(song.songTypeId),
        );

        if (!hasUncategorized) {
            return null;
        }

        return (
            <Button
                variant="contained"
                onClick={() => openModal('SinTipo')}
                sx={{
                    borderRadius: 1.5,
                    px: 2,
                    py: 1,
                    backgroundColor: 'var(--color-button)',
                    color: 'var(--color-button-text)',
                    fontWeight: 900,
                    '&:hover': {
                        backgroundColor: 'var(--color-accent)',
                    },
                }}
            >
                Sin categoría
            </Button>
        );
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: 320,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--color-text)',
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2, fontWeight: 800 }}>
                        Cargando cantos...
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
                minWidth: 0,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    p: {
                        xs: 1.5,
                        sm: 2,
                        md: 3,
                    },
                    borderRadius: {
                        xs: 1.5,
                        md: 2,
                    },
                    backgroundColor: 'color-mix(in srgb, var(--color-card) 82%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 84%, transparent)',
                    color: 'var(--color-text)',
                    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
                    overflow: 'hidden',
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        minHeight: 42,
                    }}
                >
                    {currentParent && (
                        <Button
                            variant="text"
                            startIcon={<ArrowBackRoundedIcon />}
                            onClick={handleBack}
                            sx={{
                                position: {
                                    xs: 'static',
                                    md: 'absolute',
                                },
                                left: 0,
                                mr: {
                                    xs: 1,
                                    md: 0,
                                },
                                minWidth: {
                                    xs: 'auto',
                                    md: 0,
                                },
                                color: 'var(--color-primary)',
                                fontWeight: 900,
                                '& .MuiButton-startIcon': {
                                    mr: {
                                        xs: 0,
                                        sm: 0.75,
                                    },
                                },
                            }}
                        >
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                Volver
                            </Box>
                        </Button>
                    )}

                    <Typography
                        component="h1"
                        sx={{
                            m: 0,
                            fontSize: {
                                xs: '1.45rem',
                                md: '2rem',
                            },
                            fontWeight: 950,
                            lineHeight: 1.12,
                            textAlign: 'center',
                        }}
                    >
                        {currentParent ? `📂 ${currentParent.name}` : 'Cantos - Misa'}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        minHeight: 150,
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 1.25,
                    }}
                >
                    {visibleTypes.length === 0 && currentParent && (
                        <Typography
                            sx={{
                                mt: 2,
                                fontWeight: 800,
                                color: 'var(--color-secondary-text)',
                            }}
                        >
                            Carpeta vacía.
                        </Typography>
                    )}

                    {visibleTypes.map((type) => (
                        <Button
                            key={type.id}
                            variant="contained"
                            startIcon={type.isParent ? <FolderRoundedIcon /> : <MusicNoteRoundedIcon />}
                            onClick={() => handleTypeClick(type)}
                            sx={{
                                borderRadius: 1.5,
                                px: type.isParent ? 2.25 : 2,
                                py: 1,
                                backgroundColor: 'var(--color-button)',
                                color: 'var(--color-button-text)',
                                border: type.isParent
                                    ? '2px solid var(--color-accent)'
                                    : '2px solid transparent',
                                fontWeight: 900,
                                boxShadow: '0 8px 18px rgba(15, 23, 42, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'var(--color-accent)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.14)',
                                },
                                transition: 'all 0.18s ease',
                                '& .MuiButton-startIcon': {
                                    color: type.isParent ? '#facc15' : 'inherit',
                                },
                            }}
                        >
                            {type.name}
                        </Button>
                    ))}

                    {renderUncategorizedButton()}
                </Box>

                <Box
                    sx={{
                        mt: {
                            xs: 8,
                            md: 10,
                        },
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Box
                        component="img"
                        src="/images/coro-dibujo.png"
                        alt="Dibujo coro"
                        sx={{
                            width: '100%',
                            maxWidth: {
                                xs: 280,
                                md: 460,
                            },
                            objectFit: 'contain',
                            display: 'block',
                        }}
                    />
                </Box>
            </Paper>

            <SongModal
                show={modalVisible}
                onHide={() => setModalVisible(false)}
                categoryName={currentCategoryName}
                songs={modalSongs}
            />
        </Box>
    );
};