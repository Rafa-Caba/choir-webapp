// src/components/chat/AdminChatGroup.tsx

import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Swal from 'sweetalert2';
import type { JSONContent } from '@tiptap/react';

import {
    Box,
    Button,
    IconButton,
    Paper,
    Typography,
} from '@mui/material';

import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

import { useChatStore } from '../../store/admin/useChatStore';
import { useAuth } from '../../context/AuthContext';

import { ChatBubbleContainer } from './ChatBubbleContainer';
import { ChatPreviewContainer } from './ChatPreviewContainer';
import { ChatInputArea } from './ChatInputArea';
import { ChatImageModal } from './ChatImageModal';
import { ChatFilePreviewModal } from './ChatFilePreviewModal';
import { ChatDirectory } from './ChatDirectory';

import { scrollChatToBottom } from '../../utils';
import type { ChatMessage } from '../../types/chat';
import type { JsonObject, JsonValue } from '../../types/json';

type ChatAttachmentType = 'image' | 'file' | 'audio' | 'video';

const getEmptyContent = (): JSONContent => ({
    type: 'doc',
    content: [{ type: 'paragraph' }],
});

const hasTextInContent = (content: JSONContent): boolean => {
    return Boolean(
        content.content?.some((block) =>
            block.content?.some((child) => Boolean(child.text?.trim())),
        ),
    );
};

const getFileTypeFromName = (fileName: string): ChatAttachmentType => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        return 'image';
    }

    if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) {
        return 'audio';
    }

    if (['mp4', 'mov', 'webm', 'avi'].includes(extension)) {
        return 'video';
    }

    return 'file';
};

const isJsonArray = (value: JsonValue | undefined): value is JsonValue[] => (
    Array.isArray(value)
);

const isJsonObject = (value: JsonValue): value is JsonObject => (
    typeof value === 'object' && value !== null && !Array.isArray(value)
);

const getReplyPreviewText = (message: ChatMessage | null): string => {
    if (!message) {
        return '';
    }

    const firstBlock = message.content.content[0];
    const nestedContent = firstBlock?.content;

    if (!isJsonArray(nestedContent)) {
        return '';
    }

    const firstChild = nestedContent[0];

    if (!firstChild || !isJsonObject(firstChild)) {
        return '';
    }

    return typeof firstChild.text === 'string' ? firstChild.text : '';
};

export const AdminChatGroup = () => {
    const { user, token } = useAuth();

    const {
        messages,
        isSending,
        hasMoreMessages,
        connect,
        sendMessage,
        loadHistory,
        loadMoreMessages,
        fetchDirectory,
        allUsers,
        onlineUsers,
    } = useChatStore();

    const [messageContent, setMessageContent] = useState<JSONContent>(getEmptyContent());

    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<ChatAttachmentType | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewName, setPreviewName] = useState<string | undefined>();
    const [previewType, setPreviewType] = useState<ChatAttachmentType | null>(null);

    const [modalPreviewType, setModalPreviewType] = useState<ChatAttachmentType | null>(null);
    const [modalPreviewUrl, setModalPreviewUrl] = useState<string | null>(null);
    const [modalPreviewName, setModalPreviewName] = useState<string | undefined>();

    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

    const editorRef = useRef<{ clear: () => void }>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastMessageIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (token && user) {
            connect(token, user);
            void loadHistory();
            void fetchDirectory();
        }
    }, [token, user, connect, loadHistory, fetchDirectory]);

    useEffect(() => {
        if (messages.length === 0) {
            return;
        }

        const currentLastId = messages[messages.length - 1].id;

        if (currentLastId !== lastMessageIdRef.current) {
            lastMessageIdRef.current = currentLastId;
            scrollChatToBottom(messagesContainerRef.current);
        }
    }, [messages]);

    useEffect(() => {
        const container = messagesContainerRef.current;

        if (!container) {
            return undefined;
        }

        const handleScroll = async () => {
            if (
                container.scrollTop === 0 &&
                !isLoadingMore &&
                messages.length > 0 &&
                hasMoreMessages
            ) {
                setIsLoadingMore(true);

                const scrollHeightBefore = container.scrollHeight;

                await loadMoreMessages();

                window.requestAnimationFrame(() => {
                    const scrollHeightAfter = container.scrollHeight;
                    const heightDifference = scrollHeightAfter - scrollHeightBefore;

                    if (heightDifference > 0) {
                        container.scrollTop = heightDifference;
                    }

                    setIsLoadingMore(false);
                });
            }
        };

        container.addEventListener('scroll', handleScroll);

        return () => container.removeEventListener('scroll', handleScroll);
    }, [isLoadingMore, messages.length, hasMoreMessages, loadMoreMessages]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const isOwnMessage = (authorId: string) => authorId === user?.id;

    const resetSelectedFile = () => {
        if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        setSelectedFile(null);
        setFileType(null);
        setPreviewUrl(null);
        setPreviewName(undefined);
        setPreviewType(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async () => {
        const hasText = hasTextInContent(messageContent);

        if (!hasText && !selectedFile) {
            return;
        }

        if (!user) {
            return;
        }

        try {
            await sendMessage(
                messageContent,
                selectedFile || undefined,
                fileType || undefined,
                replyTo?.id,
            );

            editorRef.current?.clear();
            setMessageContent(getEmptyContent());
            resetSelectedFile();
            setReplyTo(null);
        } catch (error) {
            console.error('Error sending message:', error);
            Swal.fire('Error', 'No se pudo enviar el mensaje.', 'error');
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        const detectedType = getFileTypeFromName(file.name);

        setSelectedFile(file);
        setFileType(detectedType);
        setPreviewUrl(URL.createObjectURL(file));
        setPreviewName(file.name);
        setPreviewType(detectedType);
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handlePreviewClick = (type: ChatAttachmentType, url: string, name?: string) => {
        setModalPreviewType(type);
        setModalPreviewUrl(url);
        setModalPreviewName(name);
    };

    const handleReplyClick = (message: ChatMessage) => {
        setReplyTo(message);
    };

    const handleCancelReply = () => {
        setReplyTo(null);
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
                overflow: 'hidden',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: 0,
                    p: {
                        xs: 1,
                        md: 1.5,
                    },
                    borderRadius: 2,
                    background:
                        'linear-gradient(145deg, color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%) 0%, color-mix(in srgb, var(--color-card) 76%, transparent) 100%)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 38%, transparent)',
                    boxShadow:
                        'inset 0 1px 0 color-mix(in srgb, var(--color-button-text) 14%, transparent), 0 12px 42px rgba(15, 23, 42, 0.06)',
                    color: 'var(--color-text)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    gap: 1.25,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        flexShrink: 0,
                        px: {
                            xs: 1,
                            md: 1.5,
                        },
                        py: 1,
                        borderRadius: 1.5,
                        backgroundColor:
                            'color-mix(in srgb, var(--color-card) 84%, var(--color-primary) 16%)',
                        border: '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                        display: 'flex',
                        flexDirection: {
                            xs: 'column',
                            md: 'row',
                        },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                        }}
                    >
                        <ChatRoundedIcon sx={{ color: 'var(--color-primary)' }} />

                        <Typography
                            component="h1"
                            sx={{
                                m: 0,
                                fontSize: {
                                    xs: '1.25rem',
                                    md: '1.55rem',
                                },
                                fontWeight: 950,
                            }}
                        >
                            Chat de Grupo
                        </Typography>

                        <ChatDirectory allUsers={allUsers} onlineUsers={onlineUsers} />
                    </Box>

                    <Button
                        component={RouterLink}
                        to="/admin"
                        variant="contained"
                        startIcon={<HomeRoundedIcon />}
                        sx={{
                            display: {
                                xs: 'none',
                                md: 'inline-flex',
                            },
                            borderRadius: 1.5,
                            fontWeight: 950,
                        }}
                    >
                        Ir al Inicio
                    </Button>
                </Paper>

                <ChatBubbleContainer
                    messages={messages}
                    messagesContainerRef={messagesContainerRef}
                    isLoadingMore={isLoadingMore}
                    hasMoreMessages={hasMoreMessages}
                    isOwnMessage={isOwnMessage}
                    onImageClick={setExpandedImage}
                    onPreviewClick={handlePreviewClick}
                    onReply={handleReplyClick}
                />

                {replyTo && (
                    <Paper
                        elevation={0}
                        sx={{
                            flexShrink: 0,
                            mx: {
                                xs: 0,
                                md: 1,
                            },
                            px: 1.25,
                            py: 1,
                            borderRadius: 1.5,
                            backgroundColor:
                                'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                            border: '1px solid color-mix(in srgb, var(--color-border) 36%, transparent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                sx={{
                                    fontWeight: 950,
                                    fontSize: '0.86rem',
                                }}
                            >
                                Respondiendo a{' '}
                                {replyTo.author?.name || replyTo.author?.username || replyTo.author?.id}
                            </Typography>

                            <Typography
                                sx={{
                                    color: 'var(--color-secondary-text)',
                                    fontWeight: 750,
                                    fontSize: '0.8rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: {
                                        xs: 220,
                                        sm: 420,
                                        md: 720,
                                    },
                                }}
                            >
                                {getReplyPreviewText(replyTo)}
                            </Typography>
                        </Box>

                        <IconButton
                            aria-label="Cancelar respuesta"
                            onClick={handleCancelReply}
                            sx={{
                                color: 'var(--color-text)',
                            }}
                        >
                            <CloseRoundedIcon />
                        </IconButton>
                    </Paper>
                )}

                <ChatPreviewContainer
                    previewType={previewType}
                    previewUrl={previewUrl}
                    previewName={previewName}
                    loading={isSending}
                    onPreviewClick={handlePreviewClick}
                    onImageClick={setExpandedImage}
                />

                <ChatInputArea
                    messageContent={messageContent}
                    setMessageContent={setMessageContent}
                    onFileSelect={handleFileSelect}
                    onSend={handleSendMessage}
                    fileInputRef={fileInputRef}
                    onAttachClick={handleAttachClick}
                    editorRef={editorRef}
                    loading={isSending}
                />
            </Paper>

            <ChatImageModal imageUrl={expandedImage} onClose={() => setExpandedImage(null)} />

            <ChatFilePreviewModal
                type={modalPreviewType}
                fileUrl={modalPreviewUrl}
                fileName={modalPreviewName}
                onClose={() => setModalPreviewUrl(null)}
            />
        </Box>
    );
};