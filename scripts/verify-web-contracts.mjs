// scripts/verify-web-contracts.mjs

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const sourceRoot = join(root, 'src');
const requiredFiles = [
    '.env.development.example',
    '.env.staging.example',
    '.env.production.example',
    'vercel.json',
    'src/types/announcement.ts',
    'src/components/auth/PlatformChoirTargetGuard.tsx',
    'src/pages/admin/platform/PlatformChoirUsers.tsx',
    'src/pages/admin/platform/PlatformChoirUserForm.tsx',
];
const forbiddenFiles = [
    'src/types/annoucement.ts',
    'src/services/socket.ts',
    'src/utils/choirKey.ts',
    'src/components/themes-old',
    'README.chat.md',
    'ROADMAP.chat.md',
];

const responsiveCardListFiles = [
    'src/components/announcements/AdminAnouncements.tsx',
    'src/components/blog/AdminBlogPostList.tsx',
    'src/components/choirs/AdminChoirList.tsx',
    'src/components/components-admin/instruments/AdminInstrumentsList.tsx',
    'src/components/members/MembersList.tsx',
    'src/components/songTypes/AdminSongTypeList.tsx',
    'src/components/themes/AdminThemeList.tsx',
    'src/components/users/AdminUsersList.tsx',
    'src/components/websitelogs/AdminLogs.tsx',
];

const forbiddenPatterns = [
    { label: 'legacy choirKey selector', pattern: /\bchoirKey\b/u },
    { label: 'legacy withChoirKey helper', pattern: /\bwithChoirKey\b/u },
    { label: 'legacy default choir constant', pattern: /DEFAULT_CHOIR(?:_KEY|_CODE)?/u },
    { label: 'legacy replyToId payload', pattern: /\breplyToId\b/u },
    { label: 'global localStorage clear', pattern: /localStorage\.clear\s*\(/u },
    { label: 'global sessionStorage clear', pattern: /sessionStorage\.clear\s*\(/u },
    { label: 'legacy announcement type filename', pattern: /annoucement/u },
    { label: 'legacy Ero Cras branding', pattern: /Ero\s*Cras|EroCras|erocrasLogo/u },
];

const walk = (directory) => readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
});

const failures = [];

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

if (packageJson.name !== 'choir-webapp') {
    failures.push('package.json: package name must be choir-webapp');
}

for (const requiredFile of requiredFiles) {
    try {
        statSync(join(root, requiredFile));
    } catch {
        failures.push(`Missing required file: ${requiredFile}`);
    }
}

for (const forbiddenFile of forbiddenFiles) {
    try {
        statSync(join(root, forbiddenFile));
        failures.push(`Legacy file must be removed: ${forbiddenFile}`);
    } catch {
        // Expected: the legacy file does not exist.
    }
}

for (const filePath of walk(sourceRoot)) {
    if (!/\.(?:ts|tsx)$/u.test(filePath)) {
        continue;
    }

    const contents = readFileSync(filePath, 'utf8');
    const displayPath = relative(root, filePath);

    for (const rule of forbiddenPatterns) {
        if (rule.pattern.test(contents)) {
            failures.push(`${displayPath}: ${rule.label}`);
        }
    }
}


const platformChoirListPath = join(root, 'src/components/choirs/AdminChoirList.tsx');
const platformChoirListContents = readFileSync(platformChoirListPath, 'utf8');

if (!platformChoirListContents.includes('buildPlatformChoirUsersRoute')) {
    failures.push('AdminChoirList.tsx: platform user management must use the platform choir route');
}

if (/navigate\(\s*['"]\/admin\/users/u.test(platformChoirListContents)) {
    failures.push('AdminChoirList.tsx: platform user management must not navigate directly to /admin/users');
}


for (const cardListFile of responsiveCardListFiles) {
    const contents = readFileSync(join(root, cardListFile), 'utf8');

    if (!contents.includes('AdminCardGrid')) {
        failures.push(`${cardListFile}: administrative lists must use the responsive card grid`);
    }

    if (!contents.includes('AdminCardPagination')) {
        failures.push(`${cardListFile}: administrative card lists must expose pagination controls`);
    }

    if (/<Table(?:Container|Head|Body|Row|Cell)?\b/u.test(contents)) {
        failures.push(`${cardListFile}: administrative lists must not render MUI tables`);
    }
}

const cardGridContents = readFileSync(join(root, 'src/components/common/AdminCardGrid.tsx'), 'utf8');
for (const expectedColumnRule of [
    "xs: 'minmax(0, 1fr)'",
    "sm: 'repeat(2, minmax(0, 1fr))'",
    "md: 'repeat(3, minmax(0, 1fr))'",
    "xl: 'repeat(4, minmax(0, 1fr))'",
]) {
    if (!cardGridContents.includes(expectedColumnRule)) {
        failures.push(`AdminCardGrid.tsx: missing responsive rule ${expectedColumnRule}`);
    }
}

const paginationTypeContents = readFileSync(join(root, 'src/types/pagination.ts'), 'utf8');
if (!paginationTypeContents.includes('[10, 50, 100]')) {
    failures.push('src/types/pagination.ts: page-size options must remain 10, 50, and 100');
}


const publicThemeProviderContents = readFileSync(
    join(root, 'src/context/PublicGlobalProvider.tsx'),
    'utf8',
);
if (!publicThemeProviderContents.includes('activeTheme')) {
    failures.push('PublicGlobalProvider.tsx: public pages must consume the choir activeTheme');
}
if (publicThemeProviderContents.includes("theme.name === 'Default'") || publicThemeProviderContents.includes('themes[0]')) {
    failures.push('PublicGlobalProvider.tsx: public theme selection must not use heuristic or first-theme fallbacks');
}

const adminSettingsContents = readFileSync(
    join(root, 'src/components/settings/AdminSettings.tsx'),
    'utf8',
);
if (!adminSettingsContents.includes('activeThemeId') || !adminSettingsContents.includes('updateActiveTheme')) {
    failures.push('AdminSettings.tsx: choir settings must expose the global active theme selector');
}

const userMenuContents = readFileSync(
    join(root, 'src/components/user-menu/UserMenu.tsx'),
    'utf8',
);
if (!userMenuContents.includes('updateMyTheme(theme.id)')) {
    failures.push('UserMenu.tsx: personal admin theme must persist through /users/me/theme');
}
if (!userMenuContents.includes('updateMyTheme(null)')) {
    failures.push('UserMenu.tsx: users must be able to clear the personal theme and follow the choir global theme');
}
if (!userMenuContents.includes("user.role !== 'SUPER_ADMIN'")) {
    failures.push('UserMenu.tsx: platform SUPER_ADMIN must not use a personal tenant theme override');
}

const authProviderContents = readFileSync(
    join(root, 'src/context/AuthProvider.tsx'),
    'utf8',
);
if (!authProviderContents.includes("location.pathname.startsWith('/admin')")) {
    failures.push('AuthProvider.tsx: personal theme overrides must be scoped to private admin routes');
}
if (!authProviderContents.includes('resolvePersonalThemeId(user.themeId)')) {
    failures.push('AuthProvider.tsx: admin theme hierarchy must inspect User.themeId');
}
if (!authProviderContents.includes('getAdminSettings()')) {
    failures.push('AuthProvider.tsx: admin theme hierarchy must fall back to Settings.activeThemeId');
}


const chatNormalizerContents = readFileSync(
    join(root, 'src/utils/chat/normalizeChatMessage.ts'),
    'utf8',
);
if (!chatNormalizerContents.includes("typeof value === 'string'")) {
    failures.push('normalizeChatMessage.ts: RN string chat content must be preserved');
}
if (!chatNormalizerContents.includes('firstNonEmptyString')) {
    failures.push('normalizeChatMessage.ts: media URL normalization must ignore empty legacy URL fields');
}

const chatBubbleContents = readFileSync(
    join(root, 'src/components/chat/ChatBubble.tsx'),
    'utf8',
);
if (!chatBubbleContents.includes("msg.type === 'STICKER'")) {
    failures.push('ChatBubble.tsx: STICKER messages require a dedicated renderer');
}
if (!chatBubbleContents.includes('getMessageMediaUrl')) {
    failures.push('ChatBubble.tsx: media messages must resolve the canonical media URL');
}

const galleryFormFiles = [
    'src/components/gallery/AdminNewMedia.tsx',
    'src/components/gallery/AdminEditMedia.tsx',
];
for (const galleryFormFile of galleryFormFiles) {
    const contents = readFileSync(join(root, galleryFormFile), 'utf8');

    if (!contents.includes("overflowY: 'auto'")) {
        failures.push(`${galleryFormFile}: the mobile form card must scroll independently`);
    }
}

const themeSurfaceFiles = [
    'src/layouts/admin/AdminLayout.tsx',
    'src/layouts/public/PublicLayout.tsx',
];
for (const themeSurfaceFile of themeSurfaceFiles) {
    const contents = readFileSync(join(root, themeSurfaceFile), 'utf8');

    if (!contents.includes("backgroundColor: 'var(--color-nav)'")) {
        failures.push(`${themeSurfaceFile}: header/footer surfaces must consume the semantic nav theme color`);
    }
}

const globalStylesContents = readFileSync(
    join(root, 'src/assets/styles/base/_general.scss'),
    'utf8',
);
if (!globalStylesContents.includes('.MuiMenu-paper')) {
    failures.push('_general.scss: MUI portal menus must inherit the active choir theme');
}

const targetStorePath = join(root, 'src/store/platform/useTargetChoirStore.ts');
const targetStoreContents = readFileSync(targetStorePath, 'utf8');

if (!targetStoreContents.includes('enterChoir:')) {
    failures.push('useTargetChoirStore.ts: selectChoir and enterChoir must remain separate platform actions');
}

const environmentExamples = [
    '.env.development.example',
    '.env.staging.example',
    '.env.production.example',
];

for (const environmentFile of environmentExamples) {
    const contents = readFileSync(join(root, environmentFile), 'utf8');

    if (!contents.includes('VITE_API_URL=')) {
        failures.push(`${environmentFile}: missing VITE_API_URL`);
    }

    if (!contents.includes('VITE_SOCKET_URL=')) {
        failures.push(`${environmentFile}: missing VITE_SOCKET_URL`);
    }
}

if (failures.length > 0) {
    failures.forEach((failure) => console.error(`FAIL ${failure}`));
    process.exitCode = 1;
} else {
    console.log('PASS Web multi-choir contract verification');
}
