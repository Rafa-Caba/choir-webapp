// src/types/settings.ts

import type { TipTapContent } from './announcement';
import type { Theme } from './theme';

export interface SocialLinks {
    facebook: string;
    instagram: string;
    youtube: string;
    whatsapp: string;
    email: string;
}

export interface HomeLegends {
    principal: string;
    secondary: string;
}

export interface AppSettings {
    id: string;
    choirId: string;
    activeThemeId: string | null;
    activeTheme: Theme | null;

    webTitle: string;
    contactPhone: string;

    logoUrl?: string;

    socials: SocialLinks;
    homeLegends: HomeLegends;
    history: TipTapContent;

    updatedAt: string;
}

export interface UpdateSettingsPayload {
    webTitle?: string;
    contactPhone?: string;
    socials?: SocialLinks;
    homeLegends?: HomeLegends;
    history?: TipTapContent;
}
