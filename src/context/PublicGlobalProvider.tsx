// src/context/PublicGlobalProvider.tsx

import {
    useEffect,
    useLayoutEffect,
    useMemo,
    type ReactNode,
} from 'react';
import { useAnnouncementStore } from '../store/public/useAnnouncementStore';
import { useBlogStore } from '../store/public/useBlogStore';
import { useGalleryStore } from '../store/public/useGalleryStore';
import { useMemberStore } from '../store/public/useMemberStore';
import { usePublicInstrumentsStore } from '../store/public/usePublicInstrumentsStore';
import { resetPublicStores } from '../store/public/resetPublicStores';
import { useSettingsStore } from '../store/public/useSettingsStore';
import { useSongStore } from '../store/public/useSongStore';
import { useSongTypeStore } from '../store/public/useSongTypeStore';
import type { PublicPageStatus } from '../types/public';
import { normalizeChoirCode } from '../utils/choirCode';
import { setDocumentBrand } from '../utils/documentBranding';
import {
    applyChoirThemeToDocument,
    applyDefaultChoirThemeToDocument,
    getAppliedChoirThemeCode,
} from '../utils/choirThemeDocument';
import {
    activateCachedChoirTheme,
    removeChoirTheme,
    writeChoirTheme,
} from '../storage/choirThemeStorage';
import {
    PublicGlobalContext,
    type PublicGlobalContextValue,
} from './PublicGlobalContext';

const PUBLIC_CHOIR_UNAVAILABLE_CODES = new Set([
    'CHOIR_INACTIVE',
    'PUBLIC_CHOIR_INACTIVE',
]);

interface PublicGlobalProviderProps {
    readonly choirCode: string;
    readonly children: ReactNode;
}

export const PublicGlobalProvider = ({
    choirCode,
    children,
}: PublicGlobalProviderProps) => {
    const normalizedChoirCode = normalizeChoirCode(choirCode);

    const fetchAnnouncements = useAnnouncementStore((state) => state.fetchAnnouncements);
    const fetchPosts = useBlogStore((state) => state.fetchPosts);
    const fetchGallery = useGalleryStore((state) => state.fetchGallery);
    const fetchMembers = useMemberStore((state) => state.fetchMembers);
    const fetchPublicInstruments = usePublicInstrumentsStore(
        (state) => state.fetchPublicInstruments,
    );
    const fetchSettings = useSettingsStore((state) => state.fetchSettings);
    const fetchSongs = useSongStore((state) => state.fetchSongs);
    const fetchTypes = useSongTypeStore((state) => state.fetchTypes);

    const choir = useSettingsStore((state) => (
        state.loadedChoirCode === normalizedChoirCode ? state.choir : null
    ));
    const activeTheme = useSettingsStore((state) => (
        state.loadedChoirCode === normalizedChoirCode ? state.activeTheme : null
    ));
    const settingsStatus = useSettingsStore((state) => state.status);
    const settingsLoadedChoirCode = useSettingsStore((state) => state.loadedChoirCode);
    const errorCode = useSettingsStore((state) => state.errorCode);
    const errorMessage = useSettingsStore((state) => state.errorMessage);

    useLayoutEffect(() => {
        resetPublicStores();
        setDocumentBrand('Choirs', null);

        const cachedTheme = activateCachedChoirTheme(normalizedChoirCode);

        if (cachedTheme) {
            applyChoirThemeToDocument(cachedTheme, normalizedChoirCode);
        } else if (getAppliedChoirThemeCode() !== normalizedChoirCode) {
            applyDefaultChoirThemeToDocument(normalizedChoirCode);
        }

        return () => {
            resetPublicStores();
            setDocumentBrand('Choirs', null);
        };
    }, [normalizedChoirCode]);

    useEffect(() => {
        void fetchSettings(normalizedChoirCode);
        void fetchGallery(normalizedChoirCode);
        void fetchSongs(normalizedChoirCode);
        void fetchTypes(normalizedChoirCode);
        void fetchMembers(normalizedChoirCode);
        void fetchPublicInstruments(normalizedChoirCode);
        void fetchAnnouncements(normalizedChoirCode);
        void fetchPosts(normalizedChoirCode);
    }, [
        fetchAnnouncements,
        fetchGallery,
        fetchMembers,
        fetchPosts,
        fetchPublicInstruments,
        fetchSettings,
        fetchSongs,
        fetchTypes,
        normalizedChoirCode,
    ]);

    useLayoutEffect(() => {
        if (!activeTheme) {
            return;
        }

        writeChoirTheme(normalizedChoirCode, activeTheme);
        applyChoirThemeToDocument(activeTheme, normalizedChoirCode);
    }, [activeTheme, normalizedChoirCode]);

    const status = useMemo<PublicPageStatus>(() => {
        if (settingsLoadedChoirCode !== normalizedChoirCode || settingsStatus === 'idle') {
            return 'loading';
        }

        if (settingsStatus === 'loading') {
            return 'loading';
        }

        if (settingsStatus === 'error' && errorCode === 'PUBLIC_CHOIR_NOT_FOUND') {
            return 'not-found';
        }

        if (
            settingsStatus === 'error'
            && errorCode
            && PUBLIC_CHOIR_UNAVAILABLE_CODES.has(errorCode)
        ) {
            return 'unavailable';
        }

        if (settingsStatus === 'error') {
            return 'error';
        }

        return 'ready';
    }, [errorCode, normalizedChoirCode, settingsLoadedChoirCode, settingsStatus]);

    useEffect(() => {
        if (status === 'ready' || status === 'loading') {
            return;
        }

        removeChoirTheme(normalizedChoirCode);
        applyDefaultChoirThemeToDocument(normalizedChoirCode);
    }, [normalizedChoirCode, status]);

    const value = useMemo<PublicGlobalContextValue>(() => ({
        choirCode: normalizedChoirCode,
        choir,
        status,
        errorCode,
        errorMessage,
    }), [choir, errorCode, errorMessage, normalizedChoirCode, status]);

    return (
        <PublicGlobalContext.Provider value={value}>
            {children}
        </PublicGlobalContext.Provider>
    );
};
