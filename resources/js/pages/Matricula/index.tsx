import { Head } from '@inertiajs/react';
import { ClipboardList, Users } from 'lucide-react';
import { useState } from 'react';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import type { Column } from '@/components/shared/ResourceTable';
import { Button } from '@/components/ui/button';
import { useOptions } from '@/hooks/useOptions';
import { useResource } from '@/hooks/useResource';
import type { BreadcrumbItem } from '@/types';
import AperturaFormModal from './components/AperturaFormModal';
import MatriculasDrawer from './components/MatriculasDrawer';
import type { MatriculaApertura, AperturaFormData, SeccionOption } from './hooks/useMatricula';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard',  href: '/dashboard' },
    { title: 'Matrículas', href: '/matriculas' },
];

export default function MatriculaPage() {
    const res       = useResource<MatriculaApertura>('/matriculas/aperturas');
    const secciones = useOptions<SeccionOption>('/secciones');

    const [modalOpen, setModalOpen]   = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing]       = useState<MatriculaApertura | null>(null);
    const [selected, setSelected]     = useState<MatriculaApertura | null>(null);
    const [deleting, setDeleting]     = useState<MatriculaApertura | null>(null);

    const openCreate = () => {
 setEditing(null); setModalOpen(true); 
};
    const openEdit   = (a: MatriculaApertura) => {
 setEditing(a); setModalOpen(true); 
};
    const openDetail = (a: MatriculaApertura) => {
 setSelected(a); setDrawerOpen(true); 
};

    const handleDelete = async () => {
        if (!deleting) {
return;
}

        await res.remove(deleting.apertura_id);
        setDeleting(null);
    };

    const columns: Column<MatriculaApertura>[] = [
        {
            label:  'Nombre',
            render: (a) => <span className="font-medium">{a.nombre}</span>,
        },
        {
            label:  'Fecha Inicio',
            render: (a) => a.fecha_inicio ?? '—',
        },
        {
            label:  'Fecha Fin',
            render: (a) => a.fecha_fin ?? '—',
        },
        {
            label:  'Periodo',
            render: (a) => a.anio,
        },
        {
            label:  'Matriculados',
            render: (a) => (
                <div className="flex items-center justify-center gap-2">
                    <span className="font-semibold text-blue-600">{a.matriculas_count}</span>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
 e.stopPropagation(); openDetail(a); 
}}
                    >
                        <Users className="mr-1 h-3 w-3" />
                        Ver
                    </Button>
                </div>
            ),
        },
        {
            label:  'Estado',
            render: (a) => (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${a.estado === '1' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {a.estado === '1' ? 'Activo' : 'Cerrado'}
                </span>
            ),
        },
    ];

    return (
        <>
            <Head title="Matrículas — Apertura/Cierre" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Apertura / Cierre de Matrícula"
                subtitle={res.rows ? `${res.rows.total} periodos` : '…'}
                icon={ClipboardList}
                iconColor="bg-blue-600"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nuevo Periodo"
                onNew={openCreate}
            >
                {res.rows && (
                    <ResourceTable
                        rows={res.rows}
                        columns={columns}
                        getKey={(a) => a.apertura_id}
                        onEdit={openEdit}
                        onDelete={setDeleting}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>}
            </ResourcePage>

            <AperturaFormModal
                open={modalOpen}
                onClose={() => {
 setModalOpen(false); res.clearSuccess(); 
}}
                editing={editing}
                onSave={editing
                    ? (data: AperturaFormData) => res.update(editing.apertura_id, data)
                    : (data: AperturaFormData) => res.create(data)}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />

            <MatriculasDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                apertura={selected}
                secciones={secciones}
            />

            <ConfirmDeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Eliminar Periodo"
                message={`¿Estás seguro de que deseas eliminar el periodo "${deleting?.nombre}"? Esta acción eliminará permanentemente todas las matrículas asociadas.`}
                processing={res.loading}
            />
        </>
    );
}

