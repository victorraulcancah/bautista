import type { Column } from '@/components/shared/ResourceTable';
import type { Seccion } from './useSecciones';

export const seccionesColumns: Column<Seccion>[] = [
    { label: '#',           render: (_, i) => i + 1 },
    { label: 'Nivel',       render: (s) => s.grado?.nivel?.nombre_nivel ?? '—' },
    { label: 'Grado',       render: (s) => s.grado?.nombre_grado ?? '—' },
    { label: 'Sección',     render: (s) => s.nombre },
    { label: 'N° Alumnos',  render: (s) => s.cnt_alumnos },
];
