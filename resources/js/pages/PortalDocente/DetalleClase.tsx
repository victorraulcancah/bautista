import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Upload, Save, Plus, Info, BookOpen, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';

interface Props {
    claseId: string;
}

export default function DetalleClasePage({ claseId }: Props) {
    const [clase, setClase] = useState<any>(null);
    const [archivos, setArchivos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [descripcion, setDescripcion] = useState('');
    const [editandoDescripcion, setEditandoDescripcion] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // State for deletion
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [archivoToDelete, setArchivoToDelete] = useState<any>(null);

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
                setDescripcion(resClase.data.descripcion_larga || '');
                setArchivos(resArchivos.data);
            })
            .finally(() => setLoading(false));
    };

    const guardarDescripcion = () => {
        setSaving(true);
        api.put(`/docente/clases/${claseId}/descripcion`, { descripcion })
            .then(() => {
                setEditandoDescripcion(false);
            })
            .finally(() => setSaving(false));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setSaving(true);
        api.post(`/docente/clases/${claseId}/archivos`, formData)
            .then(() => cargarDatos())
            .finally(() => setSaving(false));
    };

    const confirmDelete = (archivo: any) => {
        setArchivoToDelete(archivo);
        setDeleteModalOpen(true);
    };

    const eliminarArchivo = () => {
        if (!archivoToDelete) return;
        
        api.delete(`/docente/clases/archivos/${archivoToDelete.id}`)
            .then(() => {
                cargarDatos();
                setDeleteModalOpen(false);
            });
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Clase: ${clase?.nombre}`} />

            <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <PageHeader 
                        icon={BookOpen} 
                        title={clase?.nombre} 
                        subtitle={clase?.curso_nombre || "Sesión de Aprendizaje"}
                        iconColor="bg-emerald-600"
                    />
                    <Link href={`/docente/curso/${clase?.docen_curso_id}/contenido`}>
                        <Button variant="ghost" className="rounded-2xl font-bold bg-white shadow-sm border-none hover:bg-gray-50 uppercase text-[10px] tracking-widest h-11 px-6">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Curso
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Descripción Card */}
                        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                            <div className="flex items-center justify-between p-10 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Info size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Recursos & Guía de Clase</h3>
                                </div>
                                {!editandoDescripcion ? (
                                    <Button
                                        onClick={() => setEditandoDescripcion(true)}
                                        variant="outline"
                                        className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-10 border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                                    >
                                        Editar Guía
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setEditandoDescripcion(false)}
                                            className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4 h-10"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={guardarDescripcion}
                                            disabled={saving}
                                            className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-10 bg-emerald-600 shadow-lg shadow-emerald-100"
                                        >
                                            {saving ? 'Guardando...' : 'Guardar'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="px-10 pb-10">
                                {editandoDescripcion ? (
                                    <Textarea
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        className="min-h-[300px] w-full p-6 border-none bg-gray-50 rounded-[2rem] focus:ring-4 focus:ring-emerald-100 transition-all text-sm font-bold text-gray-700 resize-none outline-none"
                                        placeholder="Escribe la descripción de lo que se tratará en esta clase..."
                                    />
                                ) : (
                                    <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100/50 min-h-[100px]">
                                        {descripcion ? (
                                            <div
                                                className="prose prose-indigo max-w-none text-sm font-bold text-gray-600 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: descripcion }}
                                            />
                                        ) : (
                                            <p className="text-gray-400 italic font-bold text-sm text-center py-10">No se ha redactado una guía para esta sesión.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Archivos Card */}
                        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                            <div className="flex items-center justify-between p-10 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <FileText size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Material de Apoyo</h3>
                                </div>
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <div className="flex items-center gap-2 rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-10 bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                                        <Upload size={14} /> Adjuntar
                                    </div>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            </div>

                            <div className="px-10 pb-10 space-y-3">
                                {archivos.length === 0 ? (
                                    <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2rem] text-center">
                                        <p className="text-gray-400 italic font-bold text-sm uppercase tracking-widest">Sin recursos adjuntos</p>
                                    </div>
                                ) : (
                                    archivos.map((archivo) => (
                                        <div
                                            key={archivo.id}
                                            className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-emerald-50/50 transition-all group border border-transparent hover:border-emerald-100"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="size-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm transition-transform group-hover:scale-110">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{archivo.nombre}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Material de Clase</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <a
                                                    href={archivo.url || `/storage/${archivo.path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-xl font-black uppercase text-[9px] tracking-widest h-9 px-5 bg-white shadow-sm border border-gray-100 inline-flex items-center hover:bg-emerald-600 hover:text-white transition-all shadow-emerald-100"
                                                >
                                                    Ver
                                                </a>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => confirmDelete(archivo)}
                                                    className="size-9 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {/* Acciones Rápidas */}
                        <Card className="bg-emerald-600 p-10 rounded-[3rem] text-white shadow-xl shadow-emerald-200 relative overflow-hidden group border-none">
                            <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                                <Plus size={120} />
                            </div>
                            
                            <h3 className="text-2xl font-black mb-6 tracking-tight relative">Nuevas Metas</h3>
                            <div className="space-y-4 relative">
                                <Link href={`/docente/clases/${claseId}/actividades/nueva`}>
                                    <Button
                                        className="w-full h-14 rounded-2xl bg-white text-emerald-600 hover:bg-emerald-50 font-black uppercase text-[10px] tracking-widest shadow-lg"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Crear Actividad
                                    </Button>
                                </Link>
                                <p className="text-center text-[10px] font-black text-white/50 uppercase tracking-wider">
                                    Añade tareas o exámenes a esta sesión
                                </p>
                            </div>
                        </Card>

                        {/* Metadata Card */}
                        <Card className="bg-white p-8 rounded-[2.5rem] border-none shadow-sm space-y-6">
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                                <span className="size-2 rounded-full bg-emerald-600" /> Detalle de Programación
                            </h4>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Fecha Programada</span>
                                    <span className="font-bold text-gray-900 flex items-center gap-2">
                                        <Info size={14} className="text-emerald-600" /> {clase?.fecha_inicio || '--/--/----'}
                                    </span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Visibilidad</span>
                                    <span className={`font-black uppercase text-[11px] flex items-center gap-2 ${clase?.visible ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        <div className={`size-2 rounded-full ${clase?.visible ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        {clase?.visible ? 'Publicado' : 'Borrador'}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <ConfirmDeleteModal 
                open={deleteModalOpen} 
                onClose={() => setDeleteModalOpen(false)} 
                onConfirm={eliminarArchivo} 
                title="Eliminar Recurso"
                message={`¿Estás seguro de que deseas eliminar el archivo "${archivoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
            />
        </AppLayout>
    );
}
