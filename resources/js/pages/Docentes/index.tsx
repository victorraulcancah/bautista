import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { UserCheck } from 'lucide-react';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import type { BreadcrumbItem } from '@/types';
import { useResource } from '@/hooks/useResource';
import DocenteFormModal from './components/DocenteFormModal';
import { docentesColumns } from './hooks/useDocentesColumns';
import type { Docente } from './hooks/useDocentes';
import { nombreCompleto } from './hooks/useDocentes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard',  href: '/dashboard' },
    { title: 'Profesores', href: '/docentes' },
];

export default function DocentesPage() {
    const res = useResource<Docente>('/docentes');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState<Docente | null>(null);

    const openCreate   = () => { setEditing(null); setModalOpen(true); };
    const openEdit     = (d: Docente) => { setEditing(d); setModalOpen(true); };
    const handleDelete = (d: Docente) => {
        if (confirm(`¿Eliminar al docente "${nombreCompleto(d)}"?`)) {
            res.remove(d.docente_id);
        }
    };

    return (
        <>
            <Head title="Profesores" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Profesores"
                subtitle={res.rows ? `${res.rows.total} registrados` : '…'}
                icon={UserCheck}
                iconColor="bg-teal-600"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nuevo Docente"
                onNew={openCreate}
            >
                {res.rows && (
                    <ResourceTable
                        rows={res.rows}
                        columns={docentesColumns}
                        getKey={(d) => d.docente_id}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>}
            </ResourcePage>

            <DocenteFormModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); res.clearSuccess(); }}
                editing={editing}
                onSave={editing
                    ? (data) => res.update(editing.docente_id, data)
                    : (data) => res.create(data)}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />
        </>
    );
}
