import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import type { BreadcrumbItem } from '@/types';
import { useResource } from '@/hooks/useResource';
import { useOptions } from '@/hooks/useOptions';
import CursoFormModal from './components/CursoFormModal';
import { cursosColumns } from './hooks/useCursosColumns';
import type { Curso, NivelOption, GradoOption } from './hooks/useCursos';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cursos',    href: '/cursos' },
];

export default function CursosPage() {
    const res     = useResource<Curso>('/cursos');
    const niveles = useOptions<NivelOption>('/niveles');
    const grados  = useOptions<GradoOption>('/grados');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState<Curso | null>(null);

    const openCreate   = () => { setEditing(null); setModalOpen(true); };
    const openEdit     = (c: Curso) => { setEditing(c); setModalOpen(true); };
    const handleDelete = (c: Curso) => {
        if (confirm(`¿Eliminar el curso "${c.nombre}"?`)) {
            res.remove(c.curso_id);
        }
    };

    return (
        <>
            <Head title="Cursos" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Cursos"
                subtitle={res.rows ? `${res.rows.total} registrados` : '…'}
                icon={BookOpen}
                iconColor="bg-orange-500"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nuevo Curso"
                onNew={openCreate}
            >
                {res.rows && (
                    <ResourceTable
                        rows={res.rows}
                        columns={cursosColumns}
                        getKey={(c) => c.curso_id}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>}
            </ResourcePage>

            <CursoFormModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); res.clearSuccess(); }}
                editing={editing}
                niveles={niveles}
                grados={grados}
                onSave={editing
                    ? (data) => res.update(editing.curso_id, data)
                    : (data) => res.create(data)}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />
        </>
    );
}
