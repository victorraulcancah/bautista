import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, FileText, Download, Upload, PlayCircle, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import api from '@/lib/api';

export default function ClaseVer({ claseId }: { claseId: number }) {
    const [clase, setClase] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<number | null>(null);

    useEffect(() => {
        api.get(`/alumno/clase/${claseId}`)
            .then(res => setClase(res.data))
            .finally(() => setLoading(false));
    }, [claseId]);

    const handleUpload = (actividadId: number) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e: any) => {
            const file = e.target.files[0];

            if (!file) {
return;
}

            const formData = new FormData();
            formData.append('archivo', file);

            setSubmitting(actividadId);
            api.post(`/alumno/actividad/${actividadId}/entregar`, formData)
                .then(() => {
                    alert('¡Actividad entregada con éxito!');
                    // Optionally refresh or show checkmark
                })
                .catch(err => alert('Error al subir archivo: ' + err.response?.data?.message))
                .finally(() => setSubmitting(null));
        };
        input.click();
    };

    if (loading) {
return <div className="p-10 text-center font-black animate-pulse text-indigo-600">Preparando el aula virtual...</div>;
}

    return (
        <AppSidebarLayout>
            <div className="min-h-screen bg-[#FDFDFF] p-4 md:p-10 space-y-10 font-sans">
            <Head title={clase.titulo} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                    <Link href={`/alumno/cursos/${clase.unidad?.curso_id}`}>
                        <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 p-0">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{clase.unidad?.titulo}</p>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{clase.titulo}</h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Main Content: Info & Materials */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-8">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">Descripción de la Sesión</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">
                                {clase.descripcion || 'En esta clase exploraremos los conceptos fundamentales de la unidad. Revisa los materiales adjuntos antes de realizar las actividades.'}
                            </p>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-gray-50">
                            <h4 className="text-lg font-black text-gray-800 flex items-center">
                                <FileText className="w-5 h-5 mr-3 text-indigo-600" /> Materiales de Clase
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {clase.archivos.length === 0 ? (
                                    <p className="text-sm italic text-gray-400">No hay archivos adjuntos para esta clase.</p>
                                ) : (
                                    clase.archivos.map((archivo: any) => (
                                        <a key={archivo.archivo_id} href={archivo.url} target="_blank" className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all group">
                                            <div className="bg-white p-3 rounded-xl shadow-sm mr-4 group-hover:text-indigo-600">
                                                <Download className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-xs font-black text-gray-800 line-clamp-1 truncate uppercase tracking-tighter">{archivo.nombre_archivo || 'Documento PDF'}</p>
                                                <p className="text-[10px] font-bold text-gray-400">3.4 MB</p>
                                            </div>
                                        </a>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Activities */}
                <div className="space-y-8">
                    <div className="bg-indigo-900 rounded-[3rem] p-8 text-white shadow-2xl shadow-indigo-200">
                        <h4 className="text-xl font-black mb-6 flex items-center">
                            <ClipboardList className="w-5 h-5 mr-3 text-indigo-400" /> Actividades Pendientes
                        </h4>
                        <div className="space-y-4">
                            {clase.actividades.map((act: any) => (
                                <div key={act.actividad_id} className="bg-white/5 border border-white/10 p-5 rounded-[2rem] space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{act.tipo_actividad?.nombre || 'Tarea'}</span>
                                            <p className="font-bold text-sm leading-tight">{act.nombre_actividad}</p>
                                        </div>
                                        <AlertCircle className="w-4 h-4 text-orange-400" />
                                    </div>
                                    
                                    {act.tipo_id == 1 ? ( // If it's a quiz/exam
                                        <Link href={`/examenes/${act.actividad_id}/resolver`} className="block">
                                            <Button className="w-full h-10 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-black text-[10px] uppercase">
                                                Iniciar Examen
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button 
                                            onClick={() => handleUpload(act.actividad_id)}
                                            disabled={submitting === act.actividad_id}
                                            className="w-full h-10 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-[10px] uppercase shadow-lg shadow-indigo-900/50"
                                        >
                                            {submitting === act.actividad_id ? 'Subiendo...' : 'Entregar Tarea'} <Upload className="w-3 h-3 ml-2" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {clase.actividades.length === 0 && <p className="text-xs text-white/50 italic">No hay actividades para esta sesión.</p>}
                        </div>
                    </div>

                    <div className="bg-emerald-50 rounded-[3rem] p-8 border border-emerald-100">
                        <div className="flex items-center space-x-3 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <h4 className="font-black text-emerald-900">Estado de la Clase</h4>
                        </div>
                        <p className="text-xs font-medium text-emerald-700/80 leading-relaxed">
                            Una vez revisados todos los materiales y entregadas las actividades, esta clase se marcará como completa automáticamente en tu progreso.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    </AppSidebarLayout>
    );
}
