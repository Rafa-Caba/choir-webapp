// src/pages/public/states/PublicLoadError.tsx

import { PublicSiteState } from '../../../components/public/PublicSiteState';

export const PublicLoadError = () => (
    <PublicSiteState
        title="No fue posible cargar el sitio"
        message="Ocurrió un problema al cargar el contenido público de este coro. Inténtalo nuevamente más tarde."
        actionLabel="Ir al inicio"
        actionPath="/"
    />
);
