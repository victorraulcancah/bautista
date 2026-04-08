import type { Column } from '@/components/shared/ResourceTable';
import type { Usuario } from './useUsuarios';
import { nombreCompleto, rolLabel } from './useUsuarios';

export const usuariosColumns: Column<Usuario>[] = [
    { label: '#', render: (u) => <span className="text-gray-500 text-xs font-mono">{u.id}</span> },
    { label: 'Nombre Completo', render: (u) => nombreCompleto(u) },
    { label: 'Usuario / DNI',   render: (u) => u.username },
    { label: 'Correo',          render: (u) => u.email ?? '—' },
    {
        label: 'Rol',
        render: (u) => (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">
                {rolLabel(u.rol)}
            </span>
        ),
    },
    {
        label: 'Estado',
        render: (u) => {
            const map: Record<string, { label: string; cls: string }> = {
                '1': { label: 'Activo',    cls: 'bg-green-100 text-green-700' },
                '0': { label: 'Inactivo',  cls: 'bg-gray-100 text-gray-600' },
                '5': { label: 'Bloqueado', cls: 'bg-red-100 text-red-600' },
            };
            const entry = map[u.estado] ?? { label: u.estado, cls: 'bg-gray-100 text-gray-600' };

            return (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${entry.cls}`}>
                    {entry.label}
                </span>
            );
        },
    },
    { label: 'Teléfono', render: (u) => u.perfil?.telefono ?? '—' },
];
