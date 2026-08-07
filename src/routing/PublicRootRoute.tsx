// src/routing/PublicRootRoute.tsx

import { Navigate } from 'react-router-dom';
import ENV from '../config/env';
import { PublicSiteState } from '../components/public/PublicSiteState';
import { buildPublicChoirPath } from '../utils/choirCode';

export const PublicRootRoute = () => {
    if (ENV.DEFAULT_PUBLIC_CHOIR_CODE) {
        return (
            <Navigate
                to={buildPublicChoirPath(ENV.DEFAULT_PUBLIC_CHOIR_CODE)}
                replace
            />
        );
    }

    return (
        <PublicSiteState
            title="Choirs"
            message="Abre la dirección pública específica de tu coro para consultar su contenido."
        />
    );
};
