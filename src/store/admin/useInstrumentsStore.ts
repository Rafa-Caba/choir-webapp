// src/store/admin/useInstrumentsStore.ts

import { create } from 'zustand';
import {
    deleteInstrument,
    getInstrumentById,
    getInstruments,
    saveInstrument,
} from '../../services/admin/instruments';
import {
    beginTenantStoreRequest,
    isTenantStoreRequestCurrent,
} from '../tenantStoreScope';
import type { CreateInstrumentPayload, Instrument } from '../../types/instrument';

interface InstrumentsState {
    readonly instruments: Instrument[];
    readonly currentInstrument: Instrument | null;
    readonly activeChoirId: string | null;
    readonly loading: boolean;
    readonly hasAttemptedLoad: boolean;
    readonly loadFailed: boolean;
    readonly fetchInstruments: () => Promise<void>;
    readonly fetchInstrumentById: (id: string) => Promise<Instrument | null>;
    readonly saveInstrumentAction: (
        payload: CreateInstrumentPayload,
        file?: File,
        id?: string,
    ) => Promise<Instrument>;
    readonly deleteInstrumentById: (id: string) => Promise<void>;
    readonly getInstrumentFromState: (id: string) => Instrument | undefined;
}

const upsertInstrument = (
    instruments: readonly Instrument[],
    nextInstrument: Instrument,
): Instrument[] => (
    instruments.some((instrument) => instrument.id === nextInstrument.id)
        ? instruments.map((instrument) => (
            instrument.id === nextInstrument.id ? nextInstrument : instrument
        ))
        : [...instruments, nextInstrument]
);

export const useInstrumentsStore = create<InstrumentsState>((set, get) => ({
    instruments: [],
    currentInstrument: null,
    activeChoirId: null,
    loading: false,
    hasAttemptedLoad: false,
    loadFailed: false,

    fetchInstruments: async () => {
        const scope = beginTenantStoreRequest();
        const state = get();

        if (state.activeChoirId === scope.choirId && state.loading) {
            return;
        }

        set({
            loading: true,
            hasAttemptedLoad: true,
            loadFailed: false,
            activeChoirId: scope.choirId,
        });

        try {
            const instruments = await getInstruments();

            if (isTenantStoreRequestCurrent(scope)) {
                set({
                    instruments,
                    loadFailed: false,
                });
            }
        } catch (error) {
            if (isTenantStoreRequestCurrent(scope)) {
                set({
                    instruments: [],
                    loadFailed: true,
                });
            }

            throw error;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    fetchInstrumentById: async (id) => {
        const scope = beginTenantStoreRequest();
        const existing = get().activeChoirId === scope.choirId
            ? get().instruments.find((instrument) => instrument.id === id)
            : undefined;

        if (existing) {
            set({ currentInstrument: existing });
            return existing;
        }

        try {
            const instrument = await getInstrumentById(id);

            if (!isTenantStoreRequestCurrent(scope)) {
                return null;
            }

            set((state) => ({
                instruments: upsertInstrument(state.instruments, instrument),
                currentInstrument: instrument,
                activeChoirId: scope.choirId,
            }));
            return instrument;
        } catch {
            return null;
        }
    },

    saveInstrumentAction: async (payload, file, id) => {
        const scope = beginTenantStoreRequest();
        set({ loading: true, activeChoirId: scope.choirId });

        try {
            const instrument = await saveInstrument(payload, file, id);

            if (isTenantStoreRequestCurrent(scope)) {
                set((state) => ({
                    instruments: upsertInstrument(state.instruments, instrument),
                    currentInstrument: instrument,
                }));
            }

            return instrument;
        } finally {
            if (isTenantStoreRequestCurrent(scope)) {
                set({ loading: false });
            }
        }
    },

    deleteInstrumentById: async (id) => {
        const scope = beginTenantStoreRequest();
        await deleteInstrument(id);

        if (isTenantStoreRequestCurrent(scope)) {
            set((state) => ({
                instruments: state.instruments.filter((instrument) => instrument.id !== id),
                currentInstrument: state.currentInstrument?.id === id
                    ? null
                    : state.currentInstrument,
            }));
        }
    },

    getInstrumentFromState: (id) => get().instruments.find((instrument) => instrument.id === id),
}));
