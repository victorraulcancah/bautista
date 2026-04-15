import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Column } from '@/components/shared/ResourceTable';
import type { Actividad } from '../types';
import TipoBadge from './TipoBadge';

export function buildColumns(
    onEdit: (a: Actividad) => void,
    onDrawer: (a: Actividad) => void,
): Column<Actividad>[] {
    return [
        {
            label: '#',
            render: (a) => a.actividad_id,
        },
        {
            label: 'Nombre de actividad',
            render: (a) => (
                <button
                    className="text-left font-medium text-purple-700 hover:underline"
                    onClick={() => onDrawer(a)}
                >
                    {a.nombre_actividad}
                </button>
            ),
        },
        {
            label: 'Tipo',
            render: (a) => <TipoBadge nombre={a.tipo?.nombre} />,
        },
        {
            label: 'Fecha inicio',
            render: (a) => a.fecha_inicio?.slice(0, 10) ?? '—',
        },
        {
            label: 'Fecha cierre',
            render: (a) => a.fecha_cierre?.slice(0, 10) ?? '—',
        },
        {
            label: 'Estado',
            render: (a) => (
                <Badge variant={a.estado === '1' ? 'default' : 'secondary'}>
                    {a.estado === '1' ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
        },
        {
            label: 'Acciones',
            render: (a) => (
                <div className="flex space-x-2">
                    <Link href={`/examenes/${a.actividad_id}/resolver`}>
                        <Button variant="outline" size="sm" className="h-8 rounded-lg font-bold">
                            Probar Examen
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg font-bold text-gray-400"
                        onClick={(e) => { e.stopPropagation(); onEdit(a); }}
                    >
                        Editar
                    </Button>
                </div>
            ),
        },
    ];
}
