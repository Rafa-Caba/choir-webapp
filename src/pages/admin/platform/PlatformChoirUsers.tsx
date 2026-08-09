// src/pages/admin/platform/PlatformChoirUsers.tsx

import { AdminUsersList } from '../../../components/users/AdminUsersList';
import { AccessDenied } from '../../../components/auth/AccessDenied';
import { useAuth } from '../../../context/AuthContext';
import { buildPlatformChoirUsersRoute, PLATFORM_CHOIRS_ROUTE } from '../../../routing';

export const PlatformChoirUsers = () => {
    const { targetChoir } = useAuth();

    if (!targetChoir) {
        return (
            <AccessDenied
                title="Selecciona un coro"
                message="Debes seleccionar un coro desde la consola de plataforma antes de administrar usuarios."
                actionLabel="Volver a coros"
                actionPath={PLATFORM_CHOIRS_ROUTE}
            />
        );
    }

    return (
        <AdminUsersList
            basePath={buildPlatformChoirUsersRoute(targetChoir.id)}
            title="Usuarios del coro"
            contextLabel={targetChoir.name}
            backPath={PLATFORM_CHOIRS_ROUTE}
        />
    );
};
