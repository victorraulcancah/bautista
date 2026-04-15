import { Head } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import ResourcePage from '@/components/shared/ResourcePage';
import ResourceTable from '@/components/shared/ResourceTable';
import type { BreadcrumbItem } from '@/types';
import ActividadFormModal from './components/ActividadFormModal';
import CuestionarioDrawer from './components/CuestionarioDrawer';
import { buildColumns } from './components/ExamenesColumns';
import { useExamenesPage } from './hooks/useExamenesPage';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Exámenes', href: '/examenes' },
];

export default function ExamenesPage({ cursoId }: { cursoId?: number }) {
    const {
        res,
        modalOpen, editing, openCreate, openEdit, closeModal, handleSave,
        drawerOpen, selected, openDrawer, closeDrawer,
    } = useExamenesPage(cursoId);

    const columns = buildColumns(openEdit, openDrawer);

    return (
        <>
            <Head title="Exámenes Virtuales" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Exámenes Virtuales"
                subtitle={res.rows ? `${res.rows.total} actividades` : '…'}
                icon={BookOpen}
                iconColor="bg-purple-600"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nueva Actividad"
                onNew={openCreate}
            >
                {res.loading && (
                    <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>
                )}
                {res.rows && (
                    <ResourceTable
                        rows={res.rows}
                        columns={columns}
                        getKey={(a) => a.actividad_id}
                        onPageChange={res.setPage}
                    />
                )}
            </ResourcePage>

            <ActividadFormModal
                open={modalOpen}
                onClose={closeModal}
                editing={editing}
                onSave={handleSave}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />

            <CuestionarioDrawer
                open={drawerOpen}
                onClose={closeDrawer}
                actividad={selected}
            />
        </>
    );
}
