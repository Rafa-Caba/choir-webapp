// src/store/tenantStoreScope.ts

type EffectiveChoirIdGetter = () => string | null;

export interface TenantRequestScope {
    readonly choirId: string;
    readonly generation: number;
}

let getEffectiveChoirId: EffectiveChoirIdGetter = () => null;
let tenantGeneration = 0;

export const registerTenantStoreScope = (
    getter: EffectiveChoirIdGetter,
): void => {
    getEffectiveChoirId = getter;
};

export const getActiveTenantChoirId = (): string | null => (
    getEffectiveChoirId()?.trim() || null
);

export const invalidateTenantStoreRequests = (): void => {
    tenantGeneration += 1;
};

export const beginTenantStoreRequest = (): TenantRequestScope => {
    const choirId = getActiveTenantChoirId();

    if (!choirId) {
        throw new Error('A valid tenant choir context is required');
    }

    return {
        choirId,
        generation: tenantGeneration,
    };
};

export const isTenantStoreRequestCurrent = (
    scope: TenantRequestScope,
): boolean => (
    scope.generation === tenantGeneration
    && scope.choirId === getActiveTenantChoirId()
);
