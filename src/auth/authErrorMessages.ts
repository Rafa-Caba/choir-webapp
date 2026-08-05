// src/auth/authErrorMessages.ts

const AUTH_ERROR_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
    INVALID_CREDENTIALS: 'Los datos de acceso no son correctos.',
    USER_INACTIVE: 'Esta cuenta está suspendida. Contacta a un administrador.',
    CHOIR_INACTIVE: 'El coro está inactivo o ya no está disponible.',
    CHOIR_CONTEXT_REQUIRED: 'La cuenta no tiene un coro válido asignado.',
    INVALID_PLATFORM_CONTEXT: 'La cuenta de plataforma tiene una configuración inválida.',
    SESSION_REVOKED: 'Tu sesión fue cerrada por seguridad. Inicia sesión nuevamente.',
    REFRESH_TOKEN_REVOKED: 'Tu sesión expiró. Inicia sesión nuevamente.',
    INVALID_CURRENT_PASSWORD: 'La contraseña actual no es correcta.',
    PASSWORD_REUSE_NOT_ALLOWED: 'La nueva contraseña debe ser diferente a la actual.',
    PASSWORD_CHANGE_REQUIRED: 'Debes cambiar la contraseña temporal antes de continuar.',
    ACCESS_TOKEN_REQUIRED: 'Inicia sesión para continuar.',
    INVALID_AUTHORIZATION_HEADER: 'Tu sesión no es válida. Inicia sesión nuevamente.',
    INVALID_ACCESS_TOKEN: 'Tu sesión no es válida. Inicia sesión nuevamente.',
    INVALID_REFRESH_TOKEN: 'Tu sesión expiró. Inicia sesión nuevamente.',
    VALIDATION_ERROR: 'Revisa los datos capturados e inténtalo nuevamente.',
    ROUTE_NOT_FOUND: 'La función solicitada no está disponible.',
    INTERNAL_SERVER_ERROR: 'Ocurrió un error inesperado. Inténtalo nuevamente.',
});

export const getAuthErrorMessage = (
    code: string | undefined,
    fallbackMessage: string,
): string => {
    if (!code) {
        return fallbackMessage;
    }

    return AUTH_ERROR_MESSAGES[code] ?? fallbackMessage;
};
