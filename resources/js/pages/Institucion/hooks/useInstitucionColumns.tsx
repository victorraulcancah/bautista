import type { Column } from '@/components/shared/ResourceTable';
import type { Institucion } from './useInstitucion';

export const institucionColumns: Column<Institucion>[] = [
    { label: 'Razón Social',  render: (i) => i.insti_razon_social ?? '—' },
    { label: 'RUC',           render: (i) => i.insti_ruc          ?? '—' },
    { label: 'Director',      render: (i) => i.insti_director     ?? '—' },
    { label: 'Teléfono',      render: (i) => i.insti_telefono1    ?? '—' },
    {
        label: 'Estado',
        render: (i) => (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${i.insti_estatus === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {i.insti_estatus === 1 ? 'Activo' : 'Inactivo'}
            </span>
        ),
    },
];
