// src/services/admin/blog.ts

import api from '../../api/axios';
import type { TipTapContent } from '../../types/annoucement';
import type { BlogPost, CreateBlogPayload } from '../../types/blog';

const createBlogFormData = (
    payload: Partial<CreateBlogPayload>,
): FormData => {
    const formData = new FormData();
    const { file, ...dataPayload } = payload;
    formData.append('data', JSON.stringify(dataPayload));

    if (file) {
        formData.append('file', file);
    }

    return formData;
};

export const getAllPosts = async (): Promise<BlogPost[]> => {
    const { data } = await api.get<BlogPost[]>('/blog');
    return data;
};

export const getPostById = async (id: string): Promise<BlogPost> => {
    const { data } = await api.get<BlogPost>(`/blog/${encodeURIComponent(id)}`);
    return data;
};

export const createPost = async (
    payload: CreateBlogPayload,
): Promise<BlogPost> => {
    const { data } = await api.post<BlogPost>(
        '/blog',
        createBlogFormData(payload),
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
};

export const updatePost = async (
    id: string,
    payload: Partial<CreateBlogPayload>,
): Promise<BlogPost> => {
    const { data } = await api.put<BlogPost>(
        `/blog/${encodeURIComponent(id)}`,
        createBlogFormData(payload),
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
};

export const deletePost = async (id: string): Promise<void> => {
    await api.delete(`/blog/${encodeURIComponent(id)}`);
};

export const likePost = async (id: string): Promise<void> => {
    await api.put(`/blog/${encodeURIComponent(id)}/like`);
};

export const commentPost = async (
    id: string,
    text: TipTapContent,
): Promise<void> => {
    await api.post(`/blog/${encodeURIComponent(id)}/comment`, { text });
};
