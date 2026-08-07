// src/store/public/publicStoreSupport.ts

import axios from 'axios';
import type { ApiErrorResponse } from '../../types/api/http';
import { normalizeChoirCode } from '../../utils/choirCode';

export interface PublicResourceError {
    readonly code: string;
    readonly message: string;
}

export const normalizePublicStoreChoirCode = (choirCode: string): string => (
    normalizeChoirCode(choirCode)
);

export const isPublicRequestCancelled = (error: Error): boolean => (
    axios.isCancel(error) || (axios.isAxiosError(error) && error.code === 'ERR_CANCELED')
);

export const getPublicResourceError = (error: Error): PublicResourceError => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return {
            code: error.response?.data?.code ?? 'PUBLIC_REQUEST_FAILED',
            message: error.response?.data?.message ?? 'No fue posible cargar el contenido público.',
        };
    }

    return {
        code: 'PUBLIC_REQUEST_FAILED',
        message: error.message || 'No fue posible cargar el contenido público.',
    };
};
