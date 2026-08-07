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
import { useThemeStore } from '../store/public/useThemeStore';
import type { PublicPageStatus } from '../types/public';
import { normalizeChoirCode } from '../utils/choirCode';
import {
    PublicGlobalContext,
    type PublicGlobalContextValue,
} from './PublicGlobalContext';

interface PublicGlobalProviderProps {
    readonly choirCode: string;
    readonly children: ReactNode;
}

const resetThemeVariables = (): void => {
    const root = document.documentElement;
    const variableNames = [
        '--color-primary',
        '--color-accent',
        '--color-background',
        '--color-text',
        '--color-card',
        '--color-button',
        '--color-nav',
        '--color-button-text',
        '--color-secondary-text',
        '--color-border',
    ];

    variableNames.forEach((variableName) => root.style.removeProperty(variableName));
};

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
    const fetchThemes = useThemeStore((state) => state.fetchThemes);

    const choir = useSettingsStore((state) => (
        state.loadedChoirCode === normalizedChoirCode ? state.choir : null
    ));
    const settingsStatus = useSettingsStore((state) => state.status);
    const settingsLoadedChoirCode = useSettingsStore((state) => state.loadedChoirCode);
    const errorCode = useSettingsStore((state) => state.errorCode);
    const errorMessage = useSettingsStore((state) => state.errorMessage);
    const themes = useThemeStore((state) => (
        state.loadedChoirCode === normalizedChoirCode ? state.themes : []
    ));

    useLayoutEffect(() => {
        resetPublicStores();
        resetThemeVariables();
        document.title = 'Choirs';

        return () => {
            resetPublicStores();
            resetThemeVariables();
        };
    }, [normalizedChoirCode]);

    useEffect(() => {
        void fetchSettings(normalizedChoirCode);
        void fetchThemes(normalizedChoirCode);
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
        fetchThemes,
        fetchTypes,
        normalizedChoirCode,
    ]);

    useEffect(() => {
        const defaultTheme = themes.find((theme) => theme.name === 'Default') ?? themes[0];

        if (!defaultTheme) {
            return;
        }

        const root = document.documentElement;
        root.style.setProperty('--color-primary', defaultTheme.primaryColor);
        root.style.setProperty('--color-accent', defaultTheme.accentColor);
        root.style.setProperty('--color-background', defaultTheme.backgroundColor);
        root.style.setProperty('--color-text', defaultTheme.textColor);
        root.style.setProperty('--color-card', defaultTheme.cardColor);
        root.style.setProperty('--color-button', defaultTheme.buttonColor);
        root.style.setProperty('--color-nav', defaultTheme.navColor);
        root.style.setProperty('--color-button-text', defaultTheme.buttonTextColor);
        root.style.setProperty('--color-secondary-text', defaultTheme.secondaryTextColor);
        root.style.setProperty('--color-border', defaultTheme.borderColor);
    }, [themes]);

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

        if (settingsStatus === 'error') {
            return 'error';
        }

        return 'ready';
    }, [errorCode, normalizedChoirCode, settingsLoadedChoirCode, settingsStatus]);

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

