export type EstadoAsistencia = 'P' | 'T' | 'F' | 'J';

export interface Alumno {
    estu_id: number;
    nombre: string;
    foto?: string | null;
}

export interface Clase {
    clase_id: number;
    titulo: string;
    unidad_titulo?: string;
}

export interface RegistroHoy {
    estu_id: number;
    estado: EstadoAsistencia;
}

export interface SesionHistorial {
    fecha: string;
    estudiantes: {
        estu_id: number;
        nombre: string;
        estado: EstadoAsistencia;
    }[];
}

export const ESTADO_CONFIG: Record<EstadoAsistencia, {
    label: string;
    icon: string;
    bg: string;
    text: string;
    border: string;
}> = {
    P: { label: 'Presente',    icon: '✓', bg: 'bg-white',     text: 'text-gray-700', border: 'border-gray-200' },
    T: { label: 'Atrasado',    icon: '⏱', bg: 'bg-white',     text: 'text-gray-700', border: 'border-gray-200' },
    F: { label: 'Ausente',     icon: '✕', bg: 'bg-white',     text: 'text-gray-700', border: 'border-gray-200' },
    J: { label: 'Justificado', icon: '⊘', bg: 'bg-white',     text: 'text-gray-700', border: 'border-gray-200' },
};
