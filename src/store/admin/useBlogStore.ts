// src/store/admin/useBlogStore.ts

import { create } from 'zustand';
import {
    commentPost,
    createPost,
    deletePost,
    getAllPosts,
    getPostById,
    likePost,
    updatePost,
} from '../../services/admin/blog';
import type { TipTapContent } from '../../types/annoucement';
import type { BlogPost, CreateBlogPayload } from '../../types/blog';

interface AdminBlogState {
    posts: BlogPost[];
    currentPost: BlogPost | null;
    loading: boolean;
    error: string | null;
    fetchPosts: () => Promise<void>;
    getPost: (id: string) => Promise<BlogPost | null>;
    addPost: (payload: CreateBlogPayload) => Promise<void>;
    editPost: (id: string, payload: Partial<CreateBlogPayload>) => Promise<void>;
    removePost: (id: string) => Promise<void>;
    toggleLike: (id: string) => Promise<void>;
    addComment: (id: string, text: TipTapContent) => Promise<void>;
}

const getErrorMessage = (error: Error, fallbackMessage: string): string => (
    error.message.trim() || fallbackMessage
);

export const useBlogStore = create<AdminBlogState>((set, get) => ({
    posts: [],
    currentPost: null,
    loading: false,
    error: null,

    fetchPosts: async () => {
        set({ loading: true, error: null });

        try {
            const data = await getAllPosts();
            set({ posts: data });
        } catch (error) {
            set({
                error: error instanceof Error
                    ? getErrorMessage(error, 'Error fetching posts')
                    : 'Error fetching posts',
            });
        } finally {
            set({ loading: false });
        }
    },

    getPost: async (id) => {
        set({ loading: true, error: null });

        try {
            const post = await getPostById(id);
            set({ currentPost: post });
            return post;
        } catch (error) {
            set({
                error: error instanceof Error
                    ? getErrorMessage(error, 'Error fetching post')
                    : 'Error fetching post',
            });
            return null;
        } finally {
            set({ loading: false });
        }
    },

    addPost: async (payload) => {
        set({ loading: true, error: null });

        try {
            await createPost(payload);
            await get().fetchPosts();
        } finally {
            set({ loading: false });
        }
    },

    editPost: async (id, payload) => {
        set({ loading: true, error: null });

        try {
            await updatePost(id, payload);
            await get().fetchPosts();
        } finally {
            set({ loading: false });
        }
    },

    removePost: async (id) => {
        await deletePost(id);
        set((state) => ({
            posts: state.posts.filter((post) => post.id !== id),
        }));
    },

    toggleLike: async (id) => {
        await likePost(id);
    },

    addComment: async (id, text) => {
        await commentPost(id, text);
        await get().getPost(id);
    },
}));
