// src/store/public/useBlogStore.ts

import { create } from 'zustand';
import { getPublicPostById, getPublicPosts } from '../../services/public/blog';
import type { BlogPost } from '../../types/blog';
import type { PublicResourceStatus } from './index';
import {
    getPublicResourceError,
    isPublicRequestCancelled,
    normalizePublicStoreChoirCode,
} from './publicStoreSupport';

interface PublicBlogState {
    posts: BlogPost[];
    currentPost: BlogPost | null;
    postsLoading: boolean;
    postLoading: boolean;
    postsStatus: PublicResourceStatus;
    postStatus: PublicResourceStatus;
    loadedChoirCode: string | null;
    currentPostId: string | null;
    postsErrorCode: string | null;
    postsErrorMessage: string | null;
    postErrorCode: string | null;
    postErrorMessage: string | null;
    fetchPosts: (choirCode: string) => Promise<void>;
    fetchPostById: (choirCode: string, postId: string) => Promise<void>;
    resetCurrentPost: () => void;
    reset: () => void;
}

let postsController: AbortController | null = null;
let postController: AbortController | null = null;

const initialState = {
    posts: [] as BlogPost[],
    currentPost: null,
    postsLoading: false,
    postLoading: false,
    postsStatus: 'idle' as const,
    postStatus: 'idle' as const,
    loadedChoirCode: null,
    currentPostId: null,
    postsErrorCode: null,
    postsErrorMessage: null,
    postErrorCode: null,
    postErrorMessage: null,
};

export const useBlogStore = create<PublicBlogState>((set, get) => ({
    ...initialState,
    fetchPosts: async (choirCode) => {
        const normalizedCode = normalizePublicStoreChoirCode(choirCode);

        if (get().loadedChoirCode === normalizedCode && get().postsStatus === 'ready') {
            return;
        }

        postsController?.abort();
        const controller = new AbortController();
        postsController = controller;

        set((state) => ({
            posts: [],
            currentPost: state.loadedChoirCode === normalizedCode ? state.currentPost : null,
            postsLoading: true,
            postLoading: state.loadedChoirCode === normalizedCode ? state.postLoading : false,
            postsStatus: 'loading',
            postStatus: state.loadedChoirCode === normalizedCode ? state.postStatus : 'idle',
            loadedChoirCode: normalizedCode,
            currentPostId: state.loadedChoirCode === normalizedCode ? state.currentPostId : null,
            postsErrorCode: null,
            postsErrorMessage: null,
            postErrorCode: state.loadedChoirCode === normalizedCode ? state.postErrorCode : null,
            postErrorMessage: state.loadedChoirCode === normalizedCode ? state.postErrorMessage : null,
        }));

        try {
            const data = await getPublicPosts(normalizedCode, controller.signal);

            if (postsController !== controller || get().loadedChoirCode !== normalizedCode) {
                return;
            }

            set({
                posts: data,
                postsLoading: false,
                postsStatus: 'ready',
                postsErrorCode: null,
                postsErrorMessage: null,
            });
        } catch (error) {
            const requestError = error instanceof Error
                ? error
                : new Error('Unexpected public request failure');

            if (isPublicRequestCancelled(requestError)) {
                return;
            }

            if (postsController !== controller || get().loadedChoirCode !== normalizedCode) {
                return;
            }

            const publicError = getPublicResourceError(requestError);
            set({
                posts: [],
                postsLoading: false,
                postsStatus: 'error',
                postsErrorCode: publicError.code,
                postsErrorMessage: publicError.message,
            });
        } finally {
            if (postsController === controller) {
                postsController = null;
            }
        }
    },
    fetchPostById: async (choirCode, postId) => {
        const normalizedCode = normalizePublicStoreChoirCode(choirCode);
        const normalizedPostId = postId.trim();

        postController?.abort();
        const controller = new AbortController();
        postController = controller;

        set((state) => ({
            posts: state.loadedChoirCode === normalizedCode ? state.posts : [],
            currentPost: null,
            postsLoading: state.loadedChoirCode === normalizedCode ? state.postsLoading : false,
            postLoading: true,
            postsStatus: state.loadedChoirCode === normalizedCode ? state.postsStatus : 'idle',
            postStatus: 'loading',
            loadedChoirCode: normalizedCode,
            currentPostId: normalizedPostId,
            postsErrorCode: state.loadedChoirCode === normalizedCode ? state.postsErrorCode : null,
            postsErrorMessage: state.loadedChoirCode === normalizedCode ? state.postsErrorMessage : null,
            postErrorCode: null,
            postErrorMessage: null,
        }));

        try {
            const data = await getPublicPostById(
                normalizedCode,
                normalizedPostId,
                controller.signal,
            );

            if (
                postController !== controller ||
                get().loadedChoirCode !== normalizedCode ||
                get().currentPostId !== normalizedPostId
            ) {
                return;
            }

            set({
                currentPost: data,
                postLoading: false,
                postStatus: 'ready',
                postErrorCode: null,
                postErrorMessage: null,
            });
        } catch (error) {
            const requestError = error instanceof Error
                ? error
                : new Error('Unexpected public request failure');

            if (isPublicRequestCancelled(requestError)) {
                return;
            }

            if (
                postController !== controller ||
                get().loadedChoirCode !== normalizedCode ||
                get().currentPostId !== normalizedPostId
            ) {
                return;
            }

            const publicError = getPublicResourceError(requestError);
            set({
                currentPost: null,
                postLoading: false,
                postStatus: 'error',
                postErrorCode: publicError.code,
                postErrorMessage: publicError.message,
            });
        } finally {
            if (postController === controller) {
                postController = null;
            }
        }
    },
    resetCurrentPost: () => {
        postController?.abort();
        postController = null;
        set({
            currentPost: null,
            currentPostId: null,
            postLoading: false,
            postStatus: 'idle',
            postErrorCode: null,
            postErrorMessage: null,
        });
    },
    reset: () => {
        postsController?.abort();
        postController?.abort();
        postsController = null;
        postController = null;
        set(initialState);
    },
}));
