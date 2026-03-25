import type { Column } from '@/components/shared/ResourceTable';
import type { Docente } from './useDocentes';
import { nombreCompleto, dniDocente } from './useDocentes';

export const docentesColumns: Column<Docente>[] = [
    { label: 'Nombre Completo', render: (d) => nombreCompleto(d) },
    { label: 'DNI',             render: (d) => dniDocente(d) },
    { label: 'Especialidad',    render: (d) => d.especialidad ?? '—' },
    {
        label: 'Planilla',
        render: (d) => (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${d.planilla === 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {d.planilla === 1 ? 'En planilla' : 'Fuera de planilla'}
            </span>
        ),
    },
    {
        label: 'Género',
        render: (d) => d.perfil?.genero === 'M' ? 'Masculino' : d.perfil?.genero === 'F' ? 'Femenino' : '—',
    },
    { label: 'Teléfono', render: (d) => d.perfil?.telefono ?? '—' },
    {
        label: 'Estado',
        render: (d) => {
            const map: Record<string, { label: string; cls: string }> = {
                '1': { label: 'Activo',    cls: 'bg-green-100 text-green-700' },
                '0': { label: 'Inactivo',  cls: 'bg-gray-100 text-gray-600' },
                '5': { label: 'Bloqueado', cls: 'bg-red-100 text-red-600' },
            };
            const entry = map[d.estado] ?? { label: d.estado, cls: 'bg-gray-100 text-gray-600' };
            return (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${entry.cls}`}>
                    {entry.label}
                </span>
            );
        },
    },
];
