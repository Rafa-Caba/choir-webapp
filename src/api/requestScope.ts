// src/api/requestScope.ts

const API_PREFIX_PATTERN = /^\/api(?=\/|$)/u;

export const normalizeApiRequestPath = (url: string | undefined): string => {
    if (!url) {
        return '';
    }

    try {
        const parsedUrl = new URL(url, 'http://choir-web.local');
        const pathWithoutApiPrefix = parsedUrl.pathname.replace(API_PREFIX_PATTERN, '');

        return pathWithoutApiPrefix || '/';
    } catch {
        const pathWithoutQuery = url.split(/[?#]/u)[0] || '';
        const normalizedPath = pathWithoutQuery.startsWith('/')
            ? pathWithoutQuery
            : `/${pathWithoutQuery}`;

        return normalizedPath.replace(API_PREFIX_PATTERN, '') || '/';
    }
};

export const isPlatformRequest = (url: string | undefined): boolean => {
    const requestPath = normalizeApiRequestPath(url);

    return requestPath === '/auth' ||
        requestPath.startsWith('/auth/') ||
        requestPath === '/choirs' ||
        requestPath.startsWith('/choirs/') ||
        requestPath === '/users/me' ||
        requestPath === '/logs/platform' ||
        requestPath === '/public' ||
        requestPath.startsWith('/public/');
};

export const shouldAttachTargetChoir = (
    url: string | undefined,
    targetChoirId: string | null,
): boolean => Boolean(targetChoirId?.trim()) && !isPlatformRequest(url);
