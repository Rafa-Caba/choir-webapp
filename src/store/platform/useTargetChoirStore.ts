// src/store/platform/useTargetChoirStore.ts

import { create } from 'zustand';
import { registerTenantContextBridge } from '../../api/tenantContextBridge';
import { getChoirById } from '../../services/admin/choirs';
import {
    readAccessMode,
    readTargetChoirId,
    writeTargetChoirId,
} from '../../storage/sessionStorage';
import { resetTenantStores } from '../resetAuthenticatedStores';
import type { Choir } from '../../types/choir';

export type PlatformViewMode = 'platform' | 'tenant';
export type TargetChoirStatus = 'idle' | 'restoring' | 'ready';

interface TargetChoirState {
    readonly selectedChoir: Choir | null;
    readonly viewMode: PlatformViewMode;
    readonly status: TargetChoirStatus;
    readonly errorMessage: string;
    readonly selectChoir: (choir: Choir) => void;
    readonly enterChoir: (choir: Choir) => void;
    readonly restoreTargetChoir: () => Promise<Choir | null>;
    readonly syncSelectedChoir: (choir: Choir) => void;
    readonly returnToPlatform: () => void;
    readonly clearSelection: () => void;
}

const clearPersistedSelection = (): void => {
    writeTargetChoirId(null);
};

const assertActiveChoir = (choir: Choir): void => {
    if (!choir.isActive) {
        throw new Error('Inactive choirs cannot be selected as a platform target');
    }
};

const resetStoresWhenChoirChanges = (
    currentChoirId: string | null,
    nextChoirId: string,
): void => {
    if (currentChoirId !== nextChoirId) {
        resetTenantStores();
    }
};

export const useTargetChoirStore = create<TargetChoirState>((set, get) => ({
    selectedChoir: null,
    viewMode: readAccessMode() === 'tenant' ? 'tenant' : 'platform',
    status: 'idle',
    errorMessage: '',

    selectChoir: (choir) => {
        assertActiveChoir(choir);
        resetStoresWhenChoirChanges(get().selectedChoir?.id ?? null, choir.id);
        writeTargetChoirId(choir.id);
        set({
            selectedChoir: choir,
            viewMode: 'platform',
            status: 'ready',
            errorMessage: '',
        });
    },

    enterChoir: (choir) => {
        assertActiveChoir(choir);
        resetStoresWhenChoirChanges(get().selectedChoir?.id ?? null, choir.id);
        writeTargetChoirId(choir.id);
        set({
            selectedChoir: choir,
            viewMode: 'tenant',
            status: 'ready',
            errorMessage: '',
        });
    },

    restoreTargetChoir: async () => {
        const targetChoirId = readTargetChoirId();

        if (!targetChoirId) {
            set({
                selectedChoir: null,
                viewMode: 'platform',
                status: 'ready',
                errorMessage: '',
            });
            return null;
        }

        set({ status: 'restoring', errorMessage: '' });

        try {
            const choir = await getChoirById(targetChoirId);

            if (!choir.isActive) {
                resetTenantStores();
                clearPersistedSelection();
                set({
                    selectedChoir: null,
                    viewMode: 'platform',
                    status: 'ready',
                    errorMessage: 'El coro seleccionado ya no está activo.',
                });
                return null;
            }

            set({
                selectedChoir: choir,
                viewMode: readAccessMode() === 'tenant' ? 'tenant' : 'platform',
                status: 'ready',
                errorMessage: '',
            });
            return choir;
        } catch {
            resetTenantStores();
            clearPersistedSelection();
            set({
                selectedChoir: null,
                viewMode: 'platform',
                status: 'ready',
                errorMessage: 'No fue posible restaurar el coro seleccionado.',
            });
            return null;
        }
    },

    syncSelectedChoir: (choir) => {
        if (get().selectedChoir?.id !== choir.id) {
            return;
        }

        if (!choir.isActive) {
            resetTenantStores();
            clearPersistedSelection();
            set({
                selectedChoir: null,
                viewMode: 'platform',
                status: 'ready',
                errorMessage: 'El coro seleccionado fue desactivado.',
            });
            return;
        }

        writeTargetChoirId(choir.id);
        set({ selectedChoir: choir, errorMessage: '' });
    },

    returnToPlatform: () => {
        resetTenantStores();
        set({
            viewMode: 'platform',
            status: 'ready',
            errorMessage: '',
        });
    },

    clearSelection: () => {
        resetTenantStores();
        clearPersistedSelection();
        set({
            selectedChoir: null,
            viewMode: 'platform',
            status: 'idle',
            errorMessage: '',
        });
    },
}));

registerTenantContextBridge(() => (
    useTargetChoirStore.getState().selectedChoir?.id ?? readTargetChoirId()
));
