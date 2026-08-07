// src/store/public/resetPublicStores.ts

import { useAnnouncementStore } from './useAnnouncementStore';
import { useBlogStore } from './useBlogStore';
import { useGalleryStore } from './useGalleryStore';
import { useMemberStore } from './useMemberStore';
import { usePublicInstrumentsStore } from './usePublicInstrumentsStore';
import { useSettingsStore } from './useSettingsStore';
import { useSongStore } from './useSongStore';
import { useSongTypeStore } from './useSongTypeStore';
import { useThemeStore } from './useThemeStore';

export const resetPublicStores = (): void => {
    useAnnouncementStore.getState().reset();
    useBlogStore.getState().reset();
    useGalleryStore.getState().reset();
    useMemberStore.getState().reset();
    usePublicInstrumentsStore.getState().reset();
    useSettingsStore.getState().reset();
    useSongStore.getState().reset();
    useSongTypeStore.getState().reset();
    useThemeStore.getState().reset();
};
