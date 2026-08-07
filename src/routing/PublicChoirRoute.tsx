// src/routing/PublicChoirRoute.tsx

import { useParams } from 'react-router-dom';
import { PublicSiteState } from '../components/public/PublicSiteState';
import { PublicGlobalProvider } from '../context/PublicGlobalProvider';
import PublicLayout from '../layouts/public/PublicLayout';
import { isValidChoirCode, normalizeChoirCode } from '../utils/choirCode';

export const PublicChoirRoute = () => {
    const params = useParams<{ choirCode: string }>();
    const choirCode = normalizeChoirCode(params.choirCode ?? '');

    if (!isValidChoirCode(choirCode)) {
        return (
            <PublicSiteState
                title="Dirección de coro inválida"
                message="El código incluido en la URL no tiene un formato válido."
            />
        );
    }

    return (
        <PublicGlobalProvider key={choirCode} choirCode={choirCode}>
            <PublicLayout />
        </PublicGlobalProvider>
    );
};
