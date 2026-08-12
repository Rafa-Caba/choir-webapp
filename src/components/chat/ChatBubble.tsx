// src/components/chat/ChatBubble.tsx

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

import {
    Avatar,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Typography,
    useMediaQuery,
} from '@mui/material';

import EmojiEmotionsRoundedIcon from '@mui/icons-material/EmojiEmotionsRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';

import type { ChatMessage, ReplyPreview } from '../../types/chat';
import { TiptapChatViewer } from '../tiptap-components/TiptapChatViewer';
import { useChatStore } from '../../store/admin/useChatStore';
import { EmojiPickerModal } from './EmojiPickerModal';
import { EmojiFloat } from './EmojiFloat';
import { obtenerIconoArchivo } from '../../utils/functionsFilesNames';
import { useAuth } from '../../context/AuthContext';
import { formatName } from '../../utils';
import { getTextFromTipTapJSON } from '../../utils/handleTextTipTap';
import { ChatReactions } from './ChatReactions';

interface Props {
    msg: ChatMessage;
    previous?: ChatMessage;
    isOwn: boolean;
    onImageClick: (url: string) => void;
    onAvatarClick: (url: string) => void;
    onPreviewClick: (
        type: 'image' | 'file' | 'audio' | 'video',
        url: string,
        name?: string,
    ) => void;
    onReply: (message: ChatMessage) => void;
}

const isReplyPreview = (value: ChatMessage['replyTo']): value is ReplyPreview => {
    return Boolean(value && typeof value === 'object');
};

const getMessageTimeLabel = (message: ChatMessage): string => {
    if (!message.createdAt) {
        return '';
    }

    try {
        return format(parseISO(message.createdAt), 'HH:mm', { locale: es });
    } catch (error) {
        console.warn('Invalid createdAt in ChatBubble:', message.id, message.createdAt, error);
        return '';
    }
};


const getMessageMediaUrl = (message: ChatMessage): string => (
    message.media?.url?.trim()
    || message.imageUrl?.trim()
    || message.audioUrl?.trim()
    || message.fileUrl?.trim()
    || ''
);

const getRenderableMessageType = (message: ChatMessage): ChatMessage['type'] => {
    if (message.type !== 'MEDIA') {
        return message.type;
    }

    const mimeType = message.media?.mimeType ?? '';

    if (mimeType.startsWith('audio/')) {
        return 'AUDIO';
    }

    if (mimeType.startsWith('image/')) {
        return 'IMAGE';
    }

    return 'VIDEO';
};

const getReactionUserId = (reaction: ChatMessage['reactions'][number]): string => {
    if (typeof reaction.user === 'string') {
        return reaction.user;
    }

    return reaction.user.id;
};

export const ChatBubble = ({
    msg,
    previous,
    isOwn,
    onImageClick,
    onAvatarClick,
    onPreviewClick,
    onReply,
}: Props) => {
    const { user } = useAuth();
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [showEmojiModal, setShowEmojiModal] = useState(false);
    const [floatingEmoji, setFloatingEmoji] = useState<string | null>(null);
    const [showMobileReaction, setShowMobileReaction] = useState(false);
    const [actionsAnchorElement, setActionsAnchorElement] = useState<HTMLElement | null>(null);

    const reactToMessage = useChatStore((state) => state.reactToMessage);

    const isActionsMenuOpen = Boolean(actionsAnchorElement);

    const hasReacted = msg.reactions?.some((reaction) => {
        const reactorId = getReactionUserId(reaction);

        return reactorId === user?.id;
    });

    const isSameAuthor = Boolean(previous?.author && previous.author.id === msg.author.id);
    const replyPreview = isReplyPreview(msg.replyTo) ? msg.replyTo : null;
    const timeLabel = getMessageTimeLabel(msg);
    const shouldShowReactions = showMobileReaction || hasReacted || Boolean(msg.reactions && msg.reactions.length > 0);
    const hasReplyPreview = Boolean(replyPreview);
    const messageMediaUrl = getMessageMediaUrl(msg);
    const renderType = getRenderableMessageType(msg);
    const messageText = getTextFromTipTapJSON(msg.content, 10_000).trim();
    const hasMessageText = messageText.length > 0;

    const handleEmojiSelect = async (emoji: string) => {
        setFloatingEmoji(emoji);
        setShowEmojiModal(false);
        await reactToMessage(msg.id, emoji);

        window.setTimeout(() => setFloatingEmoji(null), 1200);
    };

    const handleOpenActions = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setActionsAnchorElement(event.currentTarget);
    };

    const handleCloseActions = () => {
        setActionsAnchorElement(null);
    };

    const handleOpenEmojiModal = () => {
        handleCloseActions();
        setShowEmojiModal(true);
    };

    const handleReply = () => {
        handleCloseActions();
        onReply(msg);
    };

    return (
        <Box
            sx={{
                width: {
                    xs: '100%',
                    md: '75%',
                },
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                ml: isOwn ? 'auto' : 0,
                mr: isOwn ? 0 : 'auto',
                mb: shouldShowReactions ? 3 : 2,
                overflow: 'visible',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: isMobile ? 0 : 1,
                    flexDirection: isOwn ? 'row-reverse' : 'row',
                    maxWidth: '100%',
                    minWidth: 0,
                    overflow: 'visible',
                }}
            >
                {!isMobile && (
                    !isSameAuthor ? (
                        <Button
                            type="button"
                            onClick={() => onAvatarClick(msg.author.imageUrl || '')}
                            sx={{
                                minWidth: 0,
                                p: 0,
                                mb: 0.5,
                                borderRadius: '50%',
                                flexShrink: 0,
                            }}
                        >
                            <Avatar
                                src={msg.author.imageUrl || '/images/default-user.png'}
                                alt={msg.author.name}
                                sx={{
                                    width: 34,
                                    height: 34,
                                    bgcolor: 'var(--color-primary)',
                                    color: 'var(--color-button-text)',
                                    fontWeight: 950,
                                    boxShadow: '0 8px 18px rgba(15, 23, 42, 0.16)',
                                }}
                            >
                                {msg.author.name.slice(0, 1).toUpperCase()}
                            </Avatar>
                        </Button>
                    ) : (
                        <Box
                            sx={{
                                width: 34,
                                flexShrink: 0,
                            }}
                        />
                    )
                )}

                <Box
                    component={motion.div}
                    key={msg.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{
                        overflow: 'visible',
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            overflow: 'visible',
                        }}
                        onClick={() => {
                            if (window.innerWidth <= 768) {
                                setShowMobileReaction((currentValue) => !currentValue);
                            }
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                position: 'relative',
                                minWidth: {
                                    xs: hasReplyPreview ? 190 : 50,
                                    sm: hasReplyPreview ? 220 : 120,
                                },
                                width: 'fit-content',
                                maxWidth: {
                                    xs: '80vw',
                                    md: 560,
                                },
                                p: 1,
                                px: 1.25,
                                borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                backgroundColor: isOwn
                                    ? 'var(--color-primary)'
                                    : 'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                                color: isOwn ? 'var(--color-button-text)' : 'var(--color-text)',
                                border: isOwn
                                    ? '1px solid color-mix(in srgb, var(--color-primary) 72%, #ffffff 28%)'
                                    : '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.10)',
                                overflow: 'hidden',
                            }}
                        >
                            {!isSameAuthor && (
                                <Typography
                                    sx={{
                                        mb: 0.5,
                                        color: isOwn
                                            ? 'rgba(255,255,255,0.9)'
                                            : 'var(--color-primary)',
                                        fontWeight: 950,
                                        fontSize: '0.78rem',
                                        textAlign: isOwn ? 'right' : 'left',
                                    }}
                                >
                                    {formatName(msg.author.name)}
                                </Typography>
                            )}

                            {replyPreview && (
                                <Box
                                    sx={{
                                        mb: 1,
                                        p: 0.75,
                                        display: 'flex',
                                        alignItems: 'stretch',
                                        minWidth: 0,
                                        maxWidth: '100%',
                                        backgroundColor: isOwn
                                            ? 'rgba(255,255,255,0.16)'
                                            : 'color-mix(in srgb, var(--color-card) 82%, var(--color-primary) 18%)',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 3,
                                            borderRadius: 999,
                                            mr: 1,
                                            alignSelf: 'stretch',
                                            flexShrink: 0,
                                            backgroundColor: isOwn
                                                ? 'var(--color-button-text)'
                                                : 'var(--color-primary)',
                                        }}
                                    />

                                    <Box
                                        sx={{
                                            flex: 1,
                                            minWidth: 0,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: '0.74rem',
                                                fontWeight: 950,
                                                color: isOwn
                                                    ? 'var(--color-button-text)'
                                                    : 'var(--color-primary)',
                                                textAlign: 'left',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {replyPreview.username || 'Usuario'}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: '0.74rem',
                                                color: isOwn
                                                    ? 'rgba(255,255,255,0.88)'
                                                    : 'var(--color-secondary-text)',
                                                overflow: 'hidden',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflowWrap: 'break-word',
                                                wordBreak: 'normal',
                                                textAlign: 'left',
                                            }}
                                        >
                                            {replyPreview.textPreview || ''}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {renderType === 'IMAGE' && messageMediaUrl && (
                                <Button
                                    type="button"
                                    onClick={() => onImageClick(messageMediaUrl)}
                                    sx={{
                                        p: 0,
                                        minWidth: 0,
                                        display: 'block',
                                        borderRadius: 1.5,
                                        overflow: 'hidden',
                                        textTransform: 'none',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={messageMediaUrl}
                                        alt={msg.filename || 'Imagen del mensaje'}
                                        sx={{
                                            width: 180,
                                            maxWidth: '100%',
                                            height: 150,
                                            objectFit: 'cover',
                                            display: 'block',
                                            borderRadius: 1.5,
                                            border: '1px solid rgba(255,255,255,0.18)',
                                        }}
                                    />
                                </Button>
                            )}

                            {renderType === 'VIDEO' && messageMediaUrl && (
                                <Button
                                    type="button"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        onPreviewClick('video', messageMediaUrl, msg.filename);
                                    }}
                                    sx={{
                                        p: 0,
                                        minWidth: 0,
                                        display: 'block',
                                        position: 'relative',
                                        borderRadius: 1.5,
                                        overflow: 'hidden',
                                        textTransform: 'none',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: {
                                                xs: 220,
                                                md: 300
                                            },
                                            maxWidth: '100%',
                                            height: 150,
                                            overflow: 'hidden',
                                            position: 'relative',
                                            borderRadius: 1.5,
                                            backgroundColor: '#000000',
                                        }}
                                    >
                                        <Box
                                            component="video"
                                            src={messageMediaUrl}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                opacity: 0.82,
                                                display: 'block',
                                            }}
                                            preload="metadata"
                                        />

                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                inset: 0,
                                                display: 'grid',
                                                placeItems: 'center',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    borderRadius: '50%',
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    backgroundColor: 'rgba(0,0,0,0.56)',
                                                    color: '#ffffff',
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faPlay} />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Button>
                            )}

                            {renderType === 'AUDIO' && messageMediaUrl && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1,
                                        borderRadius: 1.5,
                                        backgroundColor: isOwn
                                            ? 'rgba(255,255,255,0.16)'
                                            : 'color-mix(in srgb, var(--color-card) 82%, var(--color-primary) 18%)',
                                        border: '1px solid rgba(255,255,255,0.14)',
                                    }}
                                >
                                    <Box
                                        component="audio"
                                        controls
                                        src={messageMediaUrl}
                                        sx={{
                                            width: {
                                                xs: 230,
                                                sm: 280,
                                            },
                                            maxWidth: '100%',
                                            display: 'block',
                                        }}
                                    />

                                    {msg.filename && (
                                        <Typography
                                            sx={{
                                                mt: 0.5,
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                color: isOwn
                                                    ? 'rgba(255,255,255,0.82)'
                                                    : 'var(--color-secondary-text)',
                                                overflowWrap: 'break-word',
                                                wordBreak: 'normal',
                                            }}
                                        >
                                            {msg.filename}
                                        </Typography>
                                    )}
                                </Paper>
                            )}

                            {renderType === 'FILE' && messageMediaUrl && (
                                <Button
                                    type="button"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        onPreviewClick('file', messageMediaUrl, msg.filename);
                                    }}
                                    sx={{
                                        p: 1,
                                        minWidth: 0,
                                        width: '100%',
                                        maxWidth: 220,
                                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                        gap: 1,
                                        borderRadius: 1.5,
                                        textTransform: 'none',
                                        color: isOwn ? 'var(--color-button-text)' : 'var(--color-text)',
                                        backgroundColor: isOwn
                                            ? 'rgba(255,255,255,0.14)'
                                            : 'color-mix(in srgb, var(--color-card) 82%, var(--color-primary) 18%)',
                                        border: '1px solid rgba(255,255,255,0.14)',
                                    }}
                                >
                                    <FontAwesomeIcon icon={obtenerIconoArchivo(msg.filename || '')} />

                                    <Box
                                        sx={{
                                            minWidth: 0,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontWeight: 950,
                                                fontSize: '0.82rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {msg.filename || 'Archivo adjunto'}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: '0.72rem',
                                                fontWeight: 750,
                                                color: isOwn
                                                    ? 'rgba(255,255,255,0.82)'
                                                    : 'var(--color-secondary-text)',
                                            }}
                                        >
                                            Toca para previsualizar
                                        </Typography>
                                    </Box>
                                </Button>
                            )}

                            {msg.type === 'STICKER' && (
                                <Typography
                                    component="div"
                                    sx={{
                                        py: 0.25,
                                        px: 0.5,
                                        fontSize: { xs: '3rem', sm: '3.5rem' },
                                        lineHeight: 1.1,
                                        textAlign: 'center',
                                    }}
                                >
                                    {messageText || '✨'}
                                </Typography>
                            )}

                            {msg.type !== 'STICKER' && hasMessageText && (
                                <Box
                                    sx={{
                                        mt: messageMediaUrl ? 0.75 : 0,
                                        display: 'inline-block',
                                        width: 'auto',
                                        maxWidth: '100%',
                                        minWidth: 0,
                                        color: isOwn ? 'var(--color-button-text)' : 'var(--color-text)',
                                        '& .ProseMirror, & .tiptap': {
                                            color: isOwn ? 'var(--color-button-text)' : 'var(--color-text)',
                                            whiteSpace: 'normal',
                                            overflowWrap: 'break-word',
                                            wordBreak: 'normal',
                                            textAlign: 'left',
                                        },
                                        '& .ProseMirror *, & .tiptap *': {
                                            color: isOwn ? 'var(--color-button-text)' : 'var(--color-text)',
                                            overflowWrap: 'break-word',
                                            wordBreak: 'normal',
                                            textAlign: 'left',
                                        },
                                        '& p': {
                                            m: 0,
                                        },
                                    }}
                                >
                                    <TiptapChatViewer content={msg.content} />
                                </Box>
                            )}

                            <Box
                                sx={{
                                    mt: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isOwn ? 'flex-start' : 'flex-end',
                                    gap: 0.5,
                                }}
                            >
                                {timeLabel && (
                                    <Typography
                                        component="span"
                                        sx={{
                                            fontSize: '0.68rem',
                                            fontWeight: 800,
                                            color: isOwn
                                                ? 'rgba(255,255,255,0.76)'
                                                : 'var(--color-secondary-text)',
                                        }}
                                    >
                                        {timeLabel}
                                    </Typography>
                                )}

                                <IconButton
                                    aria-label="Opciones del mensaje"
                                    size="small"
                                    onClick={handleOpenActions}
                                    sx={{
                                        width: 18,
                                        height: 18,
                                        minWidth: 18,
                                        p: 0,
                                        ml: 'auto',
                                        color: isOwn
                                            ? 'rgba(255,255,255,0.86)'
                                            : 'var(--color-secondary-text)',
                                        '& .MuiSvgIcon-root': {
                                            fontSize: 18,
                                            transform: 'scaleX(0.72)',
                                        },
                                    }}
                                >
                                    <MoreVertRoundedIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            {floatingEmoji && (
                                <EmojiFloat emoji={floatingEmoji} side={isOwn ? 'right' : 'left'} />
                            )}
                        </Paper>

                        {shouldShowReactions && (
                            <Box
                                onClick={(event) => event.stopPropagation()}
                                sx={{
                                    position: 'absolute',
                                    zIndex: 5,
                                    bottom: -18,
                                    right: isOwn ? 8 : 'auto',
                                    left: isOwn ? 'auto' : 8,
                                    display: 'flex',
                                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                    pointerEvents: 'auto',
                                }}
                            >
                                <ChatReactions messageId={msg.id} reactions={msg.reactions || []} />
                            </Box>
                        )}

                        <Menu
                            anchorEl={actionsAnchorElement}
                            open={isActionsMenuOpen}
                            onClose={handleCloseActions}
                            slotProps={{
                                paper: {
                                    sx: {
                                        borderRadius: 2,
                                        backgroundColor: 'var(--color-card)',
                                        color: 'var(--color-text)',
                                        border:
                                            '1px solid color-mix(in srgb, var(--color-border) 42%, transparent)',
                                        boxShadow: '0 16px 42px rgba(15, 23, 42, 0.18)',
                                        overflow: 'hidden',
                                    },
                                },
                            }}
                        >
                            <MenuItem
                                onClick={handleOpenEmojiModal}
                                sx={{
                                    gap: 1,
                                    fontWeight: 850,
                                }}
                            >
                                <EmojiEmotionsRoundedIcon fontSize="small" />
                                Reaccionar
                            </MenuItem>

                            <MenuItem
                                onClick={handleReply}
                                sx={{
                                    gap: 1,
                                    fontWeight: 850,
                                }}
                            >
                                <ReplyRoundedIcon fontSize="small" />
                                Responder
                            </MenuItem>
                        </Menu>

                        <EmojiPickerModal
                            show={showEmojiModal}
                            onClose={() => setShowEmojiModal(false)}
                            onSelect={handleEmojiSelect}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};