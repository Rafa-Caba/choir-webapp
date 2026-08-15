// src/components/songs/AdminEditSong.tsx

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { JSONContent } from '@tiptap/react';
import Swal from 'sweetalert2';

import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AudioFileRoundedIcon from '@mui/icons-material/AudioFileRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import { TiptapEditor } from '../tiptap-components/TiptapEditor';
import { useSongStore } from '../../store/admin/useSongStore';
import { useSongTypeStore } from '../../store/admin/useSongTypeStore';
import { emptyEditorContent } from '../../utils/editorDefaults';
import { parseText } from '../../utils/handleTextTipTap';
import type { CreateSongPayload } from '../../types/song';
import { capitalizeWord } from '../../utils';

const buildSongContentPayload = (editorContent: JSONContent | null): CreateSongPayload['content'] => {
    const parsedContent = parseText(editorContent ?? emptyEditorContent);

    return {
        ...parsedContent,
        type: parsedContent.type ?? 'doc',
        content: parsedContent.content ?? [],
    };
};

export const AdminEditSong = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { getSong, editSong } = useSongStore();
    const { types, fetchTypes } = useSongTypeStore();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState<JSONContent | null>(emptyEditorContent);
    const [songTypeId, setSongTypeId] = useState('');
    const [songTypeName, setSongTypeName] = useState('');
    const [composer, setComposer] = useState('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioFileName, setAudioFileName] = useState('');
    const [currentAudioUrl, setCurrentAudioUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);

    useEffect(() => {
        void fetchTypes();
    }, [fetchTypes]);

    useEffect(() => {
        const loadSong = async () => {
            if (!id) {
                return;
            }

            setInitialLoading(true);

            try {
                const data = await getSong(id);

                if (!data) {
                    Swal.fire('Error', 'No se encontró el canto.', 'error');
                    navigate('/admin/songs');
                    return;
                }

                setTitle(data.title);
                setContent(parseText(data.content));
                setComposer(data.composer || '');
                setCurrentAudioUrl(data.audioUrl || '');
                setSongTypeId(data.songTypeId || '');
                setSongTypeName(data.songTypeName || '');
            } catch {
                Swal.fire('Error', 'No se pudo cargar el canto.', 'error');
            } finally {
                setInitialLoading(false);
            }
        };

        void loadSong();
    }, [id, getSong, navigate]);

    useEffect(() => {
        if (songTypeId || !songTypeName || types.length === 0) {
            return;
        }

        const matchingType = types.find((typeItem) => typeItem.name === songTypeName);

        if (matchingType) {
            setSongTypeId(matchingType.id);
        }
    }, [songTypeId, songTypeName, types]);

    const handleAudioChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setAudioFile(file);
        setAudioFileName(file?.name ?? '');
    };

    const handleSongTypeChange = (event: SelectChangeEvent<string>) => {
        setSongTypeId(event.target.value);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!id) {
            return;
        }

        if (isSaving) {
            return;
        }

        setIsSaving(true);

        const payload: Partial<CreateSongPayload> = {
            title: title.trim(),
            content: buildSongContentPayload(content),
            songTypeId,
            composer: composer.trim(),
            ...(audioFile ? { file: audioFile } : {}),
        };

        try {
            await editSong(id, payload);
            Swal.fire('Guardado', 'El canto ha sido actualizado', 'success');
            navigate(`/admin/song/${id}`);
        } catch {
            Swal.fire('Error', 'No se pudo actualizar el canto', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const rootTypes = types
        .filter((typeItem) => !typeItem.parentId)
        .sort((firstType, secondType) => firstType.order - secondType.order);

    const getChildren = (parentId: string) =>
        types
            .filter((typeItem) => typeItem.parentId === parentId)
            .sort((firstType, secondType) => firstType.order - secondType.order);

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
                        Cargando canto...
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
                            <EditRoundedIcon />
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
                                Editar Canto
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 0.4,
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                }}
                            >
                                Actualiza la información, texto y audio del canto.
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => navigate(`/admin/song/${id}`)}
                        disabled={isSaving}
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
                        xs: 1.5,
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
                        pr: {
                            xs: 0,
                            md: 0.5,
                        },
                        backgroundColor: 'transparent !important',
                    }}
                >
                    <TextField
                        type="text"
                        label="Título"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Título"
                        disabled={isSaving}
                        style={{ marginTop: 5 }}
                        required
                    />

                    <Box>
                        <Typography
                            sx={{
                                mb: 1,
                                fontWeight: 950,
                                color: 'var(--color-text)',
                            }}
                        >
                            Texto del Canto
                        </Typography>

                        <TiptapEditor
                            content={content}
                            onChange={(value: JSONContent) => setContent(value)}
                        />
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: 'minmax(0, 1fr) minmax(0, 1fr)',
                            },
                            gap: {
                                xs: 1.5,
                                md: 2,
                            },
                        }}
                    >
                        <FormControl fullWidth>
                            <InputLabel id="song-type-edit-label">Tipo de Canto</InputLabel>
                            <Select
                                labelId="song-type-edit-label"
                                value={songTypeId}
                                label="Tipo de Canto"
                                onChange={handleSongTypeChange}
                                disabled={isSaving}
                            >
                                <MenuItem value="">
                                    <em>-- Seleccionar Tipo --</em>
                                </MenuItem>

                                {rootTypes.map((rootType) => {
                                    const children = getChildren(rootType.id);

                                    if (rootType.isParent && children.length > 0) {
                                        return children.map((childType) => (
                                            <MenuItem key={childType.id} value={childType.id}>
                                                {capitalizeWord(rootType.name)} / {capitalizeWord(childType.name)}
                                            </MenuItem>
                                        ));
                                    }

                                    return (
                                        <MenuItem key={rootType.id} value={rootType.id}>
                                            {capitalizeWord(rootType.name)}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>

                        <TextField
                            type="text"
                            label="Compositor"
                            value={composer}
                            onChange={(event) => setComposer(event.target.value)}
                            placeholder="Compositor"
                            disabled={isSaving}
                        />
                    </Box>

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
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<AudioFileRoundedIcon />}
                            disabled={isSaving}
                            sx={{
                                width: '100%',
                                borderRadius: 1.5,
                                py: 0.9,
                                fontWeight: 950,
                            }}
                        >
                            {audioFileName || 'Seleccionar nuevo audio opcional'}
                            <input hidden type="file" accept="audio/*" onChange={handleAudioChange} />
                        </Button>

                        <Typography
                            sx={{
                                mt: 0.75,
                                color: 'var(--color-secondary-text)',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                textAlign: 'center',
                            }}
                        >
                            {currentAudioUrl
                                ? 'Ya hay un audio guardado. Si subes uno nuevo, lo reemplazará.'
                                : 'Este canto todavía no tiene audio guardado.'}
                        </Typography>
                    </Paper>

                    <Box
                        sx={{
                            mt: 'auto',
                            display: 'flex',
                            flexDirection: {
                                xs: 'column-reverse',
                                sm: 'row',
                            },
                            justifyContent: 'center',
                            gap: 1,
                        }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackRoundedIcon />}
                            onClick={() => navigate(`/admin/song/${id}`)}
                            disabled={isSaving}
                            sx={{
                                borderRadius: 1.5,
                                px: 2.5,
                                py: 0.9,
                                fontWeight: 950,
                            }}
                        >
                            Volver
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSaving}
                            endIcon={
                                isSaving ? (
                                    <CircularProgress
                                        size={18}
                                        sx={{ color: 'var(--color-button-text)' }}
                                    />
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
                            {isSaving ? 'Guardando...' : 'Modificar Canto'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};