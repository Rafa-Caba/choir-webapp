// src/pages/public/states/PublicChoirNotFound.tsx

import { PublicSiteState } from '../../../components/public/PublicSiteState';

export const PublicChoirNotFound = () => (
    <PublicSiteState
        title="Coro no encontrado"
        message="No encontramos una página pública activa para el código incluido en esta dirección."
        actionLabel="Ir al inicio"
        actionPath="/"
    />
);
