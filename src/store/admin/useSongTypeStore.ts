// src/store/admin/useSongTypeStore.ts

import { create } from 'zustand';
import {
    createSongType,
    deleteSongType,
    getAllSongTypes,
    getSongTypeById,
    updateSongType,
} from '../../services/admin/songType';
import {
    beginTenantStoreRequest,
    isTenantStoreRequestCurrent,
} from '../tenantStoreScope';
import type { SongType } from '../../types/song';

interface AdminSongTypeState {
    readonly types: SongType[];
    readonly currentType: SongType | null;
    readonly activeChoirId: string | null;
    readonly loading: boolean;
    readonly fetchTypes: () => Promise<void>;
    readonly getType: (id: string) => Promise<SongType | null>;
    readonly addType: (
        name: string,
        order: number,
        parentId?: string | null,
        isParent?: boolean,
    ) => Promise<SongType>;
    readonly editType: (
        id: string,
        name: string,
        order: number,
        parentId?: string | null,
        isParent?: boolean,
    ) => Promise<SongType>;
    readonly removeType: (id: string) => Promise<void>;
}

const upsertType = (types: readonly SongType[], nextType: SongType): SongType[] => (
    types.some((type) => type.id === nextType.id)
        ? types.map((type) => type.id === nextType.id ? nextType : type)
        : [...types, nextType]
);

export const useSongTypeStore = create<AdminSongTypeState>((set) => ({
    types: [],
    currentType: null,
    activeChoirId: null,
    loading: false,

    fetchTypes: async () => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const types = await getAllSongTypes();

            if (isTenantStoreRequestCurrent(scope)) {
                set({ types });
            }
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    getType: async (id) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const type = await getSongTypeById(id);

            if (!isTenantStoreRequestCurrent(scope)) {
                return null;
            }

            set((state) => ({
                types: upsertType(state.types, type),
                currentType: type,
            }));
            return type;
        } catch {
            return null;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    addType: async (name, order, parentId, isParent) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const type = await createSongType({
                name,
                order,
                parentId: parentId || undefined,
                isParent,
            });

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    types: upsertType(state.types, type),
                    currentType: type,
                }));
            }

            return type;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    editType: async (id, name, order, parentId, isParent) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const type = await updateSongType(id, {
                name,
                order,
                parentId: parentId || null,
                isParent,
            });

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    types: upsertType(state.types, type),
                    currentType: type,
                }));
            }

            return type;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    removeType: async (id) => {
        const scope = beginTenantStoreRequest();
        await deleteSongType(id);

        if (isTenantStoreRequestCurrent(scope)) {
            set((state) => ({
                types: state.types.filter((type) => type.id !== id),
                currentType: state.currentType?.id === id ? null : state.currentType,
            }));
        }
    },
}));
