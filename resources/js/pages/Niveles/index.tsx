import { Head, Link } from '@inertiajs/react';
import { Layers, GraduationCap, BookOpen } from 'lucide-react';
import { useState } from 'react';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import { Button } from '@/components/ui/button';
import { useOptions } from '@/hooks/useOptions';
import { useResource } from '@/hooks/useResource';
import type { BreadcrumbItem } from '@/types';
import NivelFormModal from './components/NivelFormModal';
import type { Nivel } from './hooks/useNiveles';
import { nivelesColumns } from './hooks/useNivelesColumns';

type Institucion = {
    insti_id: number;
    insti_razon_social: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Niveles',   href: '/niveles' },
];

export default function NivelesPage() {
    const res = useResource<Nivel>('/niveles');
    const instituciones = useOptions<Institucion>('/instituciones');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState<Nivel | null>(null);

    const openCreate   = () => {
 setEditing(null); setModalOpen(true); 
};
    const openEdit     = (n: Nivel) => {
 setEditing(n); setModalOpen(true); 
};
    const handleDelete = (n: Nivel) => {
        if (confirm(`¿Eliminar el nivel "${n.nombre_nivel}"?`)) {
            res.remove(n.nivel_id);
        }
    };

    const extraActions = (n: Nivel) => (
        <>
            <Link href={`/grados?nivel_id=${n.nivel_id}`}>
                <Button 
                    size="icon" 
                    variant="ghost" 
                    className="size-7 text-blue-600 hover:bg-blue-50"
                    title="Gestionar Grados"
                >
                    <GraduationCap className="size-3.5" />
                </Button>
            </Link>
            <Link href={`/cursos?nivel_id=${n.nivel_id}`}>
                <Button 
                    size="icon" 
                    variant="ghost" 
                    className="size-7 text-red-600 hover:bg-red-50"
                    title="Gestionar Cursos"
                >
                    <BookOpen className="size-3.5" />
                </Button>
            </Link>
        </>
    );

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
                        extraActions={extraActions}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>}
            </ResourcePage>

            <NivelFormModal
                open={modalOpen}
                onClose={() => {
 setModalOpen(false); res.clearSuccess(); 
}}
                editing={editing}
                instituciones={instituciones}
                onSave={editing
                    ? (data) => res.update(editing.nivel_id, data)
                    : (data) => res.create(data)}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />
        </>
    );
}
