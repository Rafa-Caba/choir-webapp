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
import {
    beginTenantStoreRequest,
    isTenantStoreRequestCurrent,
} from '../tenantStoreScope';
import type { TipTapContent } from '../../types/annoucement';
import type { BlogPost, CreateBlogPayload } from '../../types/blog';

interface AdminBlogState {
    readonly posts: BlogPost[];
    readonly currentPost: BlogPost | null;
    readonly activeChoirId: string | null;
    readonly loading: boolean;
    readonly error: string | null;
    readonly fetchPosts: () => Promise<void>;
    readonly getPost: (id: string) => Promise<BlogPost | null>;
    readonly addPost: (payload: CreateBlogPayload) => Promise<BlogPost>;
    readonly editPost: (id: string, payload: Partial<CreateBlogPayload>) => Promise<BlogPost>;
    readonly removePost: (id: string) => Promise<void>;
    readonly toggleLike: (id: string) => Promise<void>;
    readonly addComment: (id: string, text: TipTapContent) => Promise<void>;
}

const getErrorMessage = (error: Error, fallbackMessage: string): string => (
    error.message.trim() || fallbackMessage
);

export const useBlogStore = create<AdminBlogState>((set) => ({
    posts: [],
    currentPost: null,
    activeChoirId: null,
    loading: false,
    error: null,

    fetchPosts: async () => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, error: null, activeChoirId: scope.choirId });

        try {
            const posts = await getAllPosts();

            if (isTenantStoreRequestCurrent(scope)) {
                set({ posts });
            }
        } catch (error) {
            if (isTenantStoreRequestCurrent(scope)) {
                set({
                    error: error instanceof Error
                        ? getErrorMessage(error, 'Error fetching posts')
                        : 'Error fetching posts',
                });
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    getPost: async (id) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, error: null, activeChoirId: scope.choirId });

        try {
            const post = await getPostById(id);

            if (!isTenantStoreRequestCurrent(scope)) {
                return null;
            }

            set({ currentPost: post });
            return post;
        } catch (error) {
            if (isTenantStoreRequestCurrent(scope)) {
                set({
                    error: error instanceof Error
                        ? getErrorMessage(error, 'Error fetching post')
                        : 'Error fetching post',
                });
            }
            return null;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    addPost: async (payload) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, error: null, activeChoirId: scope.choirId });

        try {
            const post = await createPost(payload);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    posts: [post, ...state.posts],
                    currentPost: post,
                }));
            }

            return post;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    editPost: async (id, payload) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, error: null, activeChoirId: scope.choirId });

        try {
            const post = await updatePost(id, payload);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    posts: state.posts.map((item) => item.id === post.id ? post : item),
                    currentPost: post,
                }));
            }

            return post;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    removePost: async (id) => {
        const scope = beginTenantStoreRequest();
        await deletePost(id);

        if (isTenantStoreRequestCurrent(scope)) {
            set((state) => ({
                posts: state.posts.filter((post) => post.id !== id),
                currentPost: state.currentPost?.id === id ? null : state.currentPost,
            }));
        }
    },

    toggleLike: async (id) => {
        const scope = beginTenantStoreRequest();
        const result = await likePost(id);

        if (isTenantStoreRequestCurrent(scope)) {
            set((state) => ({
                posts: state.posts.map((post) => (
                    post.id === id ? { ...post, likes: result.likes } : post
                )),
                currentPost: state.currentPost?.id === id
                    ? { ...state.currentPost, likes: result.likes }
                    : state.currentPost,
            }));
        }
    },

    addComment: async (id, text) => {
        const scope = beginTenantStoreRequest();
        const comment = await commentPost(id, text);

        if (isTenantStoreRequestCurrent(scope)) {
            set((state) => ({
                posts: state.posts.map((post) => (
                    post.id === id
                        ? { ...post, comments: [...post.comments, comment] }
                        : post
                )),
                currentPost: state.currentPost?.id === id
                    ? {
                        ...state.currentPost,
                        comments: [...state.currentPost.comments, comment],
                    }
                    : state.currentPost,
            }));
        }
    },
}));
