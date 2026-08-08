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
    getSelectedChoirLandingRoute,
    resolveAdminEntryRedirect,
} from '../src/routing/adminNavigation.js';

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
        name: 'tenant users and selected platform tenants do not redirect away from admin',
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
        name: 'selecting a choir from platform lands on tenant user administration',
        run: () => {
            assertEqual(getSelectedChoirLandingRoute(), '/admin/users');
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
