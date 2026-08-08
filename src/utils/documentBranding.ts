// src/utils/documentBranding.ts

const FAVICON_SELECTOR = "link[rel='icon']";

const NEUTRAL_THEME_VARIABLES = Object.freeze({
    '--color-primary': '#2563eb',
    '--color-accent': '#7c3aed',
    '--color-background': '#f8fafc',
    '--color-text': '#111827',
    '--color-card': '#ffffff',
    '--color-button': '#2563eb',
    '--color-nav': '#ffffff',
    '--color-button-text': '#ffffff',
    '--color-secondary-text': '#64748b',
    '--color-border': '#e5e7eb',
});

export const applyNeutralThemeToDocument = (): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;

    Object.entries(NEUTRAL_THEME_VARIABLES).forEach(([variableName, value]) => {
        root.style.setProperty(variableName, value);
    });
};

export const setDocumentFavicon = (href: string | null): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const normalizedHref = href?.trim() || '';
    const existingFavicon = document.querySelector<HTMLLinkElement>(FAVICON_SELECTOR);

    if (!normalizedHref) {
        existingFavicon?.remove();
        return;
    }

    if (existingFavicon) {
        existingFavicon.href = normalizedHref;
        return;
    }

    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = normalizedHref;
    document.head.appendChild(favicon);
};

export const setDocumentBrand = (
    title: string,
    faviconUrl: string | null,
): void => {
    if (typeof document !== 'undefined') {
        document.title = title.trim() || 'Choirs';
    }

    setDocumentFavicon(faviconUrl);
};
