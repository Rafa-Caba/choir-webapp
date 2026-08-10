// src/components/tiptap-components/TiptapEditor.tsx

import { useEffect } from 'react';
import { Box, Button, ButtonGroup, Paper, Typography } from '@mui/material';
import { EditorContent, useEditor, type JSONContent } from '@tiptap/react';

import '../../assets/styles/components/_tiptapEditor.scss';
import { customExtensions } from '../../utils/tiptap/extensions';
import { emptyEditorContent } from '../../utils/editorDefaults';

interface Props {
    content: JSONContent | null;
    onChange: (value: JSONContent) => void;
}

export const TiptapEditor = ({ content, onChange }: Props) => {
    const safeContent = content ?? emptyEditorContent;

    const editor = useEditor({
        extensions: customExtensions,
        content: safeContent,
        editorProps: {
            attributes: {
                class: 'tiptap-editor-content',
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

        if (JSON.stringify(safeContent) !== JSON.stringify(editor.getJSON())) {
            try {
                editor.commands.setContent(safeContent);
            } catch {
                console.warn('Contenido inválido en editor.');
            }
        }
    }, [editor, safeContent]);

    if (!editor) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: 1.5,
                    backgroundColor:
                        'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                    border: '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                }}
            >
                <Typography sx={{ color: 'var(--color-secondary-text)', fontWeight: 800 }}>
                    Cargando editor...
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper
            elevation={0}
            className="editor-estilo tool_buttons"
            sx={{
                borderRadius: 1.5,
                overflow: 'hidden',
                backgroundColor:
                    'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                border: '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                boxShadow: 'inset 0 1px 16px rgba(15, 23, 42, 0.035)',
            }}
        >
            <Box
                className="editor-toolbar tool_buttons"
                sx={{
                    p: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.75,
                    borderBottom:
                        '1px solid color-mix(in srgb, var(--color-border) 34%, transparent)',
                    backgroundColor:
                        'color-mix(in srgb, var(--color-card) 82%, var(--color-primary) 18%)',
                }}
            >
                <ButtonGroup size="small" variant="outlined">
                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'active' : ''}
                        sx={{ fontWeight: 950 }}
                    >
                        B
                    </Button>

                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'active' : ''}
                        sx={{ fontStyle: 'italic', fontWeight: 950 }}
                    >
                        I
                    </Button>

                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={editor.isActive('underline') ? 'active' : ''}
                        sx={{ textDecoration: 'underline', fontWeight: 950 }}
                    >
                        U
                    </Button>
                </ButtonGroup>

                <ButtonGroup size="small" variant="outlined">
                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}
                    >
                        Izq
                    </Button>

                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}
                    >
                        Centro
                    </Button>

                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}
                    >
                        Der
                    </Button>
                </ButtonGroup>

                <ButtonGroup size="small" variant="outlined">
                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}
                    >
                        H1
                    </Button>

                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
                    >
                        H2
                    </Button>
                </ButtonGroup>

                <ButtonGroup size="small" variant="outlined">
                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'active' : ''}
                    >
                        • Lista
                    </Button>

                    <Button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'active' : ''}
                    >
                        1. Lista
                    </Button>
                </ButtonGroup>
            </Box>

            <Box
                sx={{
                    p: {
                        xs: 1.25,
                        md: 1.5,
                    },
                    minHeight: 260,
                    maxHeight: {
                        xs: 420,
                        md: 560,
                    },
                    overflowY: 'auto',
                    color: 'var(--color-text)',
                    '& .ProseMirror': {
                        minHeight: 220,
                        outline: 'none',
                        textAlign: 'left',
                        lineHeight: 1.45,
                    },
                    '& .ProseMirror p': {
                        m: 0,
                        p: 0,
                        lineHeight: 'inherit',
                    },
                    '& .ProseMirror p + p': {
                        mt: 0,
                    },
                }}
            >
                <EditorContent editor={editor} />
            </Box>
        </Paper>
    );
};