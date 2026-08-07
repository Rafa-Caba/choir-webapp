// src/components/components-public/AboutUsSection.tsx

import {
    Box,
    CircularProgress,
    Paper,
    Typography,
} from '@mui/material';

import ImageRoundedIcon from '@mui/icons-material/ImageRounded';

import { usePublicGlobal } from '../../context/PublicGlobalContext';
import { useGalleryStore } from '../../store/public/useGalleryStore';
import { useSettingsStore } from '../../store/public/useSettingsStore';
import { TiptapViewer } from '../tiptap-components/TiptapViewer';
import { parseText } from '../../utils/handleTextTipTap';

export const AboutUsSection = () => {
    const { choirCode } = usePublicGlobal();
    const settings = useSettingsStore((state) => (
        state.loadedChoirCode === choirCode ? state.settings : null
    ));
    const images = useGalleryStore((state) => (
        state.loadedChoirCode === choirCode ? state.images : []
    ));

    const usImage = images.find((image) => image.imageUs);


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
                }}
            >
                <Box
                    sx={{
                        mb: {
                            xs: 2,
                            md: 3,
                        },
                    }}
                >
                    <Typography
                        component="h1"
                        sx={{
                            mb: 1.5,
                            fontSize: {
                                xs: '1.7rem',
                                md: '2rem',
                            },
                            fontWeight: 950,
                            lineHeight: 1.12,
                            textAlign: {
                                xs: 'center',
                                md: 'left',
                            },
                        }}
                    >
                        Historia...
                    </Typography>

                    {settings ? (
                        <Box
                            sx={{
                                width: '100%',
                                minWidth: 0,
                                overflowX: 'auto',
                                '& .tiptap-viewer': {
                                    color: 'var(--color-text)',
                                },
                            }}
                        >
                            <TiptapViewer content={parseText(settings.history)} />
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                py: 4,
                                display: 'grid',
                                placeItems: 'center',
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    )}
                </Box>

                <Box
                    sx={{
                        mt: {
                            xs: 2,
                            md: 3,
                        },
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    {usImage ? (
                        <Box
                            component="img"
                            src={usImage.imageUrl}
                            alt={usImage.title}
                            sx={{
                                width: '100%',
                                maxWidth: 760,
                                height: {
                                    xs: 260,
                                    sm: 340,
                                    md: 420,
                                },
                                objectFit: 'cover',
                                display: 'block',
                                borderRadius: 2,
                                border: '1px solid var(--color-border)',
                                boxShadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
                            }}
                        />
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                width: '100%',
                                maxWidth: 760,
                                minHeight: {
                                    xs: 240,
                                    md: 340,
                                },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1.5,
                                borderRadius: 2,
                                border: '1px dashed var(--color-border)',
                                backgroundColor:
                                    'color-mix(in srgb, var(--color-card) 90%, var(--color-primary) 10%)',
                                color: 'var(--color-secondary-text)',
                                textAlign: 'center',
                                px: 2,
                            }}
                        >
                            <ImageRoundedIcon sx={{ fontSize: 88 }} />
                            <Typography sx={{ fontWeight: 800 }}>
                                No hay imagen de inicio aún
                            </Typography>
                        </Paper>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};