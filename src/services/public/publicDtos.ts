// src/services/public/publicDtos.ts

import type { TipTapContent } from '../../types/annoucement';

export interface PublicEntityDto {
    readonly id?: string;
    readonly _id?: string;
}

export interface PublicChoirDto {
    readonly name: string;
    readonly code: string;
    readonly description?: string;
    readonly logoUrl?: string;
}

export interface PublicSettingsDto extends PublicEntityDto {
    readonly webTitle: string;
    readonly contactPhone: string;
    readonly logoUrl?: string;
    readonly socials: {
        readonly facebook: string;
        readonly instagram: string;
        readonly youtube: string;
        readonly whatsapp: string;
        readonly email: string;
    };
    readonly homeLegends: {
        readonly principal: string;
        readonly secondary: string;
    };
    readonly history: TipTapContent;
    readonly updatedAt?: string;
}

export interface PublicSettingsApiResponse {
    readonly choir: PublicChoirDto;
    readonly settings: PublicSettingsDto;
}

export interface PublicAnnouncementDto extends PublicEntityDto {
    readonly title: string;
    readonly content: TipTapContent;
    readonly imageUrl?: string;
    readonly createdAt: string;
    readonly updatedAt: string;
}

export interface PublicBlogAuthorDto extends PublicEntityDto {
    readonly name: string;
    readonly username: string;
    readonly imageUrl?: string;
}

export interface PublicBlogCommentDto {
    readonly author: string;
    readonly text: TipTapContent;
    readonly date: string;
}

export interface PublicBlogPostDto extends PublicEntityDto {
    readonly title: string;
    readonly content: TipTapContent;
    readonly imageUrl?: string;
    readonly author: PublicBlogAuthorDto;
    readonly likes: number;
    readonly comments: PublicBlogCommentDto[];
    readonly createdAt: string;
    readonly updatedAt: string;
}

export interface PublicGalleryImageDto extends PublicEntityDto {
    readonly title: string;
    readonly description: string;
    readonly imageUrl: string;
    readonly mediaType: 'IMAGE' | 'VIDEO';
    readonly imageStart: boolean;
    readonly imageTopBar: boolean;
    readonly imageUs: boolean;
    readonly imageLogo: boolean;
    readonly imageGallery: boolean;
    readonly imageLeftMenu?: boolean;
    readonly imageRightMenu?: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
}

export interface PublicSongTypeDto extends PublicEntityDto {
    readonly name: string;
    readonly order: number;
    readonly parentId?: string | null;
    readonly isParent: boolean;
    readonly createdAt?: string;
    readonly updatedAt?: string;
}

export interface PublicSongDto extends PublicEntityDto {
    readonly title: string;
    readonly composer?: string;
    readonly content: TipTapContent;
    readonly audioUrl?: string;
    readonly songTypeId?: string | PublicSongTypeDto | null;
    readonly createdAt: string;
    readonly updatedAt: string;
}

export interface PublicThemeDto extends PublicEntityDto {
    readonly name: string;
    readonly isDark: boolean;
    readonly primaryColor: string;
    readonly accentColor: string;
    readonly backgroundColor: string;
    readonly textColor: string;
    readonly cardColor: string;
    readonly buttonColor: string;
    readonly navColor: string;
    readonly buttonTextColor: string;
    readonly secondaryTextColor: string;
    readonly borderColor: string;
    readonly createdAt?: string;
    readonly updatedAt?: string;
}

export interface PublicInstrumentDto extends PublicEntityDto {
    readonly name: string;
    readonly slug: string;
    readonly category: string;
    readonly iconKey: string;
    readonly iconUrl?: string;
    readonly order: number;
    readonly createdAt?: string;
    readonly updatedAt?: string;
}

export interface PublicMemberDto extends PublicEntityDto {
    readonly name: string;
    readonly instrumentId?: string | PublicInstrumentDto | null;
    readonly instrumentLabel?: string;
    readonly voice: boolean;
    readonly imageUrl?: string;
    readonly createdAt?: string;
    readonly updatedAt?: string;
}
