// src/services/public/blog.ts

import { publicApi } from '../../api/axios';
import type { BlogPost } from '../../types/blog';
import type { PublicBlogPostDto } from './publicDtos';
import { mapPublicBlogPost } from './publicMappers';
import { buildPublicApiPath } from './publicPath';

export const getPublicPosts = async (
    choirCode: string,
    signal?: AbortSignal,
): Promise<BlogPost[]> => {
    const { data } = await publicApi.get<PublicBlogPostDto[]>(
        buildPublicApiPath(choirCode, 'blog'),
        { signal },
    );

    return data.map(mapPublicBlogPost);
};

export const getPublicPostById = async (
    choirCode: string,
    postId: string,
    signal?: AbortSignal,
): Promise<BlogPost> => {
    const encodedPostId = encodeURIComponent(postId.trim());
    const { data } = await publicApi.get<PublicBlogPostDto>(
        buildPublicApiPath(choirCode, `blog/${encodedPostId}`),
        { signal },
    );

    return mapPublicBlogPost(data);
};
