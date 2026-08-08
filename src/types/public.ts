// src/types/public.ts

import type { AppSettings } from './settings';

export interface PublicChoirMetadata {
    readonly name: string;
    readonly code: string;
    readonly description: string;
    readonly logoUrl: string;
}

export interface PublicSettingsResponse {
    readonly choir: PublicChoirMetadata;
    readonly settings: AppSettings;
}

export type PublicPageStatus = 'loading' | 'ready' | 'not-found' | 'unavailable' | 'error';
