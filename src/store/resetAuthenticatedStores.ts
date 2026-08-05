// src/store/resetAuthenticatedStores.ts

import { useAnnouncementStore } from './admin/useAnnouncementStore';
import { useBlogStore } from './admin/useBlogStore';
import { useChatStore } from './admin/useChatStore';
import { useChoirsStore } from './admin/useChoirsStore';
import { useGalleryStore } from './admin/useGalleryStore';
import { useInstrumentsStore } from './admin/useInstrumentsStore';
import { useLogStore } from './admin/useLogStore';
import { useMemberStore } from './admin/useMemberStore';
import { useAdminSettingsStore } from './admin/useSettingsStore';
import { useSongStore } from './admin/useSongStore';
import { useSongTypeStore } from './admin/useSongTypeStore';
import { useThemeStore } from './admin/useThemeStore';
import { useUsersStore } from './admin/useUsersStore';

export const resetAuthenticatedStores = (): void => {
    useChatStore.getState().disconnect();
    useChatStore.setState(useChatStore.getInitialState(), true);
    useChatStore.persist.clearStorage();

    useAnnouncementStore.setState(useAnnouncementStore.getInitialState(), true);
    useBlogStore.setState(useBlogStore.getInitialState(), true);
    useChoirsStore.setState(useChoirsStore.getInitialState(), true);
    useGalleryStore.setState(useGalleryStore.getInitialState(), true);
    useInstrumentsStore.setState(useInstrumentsStore.getInitialState(), true);
    useLogStore.setState(useLogStore.getInitialState(), true);
    useMemberStore.setState(useMemberStore.getInitialState(), true);
    useAdminSettingsStore.setState(useAdminSettingsStore.getInitialState(), true);
    useSongStore.setState(useSongStore.getInitialState(), true);
    useSongTypeStore.setState(useSongTypeStore.getInitialState(), true);
    useThemeStore.setState(useThemeStore.getInitialState(), true);
    useUsersStore.setState(useUsersStore.getInitialState(), true);
};
