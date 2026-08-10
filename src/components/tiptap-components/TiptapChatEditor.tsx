// src/components/tiptap-components/TiptapChatEditor.tsx

import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    type ReactNode,
} from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EmojiEmotionsRoundedIcon from '@mui/icons-material/EmojiEmotionsRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import EmojiPicker from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';

export interface TiptapChatEditorHandle {
    clear: () => void;
}

interface TiptapChatEditorProps {
    content: JSONContent | null;
    onChange: (content: JSONContent) => void;
    mobileActions?: ReactNode;
}

interface ToolbarButtonsProps {
    editor: Editor;
    compact?: boolean;
    onAfterAction?: () => void;
}

type TextAlignment = 'left' | 'center' | 'right';
type ButtonVariant = 'text' | 'outlined' | 'contained';

const emptyChatContent: JSONContent = {
    type: 'doc',
    content: [{ type: 'paragraph' }],
};

const isLeftAlignActive = (editor: Editor): boolean => {
    return !editor.isActive({ textAlign: 'center' }) && !editor.isActive({ textAlign: 'right' });
};

const getAlignButtonVariant = (editor: Editor, alignment: TextAlignment): ButtonVariant => {
    if (alignment === 'left') {
        return isLeftAlignActive(editor) ? 'contained' : 'outlined';
    }

    return editor.isActive({ textAlign: alignment }) ? 'contained' : 'outlined';
};

const ToolbarButtons = ({
    editor,
    compact = false,
    onAfterAction,
}: ToolbarButtonsProps) => {
    const buttonSx = {
        minWidth: compact ? 44 : 36,
        px: compact ? 1.2 : 1,
        borderRadius: 1.25,
        fontWeight: 950,
        textTransform: 'none',
    };

    const runAction = (action: () => void) => {
        action();
        onAfterAction?.();
    };

    return (
        <>
            <Button
                type="button"
                size="small"
                variant={editor.isActive('bold') ? 'contained' : 'outlined'}
                onClick={() => runAction(() => editor.chain().focus().toggleBold().run())}
                sx={buttonSx}
            >
                B
            </Button>

            <Button
                type="button"
                size="small"
                variant={editor.isActive('italic') ? 'contained' : 'outlined'}
                onClick={() => runAction(() => editor.chain().focus().toggleItalic().run())}
                sx={{
                    ...buttonSx,
                    fontStyle: 'italic',
                }}
            >
                I
            </Button>

            <Button
                type="button"
                size="small"
                variant={editor.isActive('underline') ? 'contained' : 'outlined'}
                onClick={() => runAction(() => editor.chain().focus().toggleUnderline().run())}
                sx={{
                    ...buttonSx,
                    textDecoration: 'underline',
                }}
            >
                U
            </Button>

            <Button
                type="button"
                size="small"
                variant={editor.isActive('heading', { level: 1 }) ? 'contained' : 'outlined'}
                onClick={() => runAction(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}
                sx={buttonSx}
            >
                H1
            </Button>

            <Button
                type="button"
                size="small"
                variant={editor.isActive('heading', { level: 2 }) ? 'contained' : 'outlined'}
                onClick={() => runAction(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
                sx={buttonSx}
            >
                H2
            </Button>

            <Button
                type="button"
                size="small"
                variant={getAlignButtonVariant(editor, 'left')}
                onClick={() => runAction(() => editor.chain().focus().setTextAlign('left').run())}
                sx={buttonSx}
            >
                Izq
            </Button>

            <Button
                type="button"
                size="small"
                variant={getAlignButtonVariant(editor, 'center')}
                onClick={() => runAction(() => editor.chain().focus().setTextAlign('center').run())}
                sx={buttonSx}
            >
                Centro
            </Button>

            <Button
                type="button"
                size="small"
                variant={getAlignButtonVariant(editor, 'right')}
                onClick={() => runAction(() => editor.chain().focus().setTextAlign('right').run())}
                sx={buttonSx}
            >
                Der
            </Button>

            <Button
                type="button"
                size="small"
                variant={editor.isActive('bulletList') ? 'contained' : 'outlined'}
                onClick={() => runAction(() => editor.chain().focus().toggleBulletList().run())}
                sx={buttonSx}
            >
                • Lista
            </Button>

            <Button
                type="button"
                size="small"
                variant={editor.isActive('orderedList') ? 'contained' : 'outlined'}
                onClick={() => runAction(() => editor.chain().focus().toggleOrderedList().run())}
                sx={buttonSx}
            >
                1. Lista
            </Button>
        </>
    );
};

export const TiptapChatEditor = forwardRef<TiptapChatEditorHandle, TiptapChatEditorProps>(
    ({ content, onChange, mobileActions }, ref) => {
        const [showEmojis, setShowEmojis] = useState(false);
        const [showMobileTools, setShowMobileTools] = useState(false);

        const emojiRef = useRef<HTMLDivElement>(null);
        const isMobile = useMediaQuery('(max-width: 768px)');

        const editor = useEditor({
            extensions: [
                StarterKit.configure({ heading: false }),
                Heading.configure({ levels: [1, 2] }),
                Underline,
                TextAlign.configure({
                    types: ['heading', 'paragraph'],
                    defaultAlignment: 'left',
                }),
                Placeholder.configure({ placeholder: 'Escribe tu mensaje…' }),
            ],
            content: content ?? emptyChatContent,
            editorProps: {
                attributes: {
                    class: 'tiptap-chat-editor-content',
                },
            },
            onUpdate: ({ editor: updatedEditor }) => {
                onChange(updatedEditor.getJSON());
            },
        });

        useEffect(() => {
            if (!editor) {
                return;
            }

            const nextContent = content ?? emptyChatContent;
            const currentContent = editor.getJSON();

            if (JSON.stringify(currentContent) !== JSON.stringify(nextContent)) {
                editor.commands.setContent(nextContent);
            }
        }, [content, editor]);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    event.target instanceof Node &&
                    emojiRef.current &&
                    !emojiRef.current.contains(event.target)
                ) {
                    setShowEmojis(false);
                }
            };

            if (showEmojis) {
                document.addEventListener('mousedown', handleClickOutside);
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [showEmojis]);

        useImperativeHandle(ref, () => ({
            clear: () => {
                editor?.commands.setContent(emptyChatContent);
            },
        }));

        const handleEmojiClick = (emojiData: EmojiClickData) => {
            editor?.chain().focus().insertContent(emojiData.emoji).run();
            setShowEmojis(false);
        };

        const handleToggleEmojiPicker = () => {
            setShowEmojis((currentValue) => !currentValue);
        };

        const handleCloseMobileTools = () => {
            setShowMobileTools(false);
        };

        if (!editor) {
            return null;
        }

        return (
            <Box
                sx={{
                    width: '100%',
                    minWidth: 0,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                    overflow: 'visible',
                }}
            >
                {!isMobile && (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 1fr) auto',
                            gap: 1,
                            alignItems: 'start',
                            overflow: 'visible',
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                minWidth: 0,
                                p: 0.5,
                                borderRadius: 1.5,
                                backgroundColor: 'var(--color-background)',
                                border:
                                    '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 0.5,
                                overflow: 'hidden',
                            }}
                        >
                            <ToolbarButtons editor={editor} />
                        </Paper>

                        <Box
                            ref={emojiRef}
                            sx={{
                                position: 'relative',
                                flexShrink: 0,
                                overflow: 'visible',
                            }}
                        >
                            <Tooltip title="Insertar emoji">
                                <IconButton
                                    type="button"
                                    onClick={handleToggleEmojiPicker}
                                    sx={{
                                        color: showEmojis
                                            ? 'var(--color-button-text)'
                                            : 'var(--color-primary)',
                                        backgroundColor: showEmojis
                                            ? 'var(--color-primary)'
                                            : 'color-mix(in srgb, var(--color-background) 86%, var(--color-primary) 14%)',
                                        border:
                                            '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                        '&:hover': {
                                            backgroundColor: showEmojis
                                                ? 'color-mix(in srgb, var(--color-primary) 84%, #000 16%)'
                                                : 'color-mix(in srgb, var(--color-background) 78%, var(--color-primary) 22%)',
                                        },
                                    }}
                                >
                                    <EmojiEmotionsRoundedIcon />
                                </IconButton>
                            </Tooltip>

                            {showEmojis && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        position: 'absolute',
                                        zIndex: 20,
                                        bottom: 'calc(100% + 8px)',
                                        right: 0,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border:
                                            '1px solid color-mix(in srgb, var(--color-border) 42%, transparent)',
                                        boxShadow: '0 18px 52px rgba(15, 23, 42, 0.22)',
                                        backgroundColor: 'var(--color-card)',
                                    }}
                                >
                                    <EmojiPicker
                                        onEmojiClick={handleEmojiClick}
                                        height={350}
                                        width={300}
                                        lazyLoadEmojis
                                        previewConfig={{ showPreview: false }}
                                    />
                                </Paper>
                            )}
                        </Box>
                    </Box>
                )}

                <Paper
                    elevation={0}
                    sx={{
                        minHeight: {
                            xs: 64,
                            md: 72,
                        },
                        maxHeight: {
                            xs: 120,
                            md: 150,
                        },
                        borderRadius: 1.5,
                        backgroundColor: 'var(--color-background)',
                        border:
                            '1px solid color-mix(in srgb, var(--color-border) 36%, transparent)',
                        color: 'var(--color-text)',
                        overflow: 'hidden',
                        '& .tiptap-chat-editor-content': {
                            minHeight: {
                                xs: 64,
                                md: 72,
                            },
                            maxHeight: {
                                xs: 120,
                                md: 150,
                            },
                            height: 'auto',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            px: 1.25,
                            py: 1,
                            boxSizing: 'border-box',
                            outline: 'none',
                            backgroundColor: 'var(--color-background) !important',
                            color: 'var(--color-text)',
                            fontSize: '0.94rem',
                            lineHeight: 1.45,
                            textAlign: 'left',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        },
                        '& .tiptap-chat-editor-content::-webkit-scrollbar': {
                            display: 'none',
                        },
                        '& .tiptap-chat-editor-content p': {
                            m: 0,
                            p: 0,
                            lineHeight: 'inherit',
                        },
                        '& .tiptap-chat-editor-content h1': {
                            m: 0,
                            fontSize: '1.25rem',
                            fontWeight: 950,
                            lineHeight: 1.2,
                        },
                        '& .tiptap-chat-editor-content h2': {
                            m: 0,
                            fontSize: '1.08rem',
                            fontWeight: 950,
                            lineHeight: 1.25,
                        },
                        '& .tiptap-chat-editor-content ul, & .tiptap-chat-editor-content ol': {
                            my: 0.5,
                            pl: 2.25,
                        },
                        '& .tiptap-chat-editor-content li': {
                            my: 0.15,
                        },
                        '& .tiptap-chat-editor-content p.is-editor-empty:first-of-type::before': {
                            content: 'attr(data-placeholder)',
                            color: 'var(--color-secondary-text)',
                            float: 'left',
                            height: 0,
                            pointerEvents: 'none',
                            opacity: 0.82,
                        },
                    }}
                >
                    <EditorContent editor={editor} />
                </Paper>

                {isMobile && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            minWidth: 0,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                minWidth: 0,
                            }}
                        >
                            <Tooltip title="Formato de texto">
                                <IconButton
                                    type="button"
                                    onClick={() => setShowMobileTools(true)}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        color: 'var(--color-primary)',
                                        backgroundColor:
                                            'color-mix(in srgb, var(--color-background) 86%, var(--color-primary) 14%)',
                                        border:
                                            '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                        '&:hover': {
                                            backgroundColor:
                                                'color-mix(in srgb, var(--color-background) 78%, var(--color-primary) 22%)',
                                        },
                                    }}
                                >
                                    <MoreHorizRoundedIcon />
                                </IconButton>
                            </Tooltip>

                            <Box
                                ref={emojiRef}
                                sx={{
                                    position: 'relative',
                                    flexShrink: 0,
                                    overflow: 'visible',
                                }}
                            >
                                <Tooltip title="Insertar emoji">
                                    <IconButton
                                        type="button"
                                        onClick={handleToggleEmojiPicker}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            color: showEmojis
                                                ? 'var(--color-button-text)'
                                                : 'var(--color-primary)',
                                            backgroundColor: showEmojis
                                                ? 'var(--color-primary)'
                                                : 'color-mix(in srgb, var(--color-background) 86%, var(--color-primary) 14%)',
                                            border:
                                                '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                                            '&:hover': {
                                                backgroundColor: showEmojis
                                                    ? 'color-mix(in srgb, var(--color-primary) 84%, #000 16%)'
                                                    : 'color-mix(in srgb, var(--color-background) 78%, var(--color-primary) 22%)',
                                            },
                                        }}
                                    >
                                        <EmojiEmotionsRoundedIcon />
                                    </IconButton>
                                </Tooltip>

                                {showEmojis && (
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            position: 'absolute',
                                            zIndex: 20,
                                            bottom: 'calc(100% + 8px)',
                                            left: 0,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            border:
                                                '1px solid color-mix(in srgb, var(--color-border) 42%, transparent)',
                                            boxShadow: '0 18px 52px rgba(15, 23, 42, 0.22)',
                                            backgroundColor: 'var(--color-card)',
                                            maxWidth: 'calc(100vw - 32px)',
                                        }}
                                    >
                                        <EmojiPicker
                                            onEmojiClick={handleEmojiClick}
                                            height={350}
                                            width={300}
                                            lazyLoadEmojis
                                            previewConfig={{ showPreview: false }}
                                        />
                                    </Paper>
                                )}
                            </Box>
                        </Box>

                        {mobileActions && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: 1,
                                    minWidth: 0,
                                    flexShrink: 0,
                                }}
                            >
                                {mobileActions}
                            </Box>
                        )}
                    </Box>
                )}

                <Dialog
                    open={showMobileTools && isMobile}
                    onClose={handleCloseMobileTools}
                    fullWidth
                    maxWidth="xs"
                    scroll="paper"
                    slotProps={{
                        paper: {
                            sx: {
                                borderRadius: 2,
                                backgroundColor: 'var(--color-card)',
                                color: 'var(--color-text)',
                                border:
                                    '1px solid color-mix(in srgb, var(--color-border) 46%, transparent)',
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
                            borderBottom:
                                '1px solid color-mix(in srgb, var(--color-border) 36%, transparent)',
                        }}
                    >
                        <Typography
                            component="span"
                            sx={{
                                fontWeight: 950,
                            }}
                        >
                            Formato de texto
                        </Typography>

                        <IconButton
                            aria-label="Cerrar formato de texto"
                            onClick={handleCloseMobileTools}
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
                            mt: 2,
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
                                flexWrap: 'wrap',
                                gap: 1,
                            }}
                        >
                            <ToolbarButtons
                                editor={editor}
                                compact
                                onAfterAction={handleCloseMobileTools}
                            />
                        </Box>
                    </DialogContent>
                </Dialog>
            </Box>
        );
    },
);

TiptapChatEditor.displayName = 'TiptapChatEditor';