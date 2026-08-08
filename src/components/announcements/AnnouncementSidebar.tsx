// src/components/announcements/AnnouncementSidebar.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Typography,
} from '@mui/material';

import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

import { useAnnouncementStore } from '../../store/admin/useAnnouncementStore';
import { useGalleryStore } from '../../store/admin/useGalleryStore';
import { TiptapViewer } from '../tiptap-components/TiptapViewer';
import { emptyEditorContent } from '../../utils/editorDefaults';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import { getTextFromTipTapJSON, parseText } from '../../utils/handleTextTipTap';
import type { Announcement } from '../../types/announcement';
import { useAuth } from '../../context/AuthContext';

export const AnnouncementSidebar = () => {
    const navigate = useNavigate();

    const { canManageContent } = useAuth();
    const { announcements, fetchAnnouncements, loading } = useAnnouncementStore();
    const { images } = useGalleryStore();

    const width = useWindowWidth();
    const isDesktop = width > 780;

    const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);

    const leftMenuImage = images.find((image) => image.imageLeftMenu);

    useEffect(() => {
        void fetchAnnouncements();
    }, [fetchAnnouncements]);

    const modalNavigate = () => {
        setActiveAnnouncement(null);
        navigate('/admin/announcements');
    };

    const visibleAnnouncements = announcements
        .filter((announcement) => announcement.isPublic)
        .slice(0, isDesktop ? 3 : 1);

    return (
        <Box
            sx={{
                height: '100%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                overflow: 'hidden',
                px: isDesktop ? 1 : 0,
                py: isDesktop ? 1.5 : 0.5,
            }}
        >
            {leftMenuImage && (
                <Paper
                    elevation={0}
                    sx={{
                        flexShrink: 0,
                        p: 1,
                        borderRadius: 2,
                        backgroundColor:
                            'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                        // border: '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        component="img"
                        src={leftMenuImage.imageUrl}
                        alt={leftMenuImage.title || 'Imagen lateral'}
                        sx={{
                            width: '100%',
                            maxHeight: isDesktop ? 120 : 90,
                            borderRadius: 3,
                            objectFit: 'contain',
                            display: 'block',
                        }}
                    />
                </Paper>
            )}

            <Typography
                component="h2"
                sx={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                    m: 0,
                    mt: {
                        xs: 0,
                        md: leftMenuImage ? 0.5 : 2,
                    },
                    mb: 1,
                    fontSize: '1.15rem',
                    fontWeight: 950,
                    color: 'var(--color-text)',
                }}
            >
                <CampaignRoundedIcon sx={{ color: 'var(--color-primary)' }} />
                Avisos
            </Typography>

            {loading ? (
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 120,
                        display: 'grid',
                        placeItems: 'center',
                    }}
                >
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <Box
                    sx={{
                        flex: 1,
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
                        gap: 1.25,
                    }}
                >
                    {visibleAnnouncements.length === 0 ? (
                        <Typography
                            sx={{
                                color: 'var(--color-secondary-text)',
                                fontWeight: 800,
                                textAlign: 'center',
                                py: 2,
                            }}
                        >
                            No hay avisos publicados.
                        </Typography>
                    ) : (
                        visibleAnnouncements.map((announcement) => (
                            <Paper
                                key={announcement.id}
                                elevation={0}
                                sx={{
                                    p: 1.25,
                                    borderRadius: 2,
                                    backgroundColor:
                                        'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                    border:
                                        '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                    boxShadow:
                                        'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 12%, transparent), 0 10px 28px rgba(15, 23, 42, 0.05)',
                                    color: 'var(--color-text)',
                                    overflow: 'hidden',
                                }}
                            >
                                {announcement.imageUrl && (
                                    <Box
                                        component="img"
                                        src={announcement.imageUrl}
                                        alt={announcement.title}
                                        sx={{
                                            width: 92,
                                            height: 92,
                                            mb: 1,
                                            mx: 'auto',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            display: 'block',
                                            border:
                                                '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                            boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
                                        }}
                                    />
                                )}

                                <Typography
                                    title={announcement.title}
                                    sx={{
                                        mb: 0.5,
                                        fontWeight: 950,
                                        color: 'var(--color-primary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    📌 {announcement.title}
                                </Typography>

                                <Typography
                                    sx={{
                                        mb: 0.75,
                                        color: 'var(--color-secondary-text)',
                                        fontWeight: 800,
                                        fontSize: '0.78rem',
                                    }}
                                >
                                    {announcement.createdAt
                                        ? new Date(announcement.createdAt).toLocaleDateString('es-MX')
                                        : 'Sin fecha'}
                                </Typography>

                                {isDesktop && (
                                    <Typography
                                        sx={{
                                            mb: 1,
                                            color: 'var(--color-secondary-text)',
                                            fontWeight: 700,
                                            fontSize: '0.82rem',
                                        }}
                                    >
                                        {getTextFromTipTapJSON(announcement.content, 80)}...
                                    </Typography>
                                )}

                                <Button
                                    type="button"
                                    variant="text"
                                    size="small"
                                    onClick={() => setActiveAnnouncement(announcement)}
                                    sx={{
                                        p: 0,
                                        minWidth: 0,
                                        color: 'var(--color-primary)',
                                        fontWeight: 950,
                                        textTransform: 'none',
                                    }}
                                >
                                    Ver más →
                                </Button>
                            </Paper>
                        ))
                    )}
                </Box>
            )}

            <Dialog
                open={Boolean(activeAnnouncement)}
                onClose={() => setActiveAnnouncement(null)}
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
                    <Box
                        component="span"
                        sx={{
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {activeAnnouncement?.title}
                    </Box>

                    <IconButton
                        aria-label="Cerrar aviso"
                        onClick={() => setActiveAnnouncement(null)}
                        sx={{
                            color: 'var(--color-text)',
                        }}
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
                        {activeAnnouncement?.imageUrl && (
                            <Avatar
                                src={activeAnnouncement.imageUrl}
                                alt="Imagen del aviso"
                                sx={{
                                    width: 250,
                                    height: 250,
                                    border: '3px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
                                }}
                            />
                        )}

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
                            <TiptapViewer content={parseText(activeAnnouncement?.content || emptyEditorContent)} />
                        </Paper>
                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 1.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 1,
                        borderTop: '1px solid color-mix(in srgb, var(--color-border) 36%, transparent)',
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => setActiveAnnouncement(null)}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 950,
                        }}
                    >
                        Cerrar
                    </Button>

                    {canManageContent && (
                        <Button
                            variant="contained"
                            endIcon={<OpenInNewRoundedIcon />}
                            onClick={modalNavigate}
                            sx={{
                                borderRadius: 1.5,
                                fontWeight: 950,
                            }}
                        >
                            Ir a avisos
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};