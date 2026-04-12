import { Head, Link } from '@inertiajs/react';
import { BookOpen, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import ResourceDetailLayout from './components/ResourceDetailLayout';

interface Props {
    claseId: string;
}

export default function DetalleClasePage({ claseId }: Props) {
    const [clase, setClase] = useState<any>(null);
    const [archivos, setArchivos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel Docente', href: '/docente/dashboard' },
        { title: 'Mis Cursos', href: '/docente/mis-cursos' },
        { title: clase?.nombre || 'Detalle Clase', href: '#' },
    ];

    useEffect(() => {
        cargarDatos();
    }, [claseId]);

    const cargarDatos = () => {
        setLoading(true);
        Promise.all([
            api.get(`/docente/clases/${claseId}`),
            api.get(`/docente/clases/${claseId}/archivos`)
        ])
            .then(([resClase, resArchivos]) => {
                setClase(resClase.data);
                setArchivos(resArchivos.data);
            })
            .finally(() => setLoading(false));
    };

    const handleSaveDescription = async (descripcion: string) => {
        await api.put(`/docente/clases/${claseId}/descripcion`, { descripcion });
        cargarDatos();
    };

    const handleFileUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/docente/clases/${claseId}/archivos`, formData);
        cargarDatos();
    };

    const handleFileDelete = async (archivoId: number) => {
        await api.delete(`/docente/clases/archivos/${archivoId}`);
        cargarDatos();
    };

    if (loading && !clase) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                        <p className="font-black text-xs uppercase tracking-widest text-gray-400 animate-pulse">Sincronizando Sesión...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <ResourceDetailLayout
            title={clase?.nombre}
            subtitle={clase?.curso_nombre || "Sesión de Aprendizaje"}
            backUrl={`/docente/curso/${clase?.docen_curso_id}/contenido`}
            breadcrumbs={breadcrumbs}
            description={clase?.descripcion_larga || ''}
            files={archivos}
            icon={BookOpen}
            metadata={[
                { label: 'Fecha Programada', value: clase?.fecha_inicio || '--/--/----' },
                { 
                    label: 'Visibilidad', 
                    value: clase?.visible ? 'Publicado' : 'Borrador',
                    type: 'status',
                    statusVariant: clase?.visible ? 'success' : 'error'
                }
            ]}
            actions={
                <>
                    <Link href={`/docente/clases/${claseId}/actividades/nueva`}>
                        <Button
                            className="w-full h-14 rounded-2xl bg-white text-emerald-600 hover:bg-emerald-50 font-black uppercase text-[10px] tracking-widest shadow-lg"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Crear Actividad
                        </Button>
                    </Link>
                    <p className="text-center text-[10px] font-black text-white/50 uppercase tracking-wider mt-4">
                        Añade tareas o exámenes a esta sesión
                    </p>
                </>
            }
            onSaveDescription={handleSaveDescription}
            onFileUpload={handleFileUpload}
            onFileDelete={handleFileDelete}
        />
    );
}
