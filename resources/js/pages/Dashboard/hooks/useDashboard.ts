export type NotificationItem = {
    id:      string;
    type:    'info' | 'success' | 'warning' | 'error';
    title:   string;
    message: string;
    link?:   string;
};

export type MensajePendiente = {
    id:            number;
    fecha:         string;
    representante: string;
    telefono:      string;
    exalumno:      string;
    asunto:        string;
};

export type DashboardStats = {
    instituciones:       number;
    estudiantes:         number;
    docentes:            number;
    cursos:              number;
    notificaciones:      NotificationItem[];
    mensajes_pendientes: MensajePendiente[];
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
