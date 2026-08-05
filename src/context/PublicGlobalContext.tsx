import { createContext, useContext, useEffect } from 'react';
import { useGalleryStore } from '../store/public/useGalleryStore';
import { useSongStore } from '../store/public/useSongStore';
import { useSettingsStore } from '../store/public/useSettingsStore';
import { useMemberStore } from '../store/public/useMemberStore';
import { useThemeStore } from '../store/public/useThemeStore';
import { usePublicInstrumentsStore } from '../store/public/usePublicInstrumentsStore';


interface Props {
    children: React.ReactNode;
}

const PublicGlobalContext = createContext({});

export const PublicGlobalProvider = ({ children }: Props) => {
    const { fetchGallery } = useGalleryStore();
    const { fetchSongs } = useSongStore();
    const { fetchSettings } = useSettingsStore();
    const { fetchMembers } = useMemberStore();
    const { themes, fetchThemes } = useThemeStore();
    const { fetchPublicInstruments } = usePublicInstrumentsStore();

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchGallery(),
                    fetchSongs(),
                    fetchSettings(),
                    fetchMembers(),
                    fetchThemes(),
                    fetchPublicInstruments()
                ]);
            } catch (error) {
                console.warn('Error loading public global data:', error);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        if (themes.length > 0) {
            const defaultTheme = themes.find(t => t.name === 'Default');
            if (!defaultTheme) return;

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
        }
    }, [themes]);

    return (
        <PublicGlobalContext.Provider value={{}}>
            {children}
        </PublicGlobalContext.Provider>
    );
};

export const usePublicGlobal = () => useContext(PublicGlobalContext);
