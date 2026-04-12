import { Head } from '@inertiajs/react';
import { CalendarDays, LayoutList } from 'lucide-react';
import { useState } from 'react';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import { Button } from '@/components/ui/button';
import { useOptions } from '@/hooks/useOptions';
import { useResource } from '@/hooks/useResource';
import type { BreadcrumbItem } from '@/types';
import SeccionFormModal from './components/SeccionFormModal';
import type { Seccion, GradoOption } from './hooks/useSecciones';
import { seccionesColumns } from './hooks/useSeccionesColumns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Secciones', href: '/secciones' },
];

export default function SeccionesPage() {
    const res    = useResource<Seccion>('/secciones');
    const grados = useOptions<GradoOption>('/grados');
    const [modalOpen, setModalOpen]         = useState(false);
    const [editing, setEditing]             = useState<Seccion | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        open: boolean;
        seccion: Seccion | null;
        processing: boolean;
    }>({ open: false, seccion: null, processing: false });

    const openCreate   = () => { setEditing(null); setModalOpen(true); };
    const openEdit     = (s: Seccion) => { setEditing(s); setModalOpen(true); };
    const handleDelete = (s: Seccion) => {
        setDeleteModal({ open: true, seccion: s, processing: false });
    };

    const confirmDelete = async () => {
        if (!deleteModal.seccion) return;
        setDeleteModal(prev => ({ ...prev, processing: true }));
        await res.remove(deleteModal.seccion.seccion_id);
        setDeleteModal({ open: false, seccion: null, processing: false });
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
                        extraActions={(s) => (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 text-blue-500 hover:bg-blue-50"
                                title="Horarios"
                                onClick={() => window.location.href = `/secciones/${s.seccion_id}/horarios`}
                            >
                                <CalendarDays className="size-3.5" />
                            </Button>
                        )}
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

            <ConfirmDeleteModal
                open={deleteModal.open}
                title="Eliminar Sección"
                message={`¿Estás seguro de que deseas eliminar la sección "${deleteModal.seccion?.nombre}"? Esta acción no se puede deshacer.`}
                processing={deleteModal.processing}
                onClose={() => setDeleteModal({ open: false, seccion: null, processing: false })}
                onConfirm={confirmDelete}
            />
        </>
    );
}
