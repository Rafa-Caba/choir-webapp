// src/components/blog/AdminBlogPostSingleView.tsx

import { useEffect, useState, type FormEvent } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import type { JSONContent } from '@tiptap/react';
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
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

import { BlogLikeButton } from './BlogLikeButton';
import { TiptapViewer } from '../tiptap-components/TiptapViewer';
import { TiptapEditor } from '../tiptap-components/TiptapEditor';
import { useAuth } from '../../context/AuthContext';
import { useBlogStore } from '../../store/admin/useBlogStore';
import { createHandleTextoChange, parseText } from '../../utils/handleTextTipTap';
import { emptyEditorContent } from '../../utils/editorDefaults';
import type { TipTapContent } from '../../types';

interface CommentEditorState {
    texto: JSONContent;
}

const isTipTapContent = (
    content: JSONContent,
): content is TipTapContent => (
    content.type === 'doc'
    && Array.isArray(content.content)
);

const hasTextContent = (content: JSONContent): boolean => {
    if (typeof content.text === 'string' && content.text.trim().length > 0) {
        return true;
    }

    if (!content.content || content.content.length === 0) {
        return false;
    }

    return content.content.some((child) => hasTextContent(child));
};

export const AdminBlogPostSingleView = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();

    const {
        currentPost,
        getPost,
        addComment,
        loading,
    } = useBlogStore();

    const [commentContent, setCommentContent] = useState<CommentEditorState | null>({
        texto: { type: 'doc', content: [] },
    });
    const [commentLoading, setCommentLoading] = useState(false);

    useEffect(() => {
        if (!id) {
            return;
        }

        getPost(id).catch(() => {
            Swal.fire('Error', 'No se pudo cargar el post', 'error');
        });
    }, [id, getPost]);

    const handleComment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const parsedComment = parseText(
            commentContent?.texto ?? emptyEditorContent,
        );

        if (!isTipTapContent(parsedComment)) {
            Swal.fire(
                'Error',
                'El formato del comentario no es válido',
                'error',
            );
            return;
        }

        const hasContent = hasTextContent(parsedComment);

        if (!hasContent) {
            Swal.fire('Oops', 'El comentario no puede estar vacío', 'warning');
            return;
        }

        if (!user?.id) {
            Swal.fire('Aviso', 'Debes iniciar sesión para comentar', 'info');
            return;
        }

        if (!id) {
            return;
        }

        try {
            setCommentLoading(true);
            await addComment(id, parsedComment);
            setCommentContent({
                texto: { type: 'doc', content: [] },
            });
        } catch {
            Swal.fire('Error', 'No se pudo agregar el comentario', 'error');
        } finally {
            setCommentLoading(false);
        }
    };

    if (loading || !currentPost) {
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
                        Cargando publicación...
                    </Typography>
                </Box>
            </Box>
        );
    }

    const { title, content, author, createdAt, imageUrl, likes, comments, likesUsers } = currentPost;

    return (
        <Box
            component="section"
            sx={{
                width: '100%',
                minHeight: '100%',
                height: '100%',
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
                            <ArticleRoundedIcon />
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
                                Por {author?.name || 'Desconocido'} —{' '}
                                {createdAt ? new Date(createdAt).toLocaleDateString() : 'Sin fecha'}
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        component={RouterLink}
                        to="/admin/blog/view"
                        variant="outlined"
                        startIcon={<ArrowBackRoundedIcon />}
                        sx={{
                            borderRadius: 1.5,
                            px: 2,
                            py: 0.9,
                            fontWeight: 950,
                        }}
                    >
                        Regresar al Blog
                    </Button>
                </Box>
            </Paper>

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
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        pr: {
                            xs: 0,
                            md: 0.5,
                        },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                    }}
                >
                    {imageUrl && (
                        <Box
                            sx={{
                                mb: 2,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <Box
                                component="img"
                                src={imageUrl}
                                alt={title}
                                sx={{
                                    width: '100%',
                                    maxWidth: 920,
                                    maxHeight: 420,
                                    objectFit: 'contain',
                                    borderRadius: 2,
                                    display: 'block',
                                    filter: 'drop-shadow(0 16px 32px rgba(15, 23, 42, 0.12))',
                                }}
                            />
                        </Box>
                    )}

                    <Paper
                        elevation={0}
                        sx={{
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
                        <TiptapViewer content={parseText(content)} />
                    </Paper>

                    <Box sx={{ mt: 2 }}>
                        <BlogLikeButton
                            postId={id || ''}
                            initialLikes={likes}
                            initialLikesUsers={likesUsers}
                            currentUserId={user?.id}
                        />
                    </Box>

                    <Divider
                        sx={{
                            my: 2,
                            borderColor: 'color-mix(in srgb, var(--color-border) 36%, transparent)',
                        }}
                    />

                    <Paper
                        elevation={0}
                        sx={{
                            p: {
                                xs: 1.25,
                                md: 2,
                            },
                            borderRadius: 1.5,
                            backgroundColor:
                                'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                            border: '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                            boxShadow: 'inset 0 1px 16px rgba(15, 23, 42, 0.035)',
                        }}
                    >
                        <Typography
                            component="h2"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                m: 0,
                                mb: 2,
                                fontSize: {
                                    xs: '1.2rem',
                                    md: '1.4rem',
                                },
                                fontWeight: 950,
                            }}
                        >
                            <ChatBubbleOutlineRoundedIcon />
                            Comentarios ({comments.length})
                        </Typography>

                        <Box
                            component="form"
                            onSubmit={handleComment}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                                p: '0 !important',
                                m: '0 !important',
                                backgroundColor: 'transparent !important',
                            }}
                        >
                            <Typography sx={{ fontWeight: 950 }}>
                                Comentario
                            </Typography>

                            <TiptapEditor
                                content={commentContent?.texto ?? emptyEditorContent}
                                onChange={createHandleTextoChange(setCommentContent, 'texto')}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={commentLoading}
                                endIcon={
                                    commentLoading ? (
                                        <CircularProgress size={18} sx={{ color: 'var(--color-button-text)' }} />
                                    ) : (
                                        <SendRoundedIcon />
                                    )
                                }
                                sx={{
                                    alignSelf: {
                                        xs: 'stretch',
                                        sm: 'flex-start',
                                    },
                                    borderRadius: 1.5,
                                    px: 2.5,
                                    py: 0.9,
                                    fontWeight: 950,
                                }}
                            >
                                {commentLoading ? 'Enviando...' : 'Comentar'}
                            </Button>
                        </Box>

                        <Divider
                            sx={{
                                my: 2,
                                borderColor: 'color-mix(in srgb, var(--color-border) 36%, transparent)',
                            }}
                        />

                        {comments.length > 0 ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.25,
                                }}
                            >
                                {[...comments].reverse().map((comment) => (
                                    <Paper
                                        key={`${comment.author}-${comment.date}`}
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1.5,
                                            backgroundColor:
                                                'color-mix(in srgb, var(--color-card) 92%, var(--color-primary) 8%)',
                                            border:
                                                '1px solid color-mix(in srgb, var(--color-border) 28%, transparent)',
                                            color: 'var(--color-text)',
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                mb: 1,
                                                color: 'var(--color-secondary-text)',
                                                fontWeight: 800,
                                            }}
                                        >
                                            <Box component="span" sx={{ color: 'var(--color-text)', fontWeight: 950 }}>
                                                {comment.author}
                                            </Box>{' '}
                                            — <small>{new Date(comment.date).toLocaleString()}</small>
                                        </Typography>

                                        <TiptapViewer content={parseText(comment.text)} />
                                    </Paper>
                                ))}
                            </Box>
                        ) : (
                            <Typography
                                sx={{
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 800,
                                    textAlign: 'center',
                                }}
                            >
                                No hay comentarios aún.
                            </Typography>
                        )}
                    </Paper>
                </Box>
            </Paper>
        </Box>
    );
};