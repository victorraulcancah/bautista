import type { Column } from '@/components/shared/ResourceTable';
import type { Grado } from './useGrados';

export const gradosColumns: Column<Grado>[] = [
    { label: 'Nombre del Grado', render: (g) => g.nombre_grado },
    { label: 'Abreviatura',      render: (g) => g.abreviatura ?? '—' },
    { label: 'Nivel',            render: (g) => g.nivel?.nombre_nivel ?? '—' },
];
