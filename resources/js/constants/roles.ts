export const ROLES = {
    ADMIN: 'admin',
    DOCENTE: 'docente',
    ESTUDIANTE: 'estudiante',
    PADRE: 'padre',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
