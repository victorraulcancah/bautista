import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Layers } from 'lucide-react';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import type { BreadcrumbItem } from '@/types';
import { useResource } from '@/hooks/useResource';
import NivelFormModal from './components/NivelFormModal';
import { nivelesColumns } from './hooks/useNivelesColumns';
import type { Nivel } from './hooks/useNiveles';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Niveles',   href: '/niveles' },
];

export default function NivelesPage() {
    const res = useResource<Nivel>('/niveles');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState<Nivel | null>(null);

    const openCreate   = () => { setEditing(null); setModalOpen(true); };
    const openEdit     = (n: Nivel) => { setEditing(n); setModalOpen(true); };
    const handleDelete = (n: Nivel) => {
        if (confirm(`¿Eliminar el nivel "${n.nombre_nivel}"?`)) {
            res.remove(n.nivel_id);
        }
    };

    return (
        <>
            <Head title="Niveles" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Niveles"
                subtitle={res.rows ? `${res.rows.total} registrados` : '…'}
                icon={Layers}
                iconColor="bg-green-600"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nuevo Nivel"
                onNew={openCreate}
            >
                {res.rows && (
                    <ResourceTable
                        rows={res.rows}
                        columns={nivelesColumns}
                        getKey={(n) => n.nivel_id}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>}
            </ResourcePage>

            <NivelFormModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); res.clearSuccess(); }}
                editing={editing}
                onSave={editing
                    ? (data) => res.update(editing.nivel_id, data)
                    : (data) => res.create(data)}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />
        </>
    );
}
