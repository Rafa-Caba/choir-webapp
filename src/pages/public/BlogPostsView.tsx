// src/pages/public/BlogPostsView.tsx

import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Typography,
} from '@mui/material';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import { Link as RouterLink } from 'react-router-dom';
import { usePublicGlobal } from '../../context/PublicGlobalContext';
import { useBlogStore } from '../../store/public/useBlogStore';
import { buildPublicChoirPath } from '../../utils/choirCode';
import { TiptapViewer } from '../../components/tiptap-components/TiptapViewer';
import { parseText } from '../../utils/handleTextTipTap';

export const BlogPostsView = () => {
    const { choirCode } = usePublicGlobal();
    const posts = useBlogStore((state) => (
        state.loadedChoirCode === choirCode ? state.posts : []
    ));
    const loading = useBlogStore((state) => (
        state.loadedChoirCode === choirCode && state.postsLoading
    ));
    const errorMessage = useBlogStore((state) => (
        state.loadedChoirCode === choirCode ? state.postsErrorMessage : null
    ));
    const blogPath = buildPublicChoirPath(choirCode, 'blog');

    if (loading) {
        return (
            <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2, fontWeight: 800 }}>
                        Cargando publicaciones...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box component="section" sx={{ width: '100%' }}>
            <Typography
                component="h1"
                sx={{
                    mb: 3,
                    textAlign: 'center',
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    fontWeight: 950,
                    color: 'var(--color-text)',
                }}
            >
                Blog
            </Typography>

            {errorMessage && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        border: '1px solid var(--color-border)',
                        bgcolor: 'var(--color-card)',
                    }}
                >
                    <Typography sx={{ fontWeight: 800 }}>{errorMessage}</Typography>
                </Paper>
            )}

            {!errorMessage && posts.length === 0 && (
                <Paper
                    elevation={0}
                    sx={{
                        minHeight: 260,
                        display: 'grid',
                        placeItems: 'center',
                        textAlign: 'center',
                        border: '1px solid var(--color-border)',
                        bgcolor: 'var(--color-card)',
                    }}
                >
                    <Box>
                        <ArticleRoundedIcon sx={{ fontSize: 64, color: 'var(--color-primary)' }} />
                        <Typography sx={{ mt: 1, fontWeight: 850 }}>
                            No hay publicaciones públicas todavía.
                        </Typography>
                    </Box>
                </Paper>
            )}

            <Box sx={{ display: 'grid', gap: 2 }}>
                {posts.map((post) => (
                    <Paper
                        key={post.id}
                        elevation={0}
                        sx={{
                            p: { xs: 2, md: 3 },
                            borderRadius: 2,
                            border: '1px solid var(--color-border)',
                            bgcolor: 'var(--color-card)',
                            color: 'var(--color-text)',
                        }}
                    >
                        {post.imageUrl && (
                            <Box
                                component="img"
                                src={post.imageUrl}
                                alt={post.title}
                                loading="lazy"
                                sx={{
                                    width: '100%',
                                    maxHeight: 360,
                                    objectFit: 'cover',
                                    borderRadius: 1.5,
                                    mb: 2,
                                }}
                            />
                        )}

                        <Typography component="h2" variant="h5" sx={{ fontWeight: 950, mb: 1 }}>
                            {post.title}
                        </Typography>
                        <Typography sx={{ mb: 2, color: 'var(--color-secondary-text)', fontWeight: 700 }}>
                            {post.author.name}
                        </Typography>

                        <Box
                            sx={{
                                maxHeight: 180,
                                overflow: 'hidden',
                                maskImage: 'linear-gradient(to bottom, black 65%, transparent 100%)',
                            }}
                        >
                            <TiptapViewer content={parseText(post.content)} />
                        </Box>

                        <Button
                            component={RouterLink}
                            to={`${blogPath}/${encodeURIComponent(post.id)}`}
                            variant="contained"
                            sx={{ mt: 2, fontWeight: 900 }}
                        >
                            Leer publicación
                        </Button>
                    </Paper>
                ))}
            </Box>
        </Box>
    );
};
