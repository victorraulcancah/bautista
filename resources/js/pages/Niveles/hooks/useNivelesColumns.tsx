import type { Column } from '@/components/shared/ResourceTable';
import type { Nivel } from './useNiveles';

export const nivelesColumns: Column<Nivel>[] = [
    { label: 'Nombre del Nivel', render: (n) => n.nombre_nivel },
    {
        label: 'Estado',
        render: (n) => (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${n.nivel_estatus === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {n.nivel_estatus === 1 ? 'Activo' : 'Inactivo'}
            </span>
        ),
    },
];
