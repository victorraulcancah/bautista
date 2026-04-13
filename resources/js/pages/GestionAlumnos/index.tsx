import { Head } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';
import { useState } from 'react';
import ResourcePage from '@/components/shared/ResourcePage';
import { useResource } from '@/hooks/useResource';
import type { BreadcrumbItem } from '@/types';
import EstudianteFormModal from './components/EstudianteFormModal';
import EstudiantesTable from './components/EstudiantesTable';
import FotocheckModal from '../Shared/components/FotocheckModal';
import type { Estudiante } from './hooks/useEstudiantes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard',   href: '/dashboard' },
    { title: 'Estudiantes', href: '/estudiantes' },
];

export default function EstudiantesPage() {
    const res = useResource<Estudiante>('/estudiantes');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState<Estudiante | null>(null);
    
    // Fotocheck
    const [fotoOpen, setFotoOpen] = useState(false);
    const [selectedEst, setSelectedEst] = useState<Estudiante | null>(null);

    const openCreate = () => {
 setEditing(null); setModalOpen(true); 
};
    const openEdit   = (e: Estudiante) => {
        setEditing(e); setModalOpen(true); 
    };

    const openFotocheck = (e: Estudiante) => {
        setSelectedEst(e);
        setFotoOpen(true);
    };

    return (
        <>
            <Head title="Estudiantes" />
            <ResourcePage
                breadcrumbs={breadcrumbs}
                pageTitle="Estudiantes"
                subtitle={res.rows ? `${res.rows.total} registrados` : '…'}
                icon={GraduationCap}
                iconColor="bg-yellow-500"
                search={res.search}
                onSearch={res.setSearch}
                flashSuccess={res.success}
                btnLabel="Nuevo Estudiante"
                onNew={openCreate}
            >
                {res.rows && (
                    <EstudiantesTable
                        estudiantes={res.rows}
                        onEdit={openEdit}
                        onFotocheck={openFotocheck}
                        onDelete={(e) => {
                            if (confirm(`¿Eliminar a ${e.perfil?.primer_nombre ?? e.user?.username}?`)) {
                                res.remove(e.estu_id);
                            }
                        }}
                        onPageChange={res.setPage}
                    />
                )}
                {res.loading && <p className="py-6 text-center text-sm text-gray-400">Cargando...</p>}
            </ResourcePage>

            <EstudianteFormModal
                open={modalOpen}
                onClose={() => {
 setModalOpen(false); res.clearSuccess(); 
}}
                editing={editing}
                onSave={editing
                    ? (data) => res.update(editing.estu_id, data)
                    : (data) => res.create(data)}
                apiErrors={res.apiErrors}
                clearErrors={res.clearErrors}
            />
            <FotocheckModal
                open={fotoOpen}
                onClose={() => setFotoOpen(false)}
                estudiante={selectedEst}
            />
        </>
    );
}
