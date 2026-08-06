// tests/run.ts

import { getPermissions } from '../src/auth/permissions.js';
import {
    isPlatformRequest,
    normalizeApiRequestPath,
    shouldAttachTargetChoir,
} from '../src/api/requestScope.js';
import { resolveEntityId } from '../src/types/api/entity.js';
import { getAuthErrorMessage } from '../src/auth/authErrorMessages.js';

interface TestCase {
    readonly name: string;
    readonly run: () => void;
}

const assertEqual = <Value>(actual: Value, expected: Value): void => {
    if (!Object.is(actual, expected)) {
        throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
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
        name: 'auth errors preserve the provided fallback for unmapped codes',
        run: () => {
            assertEqual(
                getAuthErrorMessage('NEW_API_CODE', 'Mensaje seguro'),
                'Mensaje seguro',
            );
            assertEqual(getAuthErrorMessage(undefined, 'Mensaje seguro'), 'Mensaje seguro');
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
