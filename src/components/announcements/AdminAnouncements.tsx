// src/components/announcements/AdminAnouncements.tsx

import { useEffect, useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import { useAnnouncementStore } from '../../store/admin/useAnnouncementStore';
import { TiptapViewer } from '../tiptap-components/TiptapViewer';
import type { Announcement } from '../../types/announcement';
import { parseText } from '../../utils/handleTextTipTap';

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

                {action}
            </Box>
        </Paper>
    );
};

export const AdminAnnouncements = () => {
    const [search, setSearch] = useState('');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    const {
        announcements,
        loading,
        fetchAnnouncements,
        removeAnnouncement,
    } = useAnnouncementStore();

    useEffect(() => {
        void fetchAnnouncements();
    }, [fetchAnnouncements]);

    const filteredAnnouncements = announcements.filter((announcement) =>
        announcement.title.toLowerCase().includes(search.toLowerCase()),
    );

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el aviso y su imagen',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await removeAnnouncement(id);
            Swal.fire('Eliminado', 'El aviso ha sido eliminado.', 'success');
        } catch {
            Swal.fire('Error', 'No se pudo eliminar el aviso', 'error');
        }
    };

    const openModal = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
    };

    const closeModal = () => {
        setSelectedAnnouncement(null);
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
            <SectionHeader
                title="Avisos"
                subtitle="Administra avisos, imágenes, contenido y visibilidad pública."
                icon={<CampaignRoundedIcon />}
                action={
                    <Button
                        component={RouterLink}
                        to="/admin/announcements/new"
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        sx={{
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        Nuevo Aviso
                    </Button>
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
                    gap: 1.5,
                }}
            >
                <TextField
                    type="text"
                    label="Buscar"
                    placeholder="Buscar por título..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon sx={{ color: 'var(--color-primary)' }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

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
                                Cargando avisos...
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <TableContainer
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflow: 'auto',
                            borderRadius: 1.5,
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                        }}
                    >
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {['Imagen', 'Título', 'Contenido', 'Publicado', 'Acciones'].map((label) => (
                                        <TableCell
                                            key={label}
                                            align={label === 'Acciones' ? 'right' : 'left'}
                                            sx={{
                                                backgroundColor:
                                                    'color-mix(in srgb, var(--color-card) 82%, var(--color-primary) 18%)',
                                                color: 'var(--color-text)',
                                                fontWeight: 950,
                                                borderBottom:
                                                    '1px solid color-mix(in srgb, var(--color-border) 42%, transparent)',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredAnnouncements.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            sx={{
                                                py: 5,
                                                textAlign: 'center',
                                                color: 'var(--color-secondary-text)',
                                                fontWeight: 800,
                                                borderBottom: 'none',
                                            }}
                                        >
                                            No se encontraron avisos con ese criterio.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAnnouncements.map((announcement) => (
                                        <TableRow
                                            key={announcement.id}
                                            hover
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor:
                                                        'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                                                },
                                            }}
                                        >
                                            <TableCell
                                                sx={{
                                                    width: 92,
                                                    borderBottom:
                                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                }}
                                            >
                                                <Avatar
                                                    src={announcement.imageUrl || '/images/default-image.png'}
                                                    alt={announcement.title}
                                                    variant="rounded"
                                                    sx={{
                                                        width: 54,
                                                        height: 54,
                                                        borderRadius: 1.5,
                                                        bgcolor: 'var(--color-primary)',
                                                        color: 'var(--color-button-text)',
                                                        fontWeight: 950,
                                                        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
                                                    }}
                                                >
                                                    A
                                                </Avatar>
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    color: 'var(--color-text)',
                                                    fontWeight: 950,
                                                    borderBottom:
                                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                    minWidth: 220,
                                                    overflowWrap: 'anywhere',
                                                }}
                                            >
                                                {announcement.title}
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    borderBottom:
                                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                    minWidth: 140,
                                                }}
                                            >
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<VisibilityRoundedIcon />}
                                                    onClick={() => openModal(announcement)}
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        fontWeight: 950,
                                                    }}
                                                >
                                                    Ver más
                                                </Button>
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    borderBottom:
                                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                    minWidth: 120,
                                                }}
                                            >
                                                <Chip
                                                    size="small"
                                                    label={announcement.isPublic ? 'Sí' : 'No'}
                                                    color={announcement.isPublic ? 'success' : 'default'}
                                                    sx={{ fontWeight: 950 }}
                                                />
                                            </TableCell>

                                            <TableCell
                                                align="right"
                                                sx={{
                                                    borderBottom:
                                                        '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                                    minWidth: 140,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                        gap: 0.75,
                                                    }}
                                                >
                                                    <Tooltip title="Editar aviso">
                                                        <IconButton
                                                            component={RouterLink}
                                                            to={`/admin/announcements/edit/${announcement.id}`}
                                                            aria-label={`Editar ${announcement.title}`}
                                                            sx={{
                                                                color: 'var(--color-primary)',
                                                                backgroundColor:
                                                                    'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                                                                '&:hover': {
                                                                    backgroundColor:
                                                                        'color-mix(in srgb, var(--color-primary) 18%, transparent)',
                                                                },
                                                            }}
                                                        >
                                                            <EditRoundedIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Eliminar aviso">
                                                        <IconButton
                                                            aria-label={`Eliminar ${announcement.title}`}
                                                            onClick={() => handleDelete(announcement.id)}
                                                            sx={{
                                                                color: '#dc2626',
                                                                backgroundColor:
                                                                    'color-mix(in srgb, #dc2626 10%, transparent)',
                                                                '&:hover': {
                                                                    backgroundColor:
                                                                        'color-mix(in srgb, #dc2626 18%, transparent)',
                                                                },
                                                            }}
                                                        >
                                                            <DeleteRoundedIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Dialog
                open={Boolean(selectedAnnouncement)}
                onClose={closeModal}
                fullWidth
                maxWidth="md"
                scroll="paper"
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2,
                            backgroundColor: 'var(--color-card)',
                            color: 'var(--color-text)',
                            border: '1px solid color-mix(in srgb, var(--color-border) 46%, transparent)',
                            boxShadow: '0 22px 70px rgba(15, 23, 42, 0.22)',
                            overflow: 'hidden',
                        },
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        fontWeight: 950,
                        borderBottom: '1px solid color-mix(in srgb, var(--color-border) 36%, transparent)',
                    }}
                >
                    <Box component="span" sx={{ overflowWrap: 'anywhere' }}>
                        {selectedAnnouncement?.title}
                    </Box>

                    <IconButton
                        aria-label="Cerrar aviso"
                        onClick={closeModal}
                        sx={{ color: 'var(--color-text)' }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent
                    sx={{
                        p: 2,
                        backgroundColor: 'var(--color-card)',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        {selectedAnnouncement?.imageUrl && (
                            <Avatar
                                src={selectedAnnouncement.imageUrl}
                                alt="Imagen del aviso"
                                sx={{
                                    width: 150,
                                    height: 150,
                                    border: '3px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
                                }}
                            />
                        )}

                        {selectedAnnouncement?.content && (
                            <Paper
                                elevation={0}
                                sx={{
                                    width: '100%',
                                    p: {
                                        xs: 1.25,
                                        md: 2,
                                    },
                                    borderRadius: 1.5,
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%)',
                                    border: '1px solid color-mix(in srgb, var(--color-border) 32%, transparent)',
                                    color: 'var(--color-text)',
                                }}
                            >
                                <TiptapViewer content={parseText(selectedAnnouncement.content)} />
                            </Paper>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 1.5,
                        borderTop: '1px solid color-mix(in srgb, var(--color-border) 36%, transparent)',
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={closeModal}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 950,
                        }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};