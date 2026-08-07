// src/services/public/publicMappers.ts

import type { Announcement } from '../../types/annoucement';
import type { BlogPost } from '../../types/blog';
import type { GalleryImage } from '../../types/gallery';
import type { Instrument } from '../../types/instrument';
import type { Member } from '../../types/member';
import type { PublicSettingsResponse } from '../../types/public';
import type { Song, SongType } from '../../types/song';
import type { Theme } from '../../types/theme';
import type {
    PublicAnnouncementDto,
    PublicBlogPostDto,
    PublicEntityDto,
    PublicGalleryImageDto,
    PublicInstrumentDto,
    PublicMemberDto,
    PublicSettingsApiResponse,
    PublicSongDto,
    PublicSongTypeDto,
    PublicThemeDto,
} from './publicDtos';

const requireEntityId = (entity: PublicEntityDto): string => {
    const id = entity.id?.trim() || entity._id?.trim() || '';

    if (!id) {
        throw new Error('The API returned a public resource without an identifier');
    }

    return id;
};

export const mapPublicSettings = (
    response: PublicSettingsApiResponse,
): PublicSettingsResponse => ({
    choir: {
        name: response.choir.name,
        code: response.choir.code,
        description: response.choir.description ?? '',
        logoUrl: response.choir.logoUrl ?? '',
    },
    settings: {
        id: requireEntityId(response.settings),
        choirId: '',
        webTitle: response.settings.webTitle,
        contactPhone: response.settings.contactPhone,
        logoUrl: response.settings.logoUrl ?? '',
        socials: { ...response.settings.socials },
        homeLegends: { ...response.settings.homeLegends },
        history: response.settings.history,
        updatedAt: response.settings.updatedAt ?? '',
    },
});

export const mapPublicAnnouncement = (item: PublicAnnouncementDto): Announcement => ({
    id: requireEntityId(item),
    choirId: '',
    title: item.title,
    content: item.content,
    imageUrl: item.imageUrl ?? '',
    isPublic: true,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
});

export const mapPublicBlogPost = (item: PublicBlogPostDto): BlogPost => ({
    id: requireEntityId(item),
    choirId: '',
    title: item.title,
    content: item.content,
    imageUrl: item.imageUrl ?? '',
    isPublic: true,
    author: {
        id: requireEntityId(item.author),
        name: item.author.name,
        username: item.author.username,
        imageUrl: item.author.imageUrl ?? '',
    },
    likes: item.likes,
    likesUsers: [],
    comments: item.comments.map((comment) => ({ ...comment })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
});

export const mapPublicGalleryImage = (item: PublicGalleryImageDto): GalleryImage => ({
    id: requireEntityId(item),
    choirId: '',
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    mediaType: item.mediaType,
    imageStart: item.imageStart,
    imageTopBar: item.imageTopBar,
    imageUs: item.imageUs,
    imageLogo: item.imageLogo,
    imageGallery: item.imageGallery,
    imageLeftMenu: item.imageLeftMenu ?? false,
    imageRightMenu: item.imageRightMenu ?? false,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
});

export const mapPublicSongType = (item: PublicSongTypeDto): SongType => ({
    id: requireEntityId(item),
    choirId: '',
    name: item.name,
    order: item.order,
    parentId: item.parentId ?? undefined,
    isParent: item.isParent,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
});

export const mapPublicSong = (item: PublicSongDto): Song => {
    const populatedType = typeof item.songTypeId === 'object' && item.songTypeId
        ? item.songTypeId
        : null;
    const songTypeId = typeof item.songTypeId === 'string'
        ? item.songTypeId
        : populatedType
            ? requireEntityId(populatedType)
            : null;

    return {
        id: requireEntityId(item),
        choirId: '',
        title: item.title,
        composer: item.composer ?? '',
        content: item.content,
        songTypeId,
        songTypeName: populatedType?.name ?? '',
        audioUrl: item.audioUrl ?? '',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    };
};

export const mapPublicTheme = (item: PublicThemeDto): Theme => ({
    id: requireEntityId(item),
    name: item.name,
    isDark: item.isDark,
    primaryColor: item.primaryColor,
    accentColor: item.accentColor,
    backgroundColor: item.backgroundColor,
    textColor: item.textColor,
    cardColor: item.cardColor,
    buttonColor: item.buttonColor,
    navColor: item.navColor,
    buttonTextColor: item.buttonTextColor,
    secondaryTextColor: item.secondaryTextColor,
    borderColor: item.borderColor,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
});

export const mapPublicInstrument = (item: PublicInstrumentDto): Instrument => ({
    id: requireEntityId(item),
    name: item.name,
    slug: item.slug,
    category: item.category,
    iconKey: item.iconKey,
    iconUrl: item.iconUrl ?? '',
    isActive: true,
    order: item.order,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
});

export const mapPublicMember = (item: PublicMemberDto): Member => {
    const populatedInstrument = typeof item.instrumentId === 'object' && item.instrumentId
        ? item.instrumentId
        : null;
    const instrumentId = typeof item.instrumentId === 'string'
        ? item.instrumentId
        : populatedInstrument
            ? requireEntityId(populatedInstrument)
            : null;
    const instrumentName = populatedInstrument?.name ?? item.instrumentLabel ?? '';

    return {
        id: requireEntityId(item),
        choirId: '',
        name: item.name,
        instrument: instrumentName,
        instrumentId,
        instrumentLabel: item.instrumentLabel || instrumentName,
        voice: item.voice,
        imageUrl: item.imageUrl ?? '',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    };
};
