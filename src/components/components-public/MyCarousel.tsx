// src/components/components-public/MyCarousel.tsx

import { Carousel } from 'react-bootstrap';
import { FaImage } from 'react-icons/fa';
import { Box, Paper, Typography } from '@mui/material';

import { PublicResourceNotice } from '../public/PublicResourceNotice';
import { usePublicGlobal } from '../../context/PublicGlobalContext';
import { useGalleryStore } from '../../store/public/useGalleryStore';

export const MyCarousel = () => {
    const { choirCode } = usePublicGlobal();
    const images = useGalleryStore((state) => (
        state.loadedChoirCode === choirCode ? state.images : []
    ));
    const loading = useGalleryStore((state) => (
        state.loadedChoirCode === choirCode && state.loading
    ));
    const errorMessage = useGalleryStore((state) => (
        state.loadedChoirCode === choirCode ? state.errorMessage : null
    ));

    if (loading || errorMessage) {
        return (
            <PublicResourceNotice
                loading={loading}
                loadingMessage="Cargando galería..."
                errorMessage={errorMessage}
            />
        );
    }

    const galleryImages = images.filter((image) => image.imageGallery);

    return (
        <Paper
            elevation={0}
            className={galleryImages.length === 0 ? 'images-carousel' : undefined}
            sx={{
                width: '100%',
                my: {
                    xs: 1.5,
                    md: 2,
                },
                borderRadius: {
                    xs: 1.5,
                    md: 2,
                },
                overflow: 'hidden',
                backgroundColor: 'color-mix(in srgb, var(--color-card) 86%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-border) 84%, transparent)',
                boxShadow: '0 14px 36px rgba(15, 23, 42, 0.08)',
                color: 'var(--color-text)',
            }}
        >
            {galleryImages.length > 0 ? (
                <Box
                    sx={{
                        width: '100%',
                        height: {
                            xs: 600,
                            sm: 600,
                            md: 460,
                            lg: 700,
                            xl: 730,
                        },
                        maxHeight: {
                            xs: '56vh',
                            sm: '54vh',
                            md: '60vh',
                            lg: '70vh',
                        },
                        minHeight: {
                            xs: 220,
                            md: 360,
                        },
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor:
                            'color-mix(in srgb, var(--color-card) 78%, var(--color-primary) 22%)',
                        '& .carousel': {
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                        },
                        '& .carousel-inner': {
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                        },
                        '& .carousel-item': {
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                        },
                        '& .carousel-caption': {
                            left: {
                                xs: '8%',
                                md: '15%',
                            },
                            right: {
                                xs: '8%',
                                md: '15%',
                            },
                            bottom: {
                                xs: 12,
                                md: 20,
                            },
                            px: 1,
                            py: 0.75,
                            borderRadius: 1.5,
                            backgroundColor: 'rgba(15, 23, 42, 0.28)',
                            backdropFilter: 'blur(6px)',
                        },
                    }}
                >
                    <Carousel fade indicators controls>
                        {galleryImages.map((image) => (
                            <Carousel.Item key={image.id}>
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        lineHeight: 0,
                                    }}
                                >
                                    <Box
                                        component="img"
                                        loading="lazy"
                                        src={image.imageUrl}
                                        alt={image.title}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            objectFit: 'contain',
                                            objectPosition: 'center',
                                            display: 'block',
                                            m: 0,
                                            p: 0,
                                            border: 0,
                                            flexShrink: 0,
                                        }}
                                    />
                                </Box>

                                {image.title && (
                                    <Carousel.Caption>
                                        <Typography
                                            component="h5"
                                            sx={{
                                                m: 0,
                                                mb: 2,
                                                fontSize: {
                                                    xs: '0.95rem',
                                                    md: '1.15rem',
                                                },
                                                fontWeight: 900,
                                                color: 'var(--color-button-text)',
                                                textShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {image.title}
                                        </Typography>
                                    </Carousel.Caption>
                                )}
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </Box>
            ) : (
                <Box
                    sx={{
                        minHeight: {
                            xs: 260,
                            md: 420,
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-secondary-text)',
                        textAlign: 'center',
                        px: 2,
                    }}
                >
                    <FaImage size={120} color="currentColor" />

                    <Typography
                        sx={{
                            mt: 2,
                            fontWeight: 800,
                        }}
                    >
                        No hay imágenes en el carrusel aún
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};