// src/utils/tiptap/extensions.ts
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';

export const customExtensions = [
    StarterKit.configure({
        heading: false,
        listItem: false,
        bulletList: false,
        orderedList: false,
    }),
    Underline,
    TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'left',
    }),
    Heading,
    ListItem,
    BulletList,
    OrderedList,
];
