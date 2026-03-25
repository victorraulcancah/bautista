import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import type { BreadcrumbItem } from '@/types';
import { useResource } from '@/hooks/useResource';
import { useOptions } from '@/hooks/useOptions';
import GradoFormModal from './components/GradoFormModal';
import { gradosColumns } from './hooks/useGradosColumns';
import type { Grado, Nivel } from './hooks/useGrados';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Grados',    href: '/grados' },
];

export default function GradosPage() {
    const res     = useResource<Grado>('/grados');
    const niveles = useOptions<Nivel>('/niveles');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState<Grado | null>(null);

    const openCreate   = () => { setEditing(null); setModalOpen(true); };
    const openEdit     = (g: Grado) => { setEditing(g); setModalOpen(true); };
    const handleDelete = (g: Grado) => {
        if (confirm(`¿Eliminar el grado "${g.nombre_grado}"?`)) {
            res.remove(g.grado_id);
        }
    };

    return (
        <>
            <Head title="Grados" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Grados"
                subtitle={res.rows ? `${res.rows.total} registrados` : '…'}
                icon={GraduationCap}
                iconColor="bg-blue-600"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nuevo Grado"
                onNew={openCreate}
            >
                {res.rows && (
                    <ResourceTable
                        rows={res.rows}
                        columns={gradosColumns}
                        getKey={(g) => g.grado_id}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>}
            </ResourcePage>

            <GradoFormModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); res.clearSuccess(); }}
                editing={editing}
                niveles={niveles}
                onSave={editing
                    ? (data) => res.update(editing.grado_id, data)
                    : (data) => res.create(data)}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />
        </>
    );
}
