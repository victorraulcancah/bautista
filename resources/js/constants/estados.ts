export const ESTADOS = {
    ACTIVO: '1',
    INACTIVO: '0',
} as const;

export type Estado = (typeof ESTADOS)[keyof typeof ESTADOS];
