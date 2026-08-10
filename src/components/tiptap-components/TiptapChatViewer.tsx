// src/components/tiptap-components/TiptapChatViewer.tsx

import { Box } from '@mui/material';

import { EditorContent, useEditor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';

interface TiptapChatViewerProps {
    content: JSONContent;
}

export const TiptapChatViewer = ({ content }: TiptapChatViewerProps) => {
    const editor = useEditor({
        editable: false,
        content,
        extensions: [
            StarterKit.configure({ heading: false }),
            Heading.configure({ levels: [1, 2] }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                defaultAlignment: 'left',
            }),
        ],
        editorProps: {
            attributes: {
                class: 'chat-viewer ProseMirror chat-text-color',
            },
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <Box
            sx={{
                display: 'inline-block',
                width: 'auto',
                maxWidth: '100%',
                minWidth: 0,
                verticalAlign: 'top',
                color: 'inherit',
                whiteSpace: 'normal',
                overflowWrap: 'normal',
                wordBreak: 'normal',
                '& .ProseMirror': {
                    display: 'inline-block',
                    width: 'auto',
                    maxWidth: '100%',
                    minWidth: 0,
                    outline: 'none',
                    color: 'inherit',
                    fontSize: '0.92rem',
                    lineHeight: 1.45,
                    whiteSpace: 'normal',
                    overflowWrap: 'break-word',
                    wordBreak: 'normal',
                    textAlign: 'left',
                },
                '& .ProseMirror p': {
                    m: 0,
                    p: 0,
                    width: 'max-content',
                    maxWidth: '100%',
                    whiteSpace: 'normal',
                    overflowWrap: 'break-word',
                    wordBreak: 'normal',
                },
                '& .ProseMirror h1': {
                    m: 0,
                    width: 'max-content',
                    maxWidth: '100%',
                    fontSize: '1.25rem',
                    fontWeight: 950,
                    lineHeight: 1.2,
                    whiteSpace: 'normal',
                    overflowWrap: 'break-word',
                    wordBreak: 'normal',
                },
                '& .ProseMirror h2': {
                    m: 0,
                    width: 'max-content',
                    maxWidth: '100%',
                    fontSize: '1.08rem',
                    fontWeight: 950,
                    lineHeight: 1.25,
                    whiteSpace: 'normal',
                    overflowWrap: 'break-word',
                    wordBreak: 'normal',
                },
                '& .ProseMirror ul, & .ProseMirror ol': {
                    my: 0.5,
                    pl: 2.25,
                    width: 'max-content',
                    maxWidth: '100%',
                    whiteSpace: 'normal',
                    overflowWrap: 'break-word',
                    wordBreak: 'normal',
                },
                '& .ProseMirror li': {
                    my: 0.15,
                    whiteSpace: 'normal',
                    overflowWrap: 'break-word',
                    wordBreak: 'normal',
                },
            }}
        >
            <EditorContent editor={editor} />
        </Box>
    );
};