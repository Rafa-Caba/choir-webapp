// tests/run.ts

import { getPermissions } from '../src/auth/permissions.js';
import {
    isPlatformRequest,
    normalizeApiRequestPath,
    shouldAttachTargetChoir,
} from '../src/api/requestScope.js';
import { resolveEntityId } from '../src/types/api/entity.js';
import { getAuthErrorMessage } from '../src/auth/authErrorMessages.js';
import {
    buildPublicChoirPath,
    isValidChoirCode,
    normalizeChoirCode,
} from '../src/utils/choirCode.js';
import { buildPublicApiPath } from '../src/services/public/publicPath.js';
import {
    beginTenantStoreRequest,
    invalidateTenantStoreRequests,
    isTenantStoreRequestCurrent,
    registerTenantStoreScope,
} from '../src/store/tenantStoreScope.js';
import { isValidTemporaryPassword } from '../src/users/temporaryPassword.js';
import {
    APP_STORAGE_PREFIX,
    buildAppStorageKey,
    isChoirWebStorageKey,
} from '../src/storage/appStorage.js';
import {
    normalizeApiUrl,
    normalizeSocketOrigin,
    parseDefaultPublicChoirCode,
    parseRequestTimeout,
} from '../src/config/envParsing.js';
import {
    getEnteredChoirLandingRoute,
    getPlatformChoirUsersRoute,
    resolveAdminEntryRedirect,
} from '../src/routing/adminNavigation.js';
import { isPlatformTenantContextActive } from '../src/store/platform/platformContext.js';
import { getCardPageWindow } from '../src/pagination/cardPagination.js';
import { isPageSize } from '../src/types/pagination.js';
import {
    normalizeSongTypeApiResponse,
    resolveSongTypeParentId,
} from '../src/normalizers/songType.js';
import {
    shouldAutoLoadInstruments,
    shouldShowNoInstrumentsState,
} from '../src/instruments/instrumentLoadState.js';
import { buildChoirThemeKey } from '../src/storage/choirThemeStorage.js';
import { buildThemePreferenceKey } from '../src/storage/themePreferenceStorage.js';
import {
    resolvePersonalThemeId,
    shouldUsePersonalAdminTheme,
} from '../src/theme/themeHierarchy.js';
import { normalizeChatMessage } from '../src/utils/chat/normalizeChatMessage.js';

interface TestCase {
    readonly name: string;
    readonly run: () => void;
}

const assertEqual = <Value>(actual: Value, expected: Value): void => {
    if (!Object.is(actual, expected)) {
        throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
    }
};

const assertThrows = (callback: () => void): void => {
    let didThrow = false;

    try {
        callback();
    } catch {
        didThrow = true;
    }

    if (!didThrow) {
        throw new Error('Expected callback to throw');
    }
};

const testCases: TestCase[] = [
    {
        name: 'chat normalization preserves plain RN text and emoji content',
        run: () => {
            const normalized = normalizeChatMessage({
                _id: 'message-text',
                author: {
                    _id: 'user-carolina',
                    name: 'Carolina D.',
                    username: 'carolina',
                },
                content: 'Hola 🥰',
                type: 'TEXT',
                createdAt: '2026-08-11T21:30:00.000Z',
            });

            assertEqual(normalized.type, 'TEXT');
            assertEqual(JSON.stringify(normalized.content).includes('Hola 🥰'), true);
        },
    },
    {
        name: 'chat normalization resolves populated media when legacy URL fields are empty',
        run: () => {
            const normalized = normalizeChatMessage({
                _id: 'message-image',
                author: {
                    _id: 'user-carolina',
                    name: 'Carolina D.',
                    username: 'carolina',
                },
                content: '',
                type: 'IMAGE',
                fileUrl: '',
                imageUrl: '',
                mediaAssetId: {
                    _id: 'asset-image',
                    url: 'https://cdn.example.com/chat/photo.jpg',
                    originalName: 'photo.jpg',
                    mimeType: 'image/jpeg',
                    bytes: 1234,
                    format: 'jpg',
                    resourceType: 'image',
                },
            });

            assertEqual(normalized.imageUrl, 'https://cdn.example.com/chat/photo.jpg');
            assertEqual(normalized.media?.url, 'https://cdn.example.com/chat/photo.jpg');
            assertEqual(normalized.media?.filename, 'photo.jpg');
        },
    },
    {
        name: 'chat normalization preserves stickers sent as plain strings',
        run: () => {
            const normalized = normalizeChatMessage({
                _id: 'message-sticker',
                author: {
                    _id: 'user-rafael',
                    name: 'Rafael',
                    username: 'rafael',
                },
                content: '😇',
                type: 'STICKER',
            });

            assertEqual(normalized.type, 'STICKER');
            assertEqual(JSON.stringify(normalized.content).includes('😇'), true);
        },
    },
    {
        name: 'global and personal theme storage use separate choir-scoped keys',
        run: () => {
            assertEqual(buildChoirThemeKey('EroCras'), 'choir-web:theme:erocras');
            assertEqual(
                buildThemePreferenceKey('choir-id', 'user-id'),
                'choir-web:choir-id:user-id:theme',
            );
        },
    },
    {
        name: 'personal admin theme hierarchy excludes SUPER_ADMIN and falls back when unset',
        run: () => {
            assertEqual(resolvePersonalThemeId(' personal-theme '), 'personal-theme');
            assertEqual(resolvePersonalThemeId({
                id: 'theme-object',
                name: 'Object theme',
                isDark: false,
                primaryColor: '#111111',
                accentColor: '#222222',
                backgroundColor: '#ffffff',
                textColor: '#111111',
                cardColor: '#ffffff',
                buttonColor: '#111111',
                navColor: '#ffffff',
                buttonTextColor: '#ffffff',
                secondaryTextColor: '#333333',
                borderColor: '#dddddd',
            }), 'theme-object');
            assertEqual(resolvePersonalThemeId(null), null);
            assertEqual(shouldUsePersonalAdminTheme('ADMIN', 'theme-id'), true);
            assertEqual(shouldUsePersonalAdminTheme('EDITOR', 'theme-id'), true);
            assertEqual(shouldUsePersonalAdminTheme('USER', 'theme-id'), true);
            assertEqual(shouldUsePersonalAdminTheme('VIEWER', 'theme-id'), true);
            assertEqual(shouldUsePersonalAdminTheme('SUPER_ADMIN', 'theme-id'), false);
            assertEqual(shouldUsePersonalAdminTheme('ADMIN', null), false);
        },
    },
    {
        name: 'instrument auto-load runs once even when the loaded list is empty',
        run: () => {
            assertEqual(shouldAutoLoadInstruments(false), true);
            assertEqual(shouldAutoLoadInstruments(true), false);
            assertEqual(shouldShowNoInstrumentsState(true, false, false, 0), true);
            assertEqual(shouldShowNoInstrumentsState(true, true, false, 0), false);
            assertEqual(shouldShowNoInstrumentsState(true, false, true, 0), false);
            assertEqual(shouldShowNoInstrumentsState(true, false, false, 1), false);
        },
    },
    {
        name: 'song type parent normalization accepts populated API references',
        run: () => {
            const normalized = normalizeSongTypeApiResponse({
                _id: 'child-id',
                id: 'child-id',
                choirId: 'choir-id',
                name: 'Entrada',
                order: 1,
                parentId: {
                    _id: 'parent-id',
                    name: 'Misa Ero Cras',
                    order: 1,
                },
                isParent: false,
            });

            assertEqual(normalized.id, 'child-id');
            assertEqual(normalized.parentId, 'parent-id');
        },
    },
    {
        name: 'song type parent normalization preserves string parent IDs',
        run: () => {
            assertEqual(resolveSongTypeParentId('parent-id'), 'parent-id');
            assertEqual(resolveSongTypeParentId(null), undefined);
        },
    },
    {
        name: 'card pagination uses 10-item default windows and clamps page bounds',
        run: () => {
            const firstPage = getCardPageWindow(27, 1, 10);
            const lastPage = getCardPageWindow(27, 9, 10);

            assertEqual(firstPage.totalPages, 3);
            assertEqual(firstPage.startIndex, 0);
            assertEqual(firstPage.endIndex, 10);
            assertEqual(lastPage.page, 3);
            assertEqual(lastPage.startIndex, 20);
            assertEqual(lastPage.endIndex, 27);
        },
    },
    {
        name: 'card page-size selector only accepts 10, 50, and 100',
        run: () => {
            assertEqual(isPageSize(10), true);
            assertEqual(isPageSize(50), true);
            assertEqual(isPageSize(100), true);
            assertEqual(isPageSize(20), false);
        },
    },
    {
        name: 'SUPER_ADMIN receives platform and tenant administration permissions',
        run: () => {
            const permissions = getPermissions('SUPER_ADMIN');

            assertEqual(permissions.isSuperAdmin, true);
            assertEqual(permissions.canManageChoirs, true);
            assertEqual(permissions.canManageUsers, true);
            assertEqual(permissions.canManageContent, true);
            assertEqual(permissions.canManageSettings, true);
            assertEqual(permissions.canViewTenantLogs, true);
            assertEqual(permissions.canViewPlatformLogs, true);
        },
    },
    {
        name: 'ADMIN can manage tenant resources without platform permissions',
        run: () => {
            const permissions = getPermissions('ADMIN');

            assertEqual(permissions.isSuperAdmin, false);
            assertEqual(permissions.canManageChoirs, false);
            assertEqual(permissions.canManageUsers, true);
            assertEqual(permissions.canManageContent, true);
            assertEqual(permissions.canManageSettings, true);
            assertEqual(permissions.canViewTenantLogs, true);
            assertEqual(permissions.canViewPlatformLogs, false);
        },
    },
    {
        name: 'EDITOR can manage content without administration permissions',
        run: () => {
            const permissions = getPermissions('EDITOR');

            assertEqual(permissions.isSuperAdmin, false);
            assertEqual(permissions.canManageChoirs, false);
            assertEqual(permissions.canManageUsers, false);
            assertEqual(permissions.canManageContent, true);
            assertEqual(permissions.canManageSettings, false);
            assertEqual(permissions.canManageInstruments, false);
            assertEqual(permissions.canManageMembers, false);
            assertEqual(permissions.canManageSongTypes, false);
            assertEqual(permissions.canManageThemes, false);
            assertEqual(permissions.canViewTenantLogs, false);
            assertEqual(permissions.canViewPlatformLogs, false);
        },
    },
    {
        name: 'VIEWER receives read-only permission flags',
        run: () => {
            const permissions = getPermissions('VIEWER');

            assertEqual(permissions.isSuperAdmin, false);
            assertEqual(permissions.canManageChoirs, false);
            assertEqual(permissions.canManageUsers, false);
            assertEqual(permissions.canManageContent, false);
            assertEqual(permissions.canManageSettings, false);
            assertEqual(permissions.canViewTenantLogs, false);
            assertEqual(permissions.canViewPlatformLogs, false);
        },
    },
    {
        name: 'request paths normalize absolute URLs and remove one API prefix',
        run: () => {
            assertEqual(
                normalizeApiRequestPath('https://api.example.com/api/auth/me?source=web'),
                '/auth/me',
            );
            assertEqual(normalizeApiRequestPath('/api/users?page=2'), '/users');
            assertEqual(normalizeApiRequestPath('/users/me/theme'), '/users/me/theme');
            assertEqual(normalizeApiRequestPath('http://[invalid'), '/http://[invalid');
        },
    },
    {
        name: 'platform routes never receive a target choir header',
        run: () => {
            assertEqual(isPlatformRequest('/auth/refresh'), true);
            assertEqual(isPlatformRequest('/choirs/123'), true);
            assertEqual(isPlatformRequest('/users/me'), true);
            assertEqual(isPlatformRequest('/public/choir-a/settings'), true);
            assertEqual(shouldAttachTargetChoir('/auth/me', 'choir-a'), false);
        },
    },
    {
        name: 'tenant routes require an explicit target before attaching the header',
        run: () => {
            assertEqual(isPlatformRequest('/users/me/theme'), false);
            assertEqual(shouldAttachTargetChoir('/songs', 'choir-a'), true);
            assertEqual(shouldAttachTargetChoir('/songs', null), false);
            assertEqual(shouldAttachTargetChoir('/songs', '   '), false);
        },
    },
    {
        name: 'canonical IDs take precedence over legacy Mongo IDs',
        run: () => {
            assertEqual(resolveEntityId({ id: 'canonical', _id: 'legacy' }), 'canonical');
            assertEqual(resolveEntityId({ _id: 'legacy' }), 'legacy');
            assertEqual(resolveEntityId({ id: '  ', _id: ' legacy ' }), 'legacy');
            assertEqual(resolveEntityId({}), null);
        },
    },
    {
        name: 'auth errors map API codes to Spanish UI messages',
        run: () => {
            assertEqual(
                getAuthErrorMessage('INVALID_CURRENT_PASSWORD', 'Fallback'),
                'La contraseña actual no es correcta.',
            );
            assertEqual(
                getAuthErrorMessage('PASSWORD_CHANGE_REQUIRED', 'Fallback'),
                'Debes cambiar la contraseña temporal antes de continuar.',
            );
        },
    },
    {
        name: 'public choir codes normalize and build canonical paths',
        run: () => {
            assertEqual(normalizeChoirCode('  Coro-A  '), 'coro-a');
            assertEqual(isValidChoirCode('coro-a'), true);
            assertEqual(isValidChoirCode('-coro-a'), false);
            assertEqual(buildPublicChoirPath('Coro-A', '/blog/'), '/coro-a/blog');
            assertEqual(
                buildPublicApiPath('Coro-A', '/announcements/'),
                '/public/coro-a/announcements',
            );
        },
    },
    {
        name: 'tenant request scopes reject stale responses after a choir change',
        run: () => {
            let activeChoirId: string | null = 'choir-a';
            registerTenantStoreScope(() => activeChoirId);
            const scope = beginTenantStoreRequest();

            assertEqual(scope.choirId, 'choir-a');
            assertEqual(isTenantStoreRequestCurrent(scope), true);

            activeChoirId = 'choir-b';
            assertEqual(isTenantStoreRequestCurrent(scope), false);

            activeChoirId = 'choir-a';
            invalidateTenantStoreRequests();
            assertEqual(isTenantStoreRequestCurrent(scope), false);
        },
    },
    {
        name: 'temporary passwords follow the API policy',
        run: () => {
            assertEqual(isValidTemporaryPassword('Choirs!2026Secure'), true);
            assertEqual(isValidTemporaryPassword('short'), false);
            assertEqual(isValidTemporaryPassword('choirs-password-2026'), false);
            assertEqual(isValidTemporaryPassword('CHOIRS!PASSWORD2026'), false);
        },
    },
    {
        name: 'chat cache keys are isolated by choir and user',
        run: () => {
            assertEqual(APP_STORAGE_PREFIX, 'choir-web:');
            assertEqual(
                buildAppStorageKey(' choir-a ', ' user-1 ', 'chat'),
                'choir-web:choir-a:user-1:chat',
            );
            assertEqual(
                buildAppStorageKey('choir-b', 'user-1', 'chat'),
                'choir-web:choir-b:user-1:chat',
            );
        },
    },
    {
        name: 'logout storage cleanup preserves unrelated domain keys',
        run: () => {
            assertEqual(isChoirWebStorageKey('choir-web:session:access-token'), true);
            assertEqual(isChoirWebStorageKey('choir-web:choir-a:user-1:chat'), true);
            assertEqual(isChoirWebStorageKey('other-product:preference'), false);
            assertEqual(isChoirWebStorageKey('theme'), false);
        },
    },
    {
        name: 'inactive choir sessions map to a dedicated safe message',
        run: () => {
            assertEqual(
                getAuthErrorMessage('CHOIR_INACTIVE', 'Fallback'),
                'El coro está inactivo o ya no está disponible.',
            );
        },
    },
    {
        name: 'auth errors preserve the provided fallback for unmapped codes',
        run: () => {
            assertEqual(
                getAuthErrorMessage('NEW_API_CODE', 'Mensaje seguro'),
                'Mensaje seguro',
            );
            assertEqual(getAuthErrorMessage(undefined, 'Mensaje seguro'), 'Mensaje seguro');
        },
    },
    {
        name: 'API URL normalization never duplicates the API prefix',
        run: () => {
            const fromOrigin = normalizeApiUrl('https://api.example.com');
            const fromApiPath = normalizeApiUrl('https://api.example.com/api/');

            assertEqual(fromOrigin.origin, 'https://api.example.com');
            assertEqual(fromOrigin.baseUrl, 'https://api.example.com/api');
            assertEqual(fromApiPath.origin, 'https://api.example.com');
            assertEqual(fromApiPath.baseUrl, 'https://api.example.com/api');
        },
    },
    {
        name: 'Socket.IO can use an independent origin or safely fall back to the API origin',
        run: () => {
            assertEqual(
                normalizeSocketOrigin('https://socket.example.com/api', 'https://api.example.com'),
                'https://socket.example.com',
            );
            assertEqual(
                normalizeSocketOrigin('', 'https://api.example.com'),
                'https://api.example.com',
            );
        },
    },
    {
        name: 'environment parsing rejects invalid public choir codes and request timeouts',
        run: () => {
            assertEqual(parseDefaultPublicChoirCode(' Coro-A '), 'coro-a');
            assertEqual(parseDefaultPublicChoirCode(''), null);
            assertEqual(parseRequestTimeout('12000'), 12000);
            assertThrows(() => parseDefaultPublicChoirCode('-invalid'));
            assertThrows(() => parseRequestTimeout('999'));
        },
    },
    {
        name: 'SUPER_ADMIN without a selected choir returns to the platform choir list',
        run: () => {
            assertEqual(
                resolveAdminEntryRedirect({ isSuperAdmin: true, hasTenantContext: false }),
                '/admin/choirs',
            );
        },
    },
    {
        name: 'tenant users and entered platform tenants do not redirect away from admin',
        run: () => {
            assertEqual(
                resolveAdminEntryRedirect({ isSuperAdmin: true, hasTenantContext: true }),
                null,
            );
            assertEqual(
                resolveAdminEntryRedirect({ isSuperAdmin: false, hasTenantContext: true }),
                null,
            );
        },
    },
    {
        name: 'a selected platform choir does not activate the tenant admin surface',
        run: () => {
            assertEqual(isPlatformTenantContextActive('platform', 'choir-a'), false);
            assertEqual(isPlatformTenantContextActive('tenant', null), false);
            assertEqual(isPlatformTenantContextActive('tenant', 'choir-a'), true);
        },
    },
    {
        name: 'entering a choir from platform opens the full tenant admin surface',
        run: () => {
            assertEqual(getEnteredChoirLandingRoute(), '/admin');
        },
    },
    {
        name: 'platform user management stays under the platform choir route',
        run: () => {
            assertEqual(
                getPlatformChoirUsersRoute('choir-a'),
                '/admin/choirs/choir-a/users',
            );
        },
    },
];

let failureCount = 0;

for (const testCase of testCases) {
    try {
        testCase.run();
        console.log(`PASS ${testCase.name}`);
    } catch (error) {
        failureCount += 1;
        const message = error instanceof Error ? error.message : 'Unexpected test failure';
        console.error(`FAIL ${testCase.name}: ${message}`);
    }
}

if (failureCount > 0) {
    throw new Error(`${failureCount} test case(s) failed`);
}

console.log(`PASS ${testCases.length} test cases`);
