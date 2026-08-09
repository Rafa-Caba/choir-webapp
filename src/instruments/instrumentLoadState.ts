// src/instruments/instrumentLoadState.ts

export const shouldAutoLoadInstruments = (
    hasAttemptedLoad: boolean,
): boolean => !hasAttemptedLoad;

export const shouldShowNoInstrumentsState = (
    hasAttemptedLoad: boolean,
    loadFailed: boolean,
    loading: boolean,
    instrumentCount: number,
): boolean => (
    hasAttemptedLoad
    && !loadFailed
    && !loading
    && instrumentCount === 0
);
