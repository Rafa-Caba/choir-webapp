// src/users/temporaryPassword.ts

export const TEMPORARY_PASSWORD_MIN_LENGTH = 12;
export const TEMPORARY_PASSWORD_MAX_LENGTH = 128;

export const isValidTemporaryPassword = (password: string): boolean => (
    password.length >= TEMPORARY_PASSWORD_MIN_LENGTH
    && password.length <= TEMPORARY_PASSWORD_MAX_LENGTH
    && /[A-Z]/.test(password)
    && /[a-z]/.test(password)
    && /[0-9]/.test(password)
    && /[^A-Za-z0-9]/.test(password)
);

export const TEMPORARY_PASSWORD_HELP_TEXT =
    'Opcional. Debe tener entre 12 y 128 caracteres e incluir mayúscula, minúscula, número y símbolo. Si se deja vacío, el API generará una contraseña segura.';
