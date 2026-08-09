// src/store/platform/platformContext.ts

export type PlatformContextViewMode = 'platform' | 'tenant';

export const isPlatformTenantContextActive = (
    viewMode: PlatformContextViewMode,
    targetChoirId: string | null,
): boolean => (
    viewMode === 'tenant' && Boolean(targetChoirId?.trim())
);
