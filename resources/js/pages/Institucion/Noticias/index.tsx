import { Head, Link } from '@inertiajs/react';
import { Newspaper, LayoutGrid, Eye } from 'lucide-react';
import { useState } from 'react';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import ResourcePage from '@/components/shared/ResourcePage';
import { Button } from '@/components/ui/button';
import { useResource } from '@/hooks/useResource';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import NoticiaFormModal from './components/NoticiaFormModal';
import NoticiasTable from './components/NoticiasTable';
import type { Noticia } from './hooks/useNoticias';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Institución', href: '/institucion' },
    { title: 'Noticias', href: '/institucion/noticias' },
];

export default function NoticiasPage() {
    const res = useResource<Noticia>('/noticias');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Noticia | null>(null);
    const [deleting, setDeleting] = useState<Noticia | null>(null);
    const [noticiaView, setNoticiaView] = useState<Noticia | null>(null);

    const openCreate = () => {
 setEditing(null); setModalOpen(true); 
};
    const openEdit = (n: Noticia) => {
 setEditing(n); setModalOpen(true); 
};

    const handleSave = async (data: FormData): Promise<void> => {
        if (editing) {
            data.append('_method', 'PUT');
            await api.post(`/noticias/${editing.not_id}`, data);
            res.reload();
        } else {
            await res.create(data);
        }
    };

    const handleDelete = async () => {
        if (!deleting) {
return;
}

        await res.remove(deleting.not_id);
        setDeleting(null);
    };

    return (
        <>
            <Head title="Gestión de Noticias" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Gestión de Noticias"
                subtitle={res.rows ? `${res.rows.total} crónicas redactadas` : '…'}
                icon={Newspaper}
                iconColor="bg-[#00a65a]"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nueva Crónica"
                onNew={openCreate}
            >
                <div className="flex flex-col gap-6">
                    {/* Acciones Rápidas */}
                    <div className="flex justify-end">
                        <Link href="/institucion/noticias/portada">
                            <Button variant="outline" className="gap-2 border-black hover:bg-black hover:text-white rounded-xl transition-all shadow-sm">
                                <LayoutGrid className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Ir a Portada (Vista Periódico)</span>
                            </Button>
                        </Link>
                    </div>

                    {res.rows && (
                        <NoticiasTable
                            noticias={res.rows}
                            onEdit={openEdit}
                            onDelete={setDeleting}
                            onView={setNoticiaView}
                            onPageChange={res.setPage}
                        />
                    )}
                </div>
                {res.loading && <p className="py-6 text-center text-sm text-neutral-400 font-medium">Consultando archivos de prensa...</p>}
            </ResourcePage>


            <NoticiaFormModal
                open={modalOpen}
                onClose={() => {
 setModalOpen(false); res.clearSuccess(); 
}}
                editing={editing}
                onSave={handleSave}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />

            <ConfirmDeleteModal
                open={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Eliminar Crónica"
                message={`¿Estás seguro de que deseas eliminar la noticia "${deleting?.not_titulo}"? Esta acción no se puede deshacer.`}
                processing={res.loading}
            />
        </>
    );
}


