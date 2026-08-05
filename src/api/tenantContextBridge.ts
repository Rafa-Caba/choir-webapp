// src/api/tenantContextBridge.ts

import { readTargetChoirId } from '../storage/sessionStorage';

type GetTargetChoirIdFn = () => string | null;

let getTargetChoirIdFn: GetTargetChoirIdFn = readTargetChoirId;

export const registerTenantContextBridge = (getter: GetTargetChoirIdFn): void => {
    getTargetChoirIdFn = getter;
};

export const tenantContextBridge = {
    getTargetChoirId: (): string | null => getTargetChoirIdFn(),
};
