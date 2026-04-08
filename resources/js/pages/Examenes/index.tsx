import { Head, Link } from '@inertiajs/react';
import { BookOpen, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import type { Column } from '@/components/shared/ResourceTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useResource } from '@/hooks/useResource';
import type { BreadcrumbItem } from '@/types';
import ActividadFormModal from './components/ActividadFormModal';
import CuestionarioDrawer from './components/CuestionarioDrawer';

// ─── Types ────────────────────────────────────────────────────────────────────
export type TipoActividad = { tipo_id: number; nombre: string };

export type Actividad = {
    actividad_id:      number;
    id_curso:          number;
    id_tipo_actividad: number;
    nombre_actividad:  string;
    descripcion_corta: string | null;
    fecha_inicio:      string | null;
    fecha_cierre:      string | null;
    estado:            string;
    es_calificado:     string;
    tipo?:             TipoActividad;
    cuestionario?:     null | {
        cuestionario_id: number;
        duracion:        number;
        mostrar_respuesta: string;
        preguntas:       Pregunta[];
    };
};

export type Pregunta = {
    pregunta_id:    number;
    cabecera:       string;
    cuerpo:         string | null;
    tipo_respuesta: string;
    valor_nota:     number;
    alternativas:   Alternativa[];
};

export type Alternativa = {
    alternativa_id: number;
    contenido:      string;
    es_correcta:    boolean;
};

// ─── Badge de tipo ─────────────────────────────────────────────────────────
const TIPO_COLORS: Record<string, string> = {
    'Examen':         'bg-red-100 text-red-700',
    'Cuestionario':  'bg-purple-100 text-purple-700',
    'Tarea':         'bg-blue-100 text-blue-700',
    'Dibujo':        'bg-yellow-100 text-yellow-700',
    'Rompecabezas':  'bg-green-100 text-green-700',
};

function TipoBadge({ nombre }: { nombre?: string }) {
    if (!nombre) {
return <span className="text-gray-400 text-xs">—</span>;
}

    const cls = TIPO_COLORS[nombre] ?? 'bg-gray-100 text-gray-600';

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
            {nombre}
        </span>
    );
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Exámenes', href: '/examenes' },
];

// ─── Main page ────────────────────────────────────────────────────────────
export default function ExamenesPage({ cursoId }: { cursoId?: number }) {
    // For now show all; in production filter by curso_id from route params
    const endpoint = cursoId ? `/actividades?curso_id=${cursoId}` : '/actividades';
    const res = useResource<Actividad>(endpoint);

    const [modalOpen, setModalOpen]     = useState(false);
    const [editing, setEditing]         = useState<Actividad | null>(null);
    const [drawerOpen, setDrawerOpen]   = useState(false);
    const [selected, setSelected]       = useState<Actividad | null>(null);

    const openCreate = () => {
 setEditing(null); setModalOpen(true); 
};
    const openEdit   = (a: Actividad) => {
 setEditing(a); setModalOpen(true); 
};
    const openDrawer = (a: Actividad) => {
 setSelected(a); setDrawerOpen(true); 
};

    const columns: Column<Actividad>[] = [
        {
            label:  '#',
            render: (a) => a.actividad_id,
        },
        {
            label:  'Nombre de actividad',
            render: (a) => (
                <button
                    className="text-left font-medium text-purple-700 hover:underline"
                    onClick={() => openDrawer(a)}
                >
                    {a.nombre_actividad}
                </button>
            ),
        },
        {
            label:  'Tipo',
            render: (a) => <TipoBadge nombre={a.tipo?.nombre} />,
        },
        {
            label:  'Fecha inicio',
            render: (a) => a.fecha_inicio ? a.fecha_inicio.slice(0, 10) : '—',
        },
        {
            label:  'Fecha cierre',
            render: (a) => a.fecha_cierre ? a.fecha_cierre.slice(0, 10) : '—',
        },
        {
            label:  'Estado',
            render: (a) => (
                <Badge variant={a.estado === '1' ? 'default' : 'secondary'}>
                    {a.estado === '1' ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
        },
        {
            label:  'Acciones',
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
                        onClick={(e) => {
 e.stopPropagation(); openEdit(a); 
}}
                    >
                        Editar
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="Exámenes Virtuales" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Exámenes Virtuales"
                subtitle={res.rows ? `${res.rows.total} actividades` : '…'}
                icon={BookOpen}
                iconColor="bg-purple-600"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nueva Actividad"
                onNew={openCreate}
            >
                {res.rows && (
                    <ResourceTable
                        rows={res.rows}
                        columns={columns}
                        getKey={(a) => a.actividad_id}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && (
                    <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>
                )}
            </ResourcePage>

            <ActividadFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                editing={editing}
                onSave={async (data) => {
                    if (editing) {
                        await res.update(editing.actividad_id, data);
                    } else {
                        await res.create(data);
                    }
                }}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />

            <CuestionarioDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                actividad={selected}
            />
        </>
    );
}
