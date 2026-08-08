// src/pages/public/states/PublicChoirUnavailable.tsx

import { PublicSiteState } from '../../../components/public/PublicSiteState';

export const PublicChoirUnavailable = () => (
    <PublicSiteState
        title="Coro no disponible"
        message="La página pública de este coro no está disponible en este momento."
        actionLabel="Ir al inicio"
        actionPath="/"
    />
);
