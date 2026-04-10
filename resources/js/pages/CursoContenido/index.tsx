import { Head } from '@inertiajs/react';
import { BookOpen, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import { usePermission } from '@/hooks/usePermission';
import type { BreadcrumbItem } from '@/types';
import UnidadFormModal from './components/UnidadFormModal';
import UnidadItem from './components/UnidadItem';
import type { Unidad, UnidadFormData } from './hooks/useCursoContenido';

type Props = {
    cursoId: number;
};

export default function CursoContenidoPage({ cursoId }: Props) {
    const { can } = usePermission();
    const [unidades, setUnidades]     = useState<Unidad[]>([]);
    const [loading, setLoading]       = useState(false);
    const [modalOpen, setModalOpen]   = useState(false);
    const [editing, setEditing]       = useState<Unidad | null>(null);
    const [apiErrors, setApiErrors]   = useState<Record<string, string[]>>({});

    const isEditor = can(['cursos.manage', 'cursos.edit']);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Cursos',    href: '/cursos' },
        { title: 'Contenido', href: '#' },
    ];

    const cargar = useCallback(async () => {
        setLoading(true);

        try {
            const { data } = await api.get(`/contenido/cursos/${cursoId}`);
            setUnidades(data);
        } finally {
            setLoading(false);
        }
    }, [cursoId]);

    useEffect(() => {
 cargar(); 
}, [cargar]);

    const handleCreateUnidad = async (data: UnidadFormData) => {
        setApiErrors({});
        await api.post('/contenido/unidades', data);
        await cargar();
    };

    const handleUpdateUnidad = async (data: UnidadFormData) => {
        if (!editing) {
return;
}

        setApiErrors({});
        await api.put(`/contenido/unidades/${editing.unidad_id}`, { ...data, estado: '1' });
        await cargar();
    };

    const handleDeleteUnidad = async (id: number) => {
        if (!confirm('¿Eliminar esta unidad y todas sus clases?')) {
return;
}

        await api.delete(`/contenido/unidades/${id}`);
        await cargar();
    };

    const openEdit = (u: Unidad) => {
 setEditing(u); setModalOpen(true); 
};
    const openCreate = () => {
 setEditing(null); setModalOpen(true); 
};

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contenido del Curso" />

            <div className="mx-auto max-w-3xl px-4 py-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Contenido del Curso</h1>
                            <p className="text-sm text-gray-500">
                                {unidades.length} unidad{unidades.length !== 1 ? 'es' : ''} ·{' '}
                                {unidades.reduce((acc, u) => acc + u.clases.length, 0)} clases
                            </p>
                        </div>
                    </div>
                    <Button onClick={openCreate} className="bg-[#00a65a] hover:bg-[#008d4c] text-white">
                        <Plus className="mr-2 h-4 w-4" /> Nueva Unidad
                    </Button>
                </div>

                {/* Contenido */}
                {loading && <p className="py-10 text-center text-sm text-gray-400">Cargando...</p>}

                {!loading && unidades.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
                        <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                        <p className="text-sm text-gray-400">Este curso no tiene unidades aún.</p>
                        <Button onClick={openCreate} variant="outline" className="mt-4 text-sm">
                            Crear primera unidad
                        </Button>
                    </div>
                )}

                {!loading && unidades.length > 0 && (
                    <div className="space-y-4">
                        {unidades.map((unidad) => (
                            <UnidadItem
                                key={unidad.unidad_id}
                                unidad={unidad}
                                onEdit={openEdit}
                                onDelete={handleDeleteUnidad}
                                onReload={cargar}
                            />
                        ))}
                    </div>
                )}
            </div>

            <UnidadFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                cursoId={cursoId}
                editing={editing}
                onSave={editing ? handleUpdateUnidad : handleCreateUnidad}
                apiErrors={apiErrors}
                clearErrors={() => setApiErrors({})}
            />
        </AppLayout>
    );
}
