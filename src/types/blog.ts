// src/types/blog.ts

import type { TipTapContent } from './announcement';

export interface BlogComment {
    author: string;
    text: TipTapContent;
    date: string;
}

export interface BlogPost {
    id: string;
    choirId: string;
    title: string;
    content: TipTapContent;
    imageUrl?: string;
    isPublic: boolean;
    author: {
        id: string;
        name: string;
        username: string;
        imageUrl: string;
    };
    likes: number;
    likesUsers: string[];
    comments: BlogComment[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateBlogPayload {
    title: string;
    content: TipTapContent;
    imageUri?: string;
    file?: File;
    isPublic: boolean;
    author?: string;
}
