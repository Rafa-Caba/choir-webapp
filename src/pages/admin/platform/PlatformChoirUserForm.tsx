// src/pages/admin/platform/PlatformChoirUserForm.tsx

import { AccessDenied } from '../../../components/auth/AccessDenied';
import { useAuth } from '../../../context/AuthContext';
import { UserForm } from '../user/UserForm';
import { buildPlatformChoirUsersRoute, PLATFORM_CHOIRS_ROUTE } from '../../../routing';

export const PlatformChoirUserForm = () => {
    const { targetChoir } = useAuth();

    if (!targetChoir) {
        return (
            <AccessDenied
                title="Selecciona un coro"
                message="Debes seleccionar un coro desde la consola de plataforma antes de crear o editar usuarios."
                actionLabel="Volver a coros"
                actionPath={PLATFORM_CHOIRS_ROUTE}
            />
        );
    }

    return (
        <UserForm
            usersPath={buildPlatformChoirUsersRoute(targetChoir.id)}
            contextLabel={targetChoir.name}
        />
    );
};
