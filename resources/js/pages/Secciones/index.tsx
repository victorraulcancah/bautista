import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { LayoutList } from 'lucide-react';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import type { BreadcrumbItem } from '@/types';
import { useResource } from '@/hooks/useResource';
import { useOptions } from '@/hooks/useOptions';
import SeccionFormModal from './components/SeccionFormModal';
import { seccionesColumns } from './hooks/useSeccionesColumns';
import type { Seccion, GradoOption } from './hooks/useSecciones';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Secciones', href: '/secciones' },
];

export default function SeccionesPage() {
    const res    = useResource<Seccion>('/secciones');
    const grados = useOptions<GradoOption>('/grados');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState<Seccion | null>(null);

    const openCreate   = () => { setEditing(null); setModalOpen(true); };
    const openEdit     = (s: Seccion) => { setEditing(s); setModalOpen(true); };
    const handleDelete = (s: Seccion) => {
        if (confirm(`¿Eliminar la sección "${s.nombre}"?`)) {
            res.remove(s.seccion_id);
        }
    };

    return (
        <>
            <Head title="Secciones" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Secciones"
                subtitle={res.rows ? `${res.rows.total} registradas` : '…'}
                icon={LayoutList}
                iconColor="bg-purple-600"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nueva Sección"
                onNew={openCreate}
            >
                {res.rows && (
                    <ResourceTable
                        rows={res.rows}
                        columns={seccionesColumns}
                        getKey={(s) => s.seccion_id}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>}
            </ResourcePage>

            <SeccionFormModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); res.clearSuccess(); }}
                editing={editing}
                grados={grados}
                onSave={editing
                    ? (data) => res.update(editing.seccion_id, data)
                    : (data) => res.create(data)}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />
        </>
    );
}
