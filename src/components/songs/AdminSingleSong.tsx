// src/components/songs/AdminSingleSong.tsx

import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Paper,
    Typography,
} from '@mui/material';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import { TiptapViewer } from '../tiptap-components/TiptapViewer';
import { useSongStore } from '../../store/admin/useSongStore';
import { useAuth } from '../../context/AuthContext';
import type { Song } from '../../types';
import { parseText } from '../../utils/handleTextTipTap';

export const AdminSingleSong = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { canManageContent } = useAuth();

    const { getSong, removeSong } = useSongStore();
    const [song, setSong] = useState<Song | null>(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const fetchSong = async () => {
            if (!id) {
                return;
            }

            const data = await getSong(id);
            setSong(data);
        };

        void fetchSong();
    }, [id, getSong]);

    if (!song) {
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
                        Cargando canto...
                    </Typography>
                </Box>
            </Box>
        );
    }

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¡Esta acción no se puede deshacer!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed && song.id) {
            try {
                await removeSong(song.id);
                Swal.fire('¡Borrado!', 'El canto ha sido eliminado.', 'success');
                navigate('/admin/songs');
            } catch {
                Swal.fire('Error', 'No se pudo eliminar el canto', 'error');
            }
        }
    };

    const handlePlayPause = () => {
        if (!audioRef.current) {
            return;
        }

        if (audioRef.current.paused) {
            void audioRef.current.play();
            setIsAudioPlaying(true);
            return;
        }

        audioRef.current.pause();
        setIsAudioPlaying(false);
    };

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
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: {
                            xs: 'column',
                            md: 'row',
                        },
                        alignItems: {
                            xs: 'center',
                            md: 'center',
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
                                md: 'flex-start',
                            },
                            gap: 1.25,
                            textAlign: {
                                xs: 'center',
                                md: 'left',
                            },
                            minWidth: 0,
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
                            <MusicNoteRoundedIcon />
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
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                {song.title}
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                {song.songTypeName || 'Sin tipo asignado'}
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        component={RouterLink}
                        to="/admin/songs"
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        sx={{
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        Regresar
                    </Button>
                </Box>
            </Paper>

            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: 0,
                    p: {
                        xs: 1.5,
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
                    gap: 2,
                }}
            >
                {song.audioUrl && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={handlePlayPause}
                            startIcon={isAudioPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                            sx={{
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                fontWeight: 950,
                                textAlign: 'left',
                                maxWidth: 360,
                                width: {
                                    xs: '100%',
                                    sm: 'auto',
                                },
                                justifyContent: 'flex-start',
                            }}
                        >
                            <Box>
                                <Typography component="span" sx={{ display: 'block', fontWeight: 950 }}>
                                    Escuchar audio
                                </Typography>
                                <Typography
                                    component="span"
                                    sx={{
                                        display: 'block',
                                        color: 'var(--color-secondary-text)',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    Toca para reproducir / pausar
                                </Typography>
                            </Box>
                        </Button>

                        <audio
                            ref={audioRef}
                            src={song.audioUrl}
                            onEnded={() => setIsAudioPlaying(false)}
                            onPause={() => setIsAudioPlaying(false)}
                            onPlay={() => setIsAudioPlaying(true)}
                        />
                    </Box>
                )}

                <Paper
                    elevation={0}
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        p: {
                            xs: 1.25,
                            md: 2,
                        },
                        borderRadius: 1.5,
                        backgroundColor:
                            'color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%)',
                        border: '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                        boxShadow: 'inset 0 1px 16px rgba(15, 23, 42, 0.035)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        textAlign: 'center',
                        '& .tiptap-viewer': {
                            color: 'var(--color-text)',
                            fontSize: {
                                xs: '1.05rem',
                                md: '1.25rem',
                            },
                        },
                    }}
                >
                    <TiptapViewer content={parseText(song.content)} />
                </Paper>

                <Typography
                    sx={{
                        textAlign: 'center',
                        fontStyle: 'italic',
                        fontWeight: 950,
                        color: 'var(--color-secondary-text)',
                    }}
                >
                    {song.composer}
                </Typography>

                <Divider
                    sx={{
                        borderColor: 'color-mix(in srgb, var(--color-border) 36%, transparent)',
                    }}
                />

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: {
                            xs: 'row',
                            sm: 'row',
                        },
                        justifyContent: 'center',
                        gap: 1,
                    }}
                >
                    {canManageContent && (
                        <>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteRoundedIcon />}
                                onClick={handleDelete}
                                sx={{
                                    borderRadius: 1.5,
                                    px: 2.5,
                                    py: 0.9,
                                    fontWeight: 900,
                                }}
                            >
                                Borrar
                            </Button>

                            <Button
                                component={RouterLink}
                                to={`/admin/songs/edit/${song.id}`}
                                variant="contained"
                                startIcon={<EditRoundedIcon />}
                                sx={{
                                    borderRadius: 1.5,
                                    px: 2.5,
                                    py: 0.9,
                                    fontWeight: 900,
                                }}
                            >
                                Editar
                            </Button>
                        </>
                    )}

                    <Button
                        component={RouterLink}
                        to="/admin/songs"
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        sx={{
                            borderRadius: 1.5,
                            px: 2.5,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        Regresar
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};