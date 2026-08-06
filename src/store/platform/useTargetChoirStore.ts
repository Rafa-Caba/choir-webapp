// src/store/platform/useTargetChoirStore.ts

import { create } from 'zustand';
import { registerTenantContextBridge } from '../../api/tenantContextBridge';
import { getChoirById } from '../../services/admin/choirs';
import {
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
    readonly restoreTargetChoir: () => Promise<Choir | null>;
    readonly syncSelectedChoir: (choir: Choir) => void;
    readonly leaveTenantContext: () => void;
    readonly clearSelection: () => void;
}

const clearPersistedSelection = (): void => {
    writeTargetChoirId(null);
};

export const useTargetChoirStore = create<TargetChoirState>((set, get) => ({
    selectedChoir: null,
    viewMode: readTargetChoirId() ? 'tenant' : 'platform',
    status: 'idle',
    errorMessage: '',

    selectChoir: (choir) => {
        if (!choir.isActive) {
            throw new Error('Inactive choirs cannot be selected as a tenant context');
        }

        const currentChoirId = get().selectedChoir?.id ?? null;

        if (currentChoirId !== choir.id) {
            resetTenantStores();
        }

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
                viewMode: 'tenant',
                status: 'ready',
                errorMessage: '',
            });
            return choir;
        } catch {
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

    leaveTenantContext: () => {
        resetTenantStores();
        clearPersistedSelection();
        set({
            selectedChoir: null,
            viewMode: 'platform',
            status: 'ready',
            errorMessage: '',
        });
    },

    clearSelection: () => {
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
