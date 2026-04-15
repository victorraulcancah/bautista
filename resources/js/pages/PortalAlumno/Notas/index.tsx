import { Head } from '@inertiajs/react';
import { Star, TrendingUp, AlertCircle, BookOpen, ChevronRight, ArrowLeft, FileSpreadsheet, LayoutGrid } from 'lucide-react';
import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import SectionCard from '@/components/shared/SectionCard';
import StatCard from '@/components/shared/StatCard';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Portal', href: '/alumno/dashboard' },
    { title: 'Mis Calificaciones', href: '/alumno/notas' },
];

export default function AlumnoNotasPage() {
    const [cursos, setCursos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);

    useEffect(() => {
        api.get('/alumno/notas')
            .then(res => setCursos(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
                    <p className="font-black text-amber-500 animate-pulse uppercase tracking-widest text-xs">Cargando tus cursos y notas...</p>
                </div>
            </AppLayout>
        );
    }

    // Función para manejar el clic en un curso
    const handleCourseClick = (curso: any) => {
        setSelectedCourse(curso);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Notas" />

            <div className="flex flex-col gap-8 p-6 animate-in fade-in duration-500">
                {/* Cabecera Principal */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center justify-between">
                    <div>
                        {selectedCourse ? (
                            <button 
                                onClick={() => setSelectedCourse(null)}
                                className="group mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-amber-600 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Volver a mis cursos
                            </button>
                        ) : null}
                        <PageHeader 
                            icon={selectedCourse ? BookOpen : Star}
                            title={selectedCourse ? selectedCourse.nombre_curso : "Mis Calificaciones"}
                            subtitle={selectedCourse 
                                ? `Detalle de evaluaciones y progreso académico.` 
                                : "Tu desempeño académico organizado por materias."
                            }
                            iconColor="bg-amber-500"
                        />
                    </div>

                    {selectedCourse && (
                        <div className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Promedio Curso</p>
                                <p className={`text-2xl font-black ${parseFloat(selectedCourse.promedio) >= 11 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {selectedCourse.promedio || '---'}
                                </p>
                            </div>
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg ${parseFloat(selectedCourse.promedio) >= 11 ? 'bg-blue-600' : 'bg-red-600'}`}>
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Vista de Lista de Cursos */}
                {!selectedCourse && (
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {cursos.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                                <p className="text-gray-400 font-medium tracking-tight">No se encontraron materias registradas.</p>
                            </div>
                        ) : (
                            cursos.map((curso: any) => (
                                <button 
                                    key={curso.curso_id}
                                    onClick={() => handleCourseClick(curso)}
                                    className="group relative flex flex-col items-start p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200 transition-all text-left overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <LayoutGrid size={80} />
                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-6 group-hover:scale-110 transition-transform duration-500">
                                        <BookOpen className="h-7 w-7" />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-gray-900 leading-tight mb-2 group-hover:text-amber-600 transition-colors">
                                            {curso.nombre_curso}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-6">
                                            <span className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                                                ID: {curso.curso_id}
                                            </span>
                                            {curso.promedio && (
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${parseFloat(curso.promedio) >= 11 ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                    Nota: {curso.promedio}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full flex items-center justify-between pt-4 border-t border-gray-50">
                                        <span className="text-xs font-black uppercase tracking-widest text-amber-600">Ver calificaciones</span>
                                        <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {/* Vista de Detalle de Notas */}
                {selectedCourse && (
                    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
                        {selectedCourse.grupos.length === 0 ? (
                            <SectionCard title="Detalle de Calificaciones">
                                <div className="py-20 text-center">
                                    <AlertCircle className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                                    <p className="text-gray-400 font-medium italic">Aún no hay actividades calificadas en este curso.</p>
                                </div>
                            </SectionCard>
                        ) : (
                            selectedCourse.grupos.map((grupo: any) => (
                                <SectionCard key={grupo.tipo} title={grupo.tipo}>
                                    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                <tr>
                                                    <th className="px-6 py-4">Actividad / Evaluación</th>
                                                    <th className="px-6 py-4 text-center">Nota</th>
                                                    <th className="px-6 py-4">Comentario del Docente</th>
                                                    <th className="px-6 py-4 text-right">Fecha</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {grupo.items.map((item: any) => (
                                                    <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`h-1.5 w-1.5 rounded-full ${parseFloat(item.nota) >= 11 ? 'bg-blue-500' : 'bg-red-500'}`} />
                                                                <p className="font-bold text-gray-700">{item.nombre}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex h-9 w-12 items-center justify-center rounded-lg text-lg font-black ${parseFloat(item.nota) >= 11 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                                                                {item.nota}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-xs text-gray-500 italic font-medium leading-relaxed">
                                                                {item.observacion || 'Sin comentarios adicionales'}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-[10px] font-black text-gray-400">
                                                            {new Date(item.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </SectionCard>
                            ))
                        )}

                        <div className="flex items-center gap-4 rounded-3xl bg-amber-50/50 p-6 text-amber-800 border border-amber-100 shadow-sm">
                            <AlertCircle className="size-6 shrink-0 text-amber-600" />
                            <div>
                                <p className="text-sm font-black uppercase tracking-tight">Nota Importante</p>
                                <p className="text-xs font-medium text-amber-700/80 leading-relaxed">Las actividades mostradas corresponden únicamente a las que han sido calificadas por el docente. Las tareas pendientes no aparecerán en esta lista.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
