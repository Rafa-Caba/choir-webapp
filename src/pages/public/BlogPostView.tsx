// src/pages/public/BlogPostView.tsx

import { useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { TiptapViewer } from '../../components/tiptap-components/TiptapViewer';
import { usePublicGlobal } from '../../context/PublicGlobalContext';
import { useBlogStore } from '../../store/public/useBlogStore';
import { buildPublicChoirPath } from '../../utils/choirCode';
import { parseText } from '../../utils/handleTextTipTap';

export const BlogPostView = () => {
    const { postId = '' } = useParams<{ postId: string }>();
    const { choirCode } = usePublicGlobal();
    const currentPost = useBlogStore((state) => (
        state.loadedChoirCode === choirCode && state.currentPostId === postId
            ? state.currentPost
            : null
    ));
    const loading = useBlogStore((state) => state.postLoading);
    const errorMessage = useBlogStore((state) => state.postErrorMessage);
    const fetchPostById = useBlogStore((state) => state.fetchPostById);
    const resetCurrentPost = useBlogStore((state) => state.resetCurrentPost);
    const blogPath = buildPublicChoirPath(choirCode, 'blog');

    useEffect(() => {
        if (!postId.trim()) {
            return;
        }

        void fetchPostById(choirCode, postId);

        return () => resetCurrentPost();
    }, [choirCode, fetchPostById, postId, resetCurrentPost]);

    if (loading) {
        return (
            <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2, fontWeight: 800 }}>
                        Cargando publicación...
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (!currentPost) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '1px solid var(--color-border)',
                    bgcolor: 'var(--color-card)',
                }}
            >
                <Typography component="h1" variant="h5" sx={{ fontWeight: 950, mb: 1 }}>
                    Publicación no disponible
                </Typography>
                <Typography sx={{ mb: 3, color: 'var(--color-secondary-text)' }}>
                    {errorMessage ?? 'La publicación solicitada no existe o dejó de ser pública.'}
                </Typography>
                <Button
                    component={RouterLink}
                    to={blogPath}
                    startIcon={<ArrowBackRoundedIcon />}
                    variant="contained"
                >
                    Volver al blog
                </Button>
            </Paper>
        );
    }

    return (
        <Paper
            component="article"
            elevation={0}
            sx={{
                p: { xs: 2, md: 4 },
                borderRadius: 2,
                border: '1px solid var(--color-border)',
                bgcolor: 'var(--color-card)',
                color: 'var(--color-text)',
            }}
        >
            <Button
                component={RouterLink}
                to={blogPath}
                startIcon={<ArrowBackRoundedIcon />}
                sx={{ mb: 2, fontWeight: 850 }}
            >
                Volver al blog
            </Button>

            {currentPost.imageUrl && (
                <Box
                    component="img"
                    src={currentPost.imageUrl}
                    alt={currentPost.title}
                    sx={{
                        width: '100%',
                        maxHeight: 520,
                        objectFit: 'cover',
                        borderRadius: 2,
                        mb: 3,
                    }}
                />
            )}

            <Typography
                component="h1"
                sx={{
                    fontSize: { xs: '1.65rem', md: '2.4rem' },
                    fontWeight: 950,
                    lineHeight: 1.1,
                    mb: 1,
                }}
            >
                {currentPost.title}
            </Typography>
            <Typography sx={{ mb: 3, color: 'var(--color-secondary-text)', fontWeight: 700 }}>
                {currentPost.author.name}
            </Typography>

            <TiptapViewer content={parseText(currentPost.content)} />
        </Paper>
    );
};
