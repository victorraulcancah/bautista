import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { useState } from 'react';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import { useResource } from '@/hooks/useResource';
import type { BreadcrumbItem } from '@/types';
import UsuarioFormModal from './components/UsuarioFormModal';
import type { Usuario } from './hooks/useUsuarios';
import { usuariosColumns } from './hooks/useUsuariosColumns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Usuarios',  href: '/usuarios' },
];

export default function UsuariosPage() {
    const res = useResource<Usuario>('/usuarios');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState<Usuario | null>(null);

    const openCreate = () => {
 setEditing(null); setModalOpen(true); 
};
    const openEdit   = (u: Usuario) => {
 setEditing(u); setModalOpen(true); 
};

    return (
        <>
            <Head title="Usuarios" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Usuarios"
                subtitle={res.rows ? `${res.rows.total} registrados` : '…'}
                icon={Users}
                iconColor="bg-indigo-600"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nuevo Usuario"
                onNew={openCreate}
            >
                {res.rows && (
                    <ResourceTable
                        rows={res.rows}
                        columns={usuariosColumns}
                        getKey={(u) => u.id}
                        onEdit={openEdit}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>}
            </ResourcePage>

            <UsuarioFormModal
                open={modalOpen}
                onClose={() => {
 setModalOpen(false); res.clearSuccess(); 
}}
                editing={editing}
                onSave={editing
                    ? (data) => res.update(editing.id, data)
                    : (data) => res.create(data)}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />
        </>
    );
}
