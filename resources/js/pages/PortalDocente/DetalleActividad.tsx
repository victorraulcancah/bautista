import { Head, Link } from '@inertiajs/react';
import { BookOpen, Settings, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import ResourceDetailLayout from './components/ResourceDetailLayout';

interface Props {
    actividadId: string;
}

export default function DetalleActividadPage({ actividadId }: Props) {
    const [actividad, setActividad] = useState<any>(null);
    const [archivos, setArchivos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel Docente', href: '/docente/dashboard' },
        { title: 'Mis Cursos', href: '/docente/mis-cursos' },
        { title: actividad?.nombre || 'Detalle Actividad', href: '#' },
    ];

    useEffect(() => {
        cargarDatos();
    }, [actividadId]);

    const cargarDatos = () => {
        setLoading(true);
        Promise.all([
            api.get(`/docente/actividades/${actividadId}`),
            api.get(`/docente/actividades/${actividadId}/archivos`)
        ])
            .then(([resActividad, resArchivos]) => {
                setActividad(resActividad.data);
                setArchivos(resArchivos.data);
            })
            .finally(() => setLoading(false));
    };

    const handleSaveDescription = async (descripcion: string) => {
        await api.put(`/docente/actividades/${actividadId}`, { descripcion_larga: descripcion });
        cargarDatos();
    };

    const handleFileUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/docente/actividades/${actividadId}/archivos`, formData);
        cargarDatos();
    };

    const handleFileDelete = async (archivoId: number) => {
        // Assume an endpoint exists or handle it specifically if needed. 
        // Based on DetalleClase, a shared archive delete might exist.
        await api.delete(`/docente/actividades/archivos/${archivoId}`);
        cargarDatos();
    };

    if (loading && !actividad) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-[80vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                        <p className="font-black text-xs uppercase tracking-widest text-gray-400 animate-pulse">Sincronizando Actividad...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <ResourceDetailLayout
            title={actividad?.nombre}
            subtitle={actividad?.tipo_actividad || "Actividad de Aprendizaje"}
            backUrl={`/docente/curso/${actividad?.docen_curso_id}/contenido`}
            breadcrumbs={breadcrumbs}
            description={actividad?.descripcion_larga || ''}
            files={archivos}
            icon={BookOpen}
            metadata={[
                { label: 'Cronograma de Inicio', value: actividad?.fecha_inicio || '--/--/----' },
                { label: 'Límite de Entrega', value: actividad?.fecha_termino || '--/--/----' },
                { 
                    label: 'Peso Académico', 
                    value: 'Variable según configuración',
                    type: 'default'
                }
            ]}
            actions={
                <div className="space-y-4">
                    {actividad?.tipo_id === 2 ? (
                        <>
                            <Link href={`/docente/actividades/${actividadId}/cuestionario`}>
                                <Button
                                    className="w-full h-14 rounded-2xl bg-white text-emerald-600 hover:bg-emerald-50 font-black uppercase text-[10px] tracking-widest shadow-lg"
                                >
                                    <Settings className="w-4 h-4 mr-2" /> Diseñar Examen
                                </Button>
                            </Link>
                            <Link href={`/docente/actividades/${actividadId}/calificar-examen`}>
                                <Button
                                    className="w-full h-14 rounded-2xl bg-emerald-500/20 text-white border border-white/20 hover:bg-emerald-500/40 font-black uppercase text-[10px] tracking-widest"
                                >
                                    <Eye className="w-4 h-4 mr-2" /> Calificar Entregas
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <Link href={`/docente/actividades/${actividadId}/calificar`}>
                            <Button
                                className="w-full h-14 rounded-2xl bg-white text-emerald-600 hover:bg-emerald-50 font-black uppercase text-[10px] tracking-widest shadow-lg"
                            >
                                <Eye className="w-4 h-4 mr-2" /> Revisar y Calificar
                            </Button>
                        </Link>
                    )}
                </div>
            }
            onSaveDescription={handleSaveDescription}
            onFileUpload={handleFileUpload}
            onFileDelete={handleFileDelete}
        />
    );
}
