import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Building2 } from 'lucide-react';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import type { BreadcrumbItem } from '@/types';
import { useResource } from '@/hooks/useResource';
import InstitucionFormModal from './components/InstitucionFormModal';
import { institucionColumns } from './hooks/useInstitucionColumns';
import type { Institucion } from './hooks/useInstitucion';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard',   href: '/dashboard' },
    { title: 'Institución', href: '/institucion' },
];

export default function InstitucionPage() {
    const res = useResource<Institucion>('/instituciones');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState<Institucion | null>(null);
    const [deleting, setDeleting]   = useState<Institucion | null>(null);

    const openCreate   = () => { setEditing(null); setModalOpen(true); };
    const openEdit     = (i: Institucion) => { setEditing(i); setModalOpen(true); };
    
    const handleDelete = async () => {
        if (!deleting) return;
        await res.remove(deleting.insti_id);
        setDeleting(null);
    };

    return (
        <>
            <Head title="Institución" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Instituciones"
                subtitle={res.rows ? `${res.rows.total} registradas` : '…'}
                icon={Building2}
                iconColor="bg-cyan-500"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nueva Institución"
                onNew={openCreate}
            >
                {res.rows && (
                    <ResourceTable
                        rows={res.rows}
                        columns={institucionColumns}
                        getKey={(i) => i.insti_id}
                        onEdit={openEdit}
                        onDelete={setDeleting}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>}
            </ResourcePage>

            <InstitucionFormModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); res.clearSuccess(); }}
                editing={editing}
                onSave={editing
                    ? (data) => res.update(editing.insti_id, data)
                    : (data) => res.create(data)}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />

            <ConfirmDeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Eliminar Institución"
                message={`¿Estás seguro de que deseas eliminar la institución "${deleting?.insti_razon_social}"? Esta acción no se puede deshacer.`}
                processing={res.loading}
            />
        </>
    );
}

