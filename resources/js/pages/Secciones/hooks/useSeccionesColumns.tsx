import type { Column } from '@/components/shared/ResourceTable';
import type { Seccion } from './useSecciones';

export const seccionesColumns: Column<Seccion>[] = [
    { label: 'Nombre',      render: (s) => s.nombre },
    { label: 'Abreviatura', render: (s) => s.abreviatura ?? '—' },
    { label: 'Grado',       render: (s) => s.grado?.nombre_grado ?? '—' },
    { label: 'N° Alumnos',  render: (s) => s.cnt_alumnos },
    { label: 'Horario',     render: (s) => s.horario ?? '—' },
];
