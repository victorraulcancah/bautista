export type DashboardStats = {
    instituciones: number;
    estudiantes: number;
    docentes: number;
    cursos: number;
};

export type AccesoRapido = {
    label: string;
    href: string;
};

export const accesosRapidos: AccesoRapido[] = [
    { label: 'Nueva Matrícula',       href: '/matriculas/crear' },
    { label: 'Registrar Estudiante',  href: '/estudiantes/crear' },
    { label: 'Registrar Docente',     href: '/docentes/crear' },
    { label: 'Ver Asistencia',        href: '/asistencia' },
];
