import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Newspaper } from 'lucide-react';
import ResourcePage from '@/components/shared/ResourcePage';
import type { BreadcrumbItem } from '@/types';
import { useResource } from '@/hooks/useResource';
import api from '@/lib/api';
import NoticiasTable from './components/NoticiasTable';
import NoticiaFormModal from './components/NoticiaFormModal';
import type { Noticia } from './hooks/useNoticias';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard',   href: '/dashboard' },
    { title: 'Institución', href: '/institucion' },
    { title: 'Noticias',    href: '/institucion/noticias' },
];

export default function NoticiasPage() {
    const res = useResource<Noticia>('/noticias');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState<Noticia | null>(null);

    const openCreate = () => { setEditing(null); setModalOpen(true); };
    const openEdit   = (n: Noticia) => { setEditing(n); setModalOpen(true); };

    // FormData con imágenes requiere POST + _method=PUT para updates
    const handleSave = async (data: FormData): Promise<void> => {
        if (editing) {
            data.append('_method', 'PUT');
            await api.post(`/noticias/${editing.not_id}`, data);
            res.reload();
        } else {
            await res.create(data);
        }
    };

    return (
        <>
            <Head title="Noticias" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Noticias"
                subtitle={res.rows ? `${res.rows.total} publicadas` : '…'}
                icon={Newspaper}
                iconColor="bg-orange-500"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nueva Noticia"
                onNew={openCreate}
            >
                {res.rows && (
                    <NoticiasTable
                        noticias={res.rows}
                        onEdit={openEdit}
                        onDelete={(n) => {
                            if (confirm(`¿Eliminar la noticia "${n.not_titulo}"?`)) {
                                res.remove(n.not_id);
                            }
                        }}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>}
            </ResourcePage>

            <NoticiaFormModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); res.clearSuccess(); }}
                editing={editing}
                onSave={handleSave}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />
        </>
    );
}
