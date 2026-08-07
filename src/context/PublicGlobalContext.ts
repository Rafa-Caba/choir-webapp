// src/context/PublicGlobalContext.ts

import { createContext, useContext } from 'react';
import type { PublicChoirMetadata, PublicPageStatus } from '../types/public';

export interface PublicGlobalContextValue {
    readonly choirCode: string;
    readonly choir: PublicChoirMetadata | null;
    readonly status: PublicPageStatus;
    readonly errorCode: string | null;
    readonly errorMessage: string | null;
}

export const PublicGlobalContext = createContext<PublicGlobalContextValue | null>(null);

export const usePublicGlobal = (): PublicGlobalContextValue => {
    const context = useContext(PublicGlobalContext);

    if (!context) {
        throw new Error('usePublicGlobal must be used inside PublicGlobalProvider');
    }

    return context;
};
