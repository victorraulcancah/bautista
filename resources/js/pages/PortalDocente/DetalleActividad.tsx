import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, FileText, Upload, Save, Settings, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

interface Props {
    actividadId: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel Docente', href: '/docente/dashboard' },
    { title: 'Mis Cursos', href: '/docente/mis-cursos' },
    { title: 'Detalle Actividad', href: '#' },
];

export default function DetalleActividadPage({ actividadId }: Props) {
    const [actividad, setActividad] = useState<any>(null);
    const [archivos, setArchivos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [descripcion, setDescripcion] = useState('');
    const [editandoDescripcion, setEditandoDescripcion] = useState(false);

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
                setDescripcion(resActividad.data.descripcion_larga || '');
                setArchivos(resArchivos.data);
            })
            .finally(() => setLoading(false));
    };

    const guardarDescripcion = () => {
        api.put(`/docente/actividades/${actividadId}/descripcion`, { descripcion })
            .then(() => {
                setEditandoDescripcion(false);
            });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        api.post(`/docente/actividades/${actividadId}/archivos`, formData)
            .then(() => cargarDatos());
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="p-10 text-center font-black animate-pulse text-indigo-600">
                    Cargando actividad...
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Actividad: ${actividad?.nombre}`} />

            <div className="min-h-screen bg-[#FDFDFF] p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                            {actividad?.nombre}
                        </h1>
                        <p className="text-gray-500 font-medium italic mt-2">
                            {actividad?.tipo_actividad}
                        </p>
                    </div>
                    <Link href={`/docente/cursos/${actividad?.curso_id}/contenido`}>
                        <Button variant="outline" className="rounded-2xl">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black text-gray-900">Descripción</h3>
                                {!editandoDescripcion ? (
                                    <Button
                                        onClick={() => setEditandoDescripcion(true)}
                                        variant="outline"
                                        className="rounded-2xl"
                                    >
                                        Editar
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={guardarDescripcion}
                                        className="rounded-2xl bg-indigo-600"
                                    >
                                        <Save className="w-4 h-4 mr-2" /> Guardar
                                    </Button>
                                )}
                            </div>

                            {editandoDescripcion ? (
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    className="w-full h-64 p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Descripción de la actividad..."
                                />
                            ) : (
                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: descripcion || 'Sin descripción' }}
                                />
                            )}
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black text-gray-900">Archivos del Docente</h3>
                                <label htmlFor="file-upload">
                                    <Button variant="outline" className="rounded-2xl" asChild>
                                        <span>
                                            <Upload className="w-4 h-4 mr-2" /> Agregar
                                        </span>
                                    </Button>
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </div>

                            <div className="space-y-3">
                                {archivos.length === 0 ? (
                                    <p className="text-gray-400 italic text-center py-8">
                                        No hay archivos adjuntos
                                    </p>
                                ) : (
                                    archivos.map((archivo) => (
                                        <div
                                            key={archivo.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <FileText className="w-5 h-5 text-indigo-600" />
                                                <span className="font-medium text-gray-700">
                                                    {archivo.nombre}
                                                </span>
                                            </div>
                                            <a
                                                href={archivo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-700 font-bold text-sm"
                                            >
                                                Ver
                                            </a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-[3rem] text-white shadow-xl">
                            <h3 className="text-2xl font-black mb-6">Acciones</h3>
                            <div className="space-y-4">
                                {actividad?.tipo_id === 2 ? (
                                    <>
                                        <Link href={`/docente/actividades/${actividadId}/cuestionario`}>
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-2xl bg-white text-indigo-600 hover:bg-gray-50"
                                            >
                                                <Settings className="w-4 h-4 mr-2" /> Construir Examen
                                            </Button>
                                        </Link>
                                        <Link href={`/docente/actividades/${actividadId}/calificar-examen`}>
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-2xl bg-white text-indigo-600 hover:bg-gray-50"
                                            >
                                                <Eye className="w-4 h-4 mr-2" /> Calificar Examen
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <Link href={`/docente/actividades/${actividadId}/calificar`}>
                                        <Button
                                            variant="outline"
                                            className="w-full rounded-2xl bg-white text-indigo-600 hover:bg-gray-50"
                                        >
                                            <Eye className="w-4 h-4 mr-2" /> Ir a Calificar
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-lg">
                            <h4 className="font-black text-gray-700 mb-4">Información</h4>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Tipo:</span>
                                    <span className="ml-2 font-bold text-gray-900">
                                        {actividad?.tipo_actividad}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Fecha Inicio:</span>
                                    <span className="ml-2 font-bold text-gray-900">
                                        {actividad?.fecha_inicio}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Fecha Término:</span>
                                    <span className="ml-2 font-bold text-gray-900">
                                        {actividad?.fecha_termino}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
