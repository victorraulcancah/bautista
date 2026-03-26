import { BookOpen } from 'lucide-react';
import type { Column } from '@/components/shared/ResourceTable';
import type { Curso } from './useCursos';

export const cursosColumns: Column<Curso>[] = [
    {
        label: 'Contenido',
        render: (c) => (
            <a
                href={`/cursos/${c.curso_id}/contenido`}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-amber-600 hover:bg-amber-50 hover:text-amber-800"
                onClick={(e) => e.stopPropagation()}
            >
                <BookOpen className="h-3 w-3" /> Ver
            </a>
        ),
    },
    { label: 'Nombre', render: (c) => c.nombre },
    {
        label: 'Descripción',
        render: (c) => c.descripcion
            ? c.descripcion.length > 50 ? c.descripcion.substring(0, 50) + '...' : c.descripcion
            : '—',
    },
    { label: 'Nivel', render: (c) => c.nivel?.nombre_nivel ?? '—' },
    { label: 'Grado', render: (c) => c.grado?.nombre_grado ?? '—' },
    {
        label: 'Estado',
        render: (c) => (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.estado === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {c.estado === '1' ? 'Activo' : 'Inactivo'}
            </span>
        ),
    },
];
