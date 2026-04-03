import { Head, Link } from '@inertiajs/react';
import { 
    BookOpen, 
    ChevronRight, 
    FileText, 
    PlayCircle, 
    ClipboardList, 
    CheckCircle2, 
    Circle,
    ArrowLeft,
    Clock,
    MonitorPlay,
    Star,
    Library
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/shared/PageHeader';
import type { BreadcrumbItem } from '@/types';

export default function CursoDetalle({ cursoId }: { cursoId: number }) {
    const [unidades, setUnidades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/alumno/curso/${cursoId}`)
            .then(res => setUnidades(res.data))
            .finally(() => setLoading(false));
    }, [cursoId]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mi Portal', href: '/alumno/dashboard' },
        { title: 'Mis Materias', href: '/alumno/cursos' },
        { title: 'Contenido', href: '#' },
    ];

    if (loading) return <div className="p-10 text-center font-black animate-pulse text-blue-600">Sincronizando contenido académico...</div>;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contenido del Curso" />

            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] overflow-hidden">
                {/* BLACKBOARD SIDEBAR (Course Menu) */}
                <aside className="w-full lg:w-72 bg-white border-r border-gray-100 flex flex-col shrink-0">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-100">
                                <MonitorPlay className="size-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Curso Activo</span>
                        </div>
                        <h2 className="text-lg font-black text-gray-900 leading-tight">Navegación del Curso</h2>
                    </div>

                    <nav className="p-4 flex flex-col gap-1 overflow-y-auto">
                        <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidades Académicas</p>
                        {unidades.map((u, i) => (
                            <button 
                                key={u.unidad_id}
                                onClick={() => document.getElementById(`unidad-${u.unidad_id}`)?.scrollIntoView({ behavior: 'smooth' })}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-left"
                            >
                                <span className="size-5 flex items-center justify-center rounded-lg bg-gray-100 text-[10px]">{i + 1}</span>
                                <span className="truncate text-xs">{u.titulo}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto p-4 border-t border-gray-100">
                        <Link href="/alumno/cursos" className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="size-4" /> Volver a mis cursos
                        </Link>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 bg-[#FDFDFD] p-6 lg:p-10 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-12 pb-20">
                        
                        <PageHeader 
                            title="Contenido del Curso"
                            subtitle="Revisa tus clases, tareas y exámenes programados."
                            icon={Library}
                            iconColor="bg-blue-600"
                        />

                        {unidades.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                                <div className="p-4 bg-gray-50 rounded-full mb-4">
                                    <BookOpen className="size-12 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-bold italic">Aún no se ha publicado contenido para este periodo académico.</p>
                            </div>
                        ) : (
                            unidades.map((u, idx) => (
                                <section key={u.unidad_id} id={`unidad-${u.unidad_id}`} className="space-y-6 scroll-mt-10">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="text-[40px] font-black text-gray-100 leading-none">{String(idx + 1).padStart(2, '0')}</div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{u.titulo}</h3>
                                                <p className="text-xs font-bold text-gray-400">{u.clases.length} sesiones encontradas</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {u.clases.map((clase: any) => (
                                            <div key={clase.clase_id} className="space-y-4">
                                                {/* CLASS ITEM */}
                                                <div className="group flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
                                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <PlayCircle className="size-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Sesión de Clase</span>
                                                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                                <Clock className="size-3" /> Clase {clase.orden}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-md font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{clase.titulo}</h4>
                                                        
                                                        {clase.descripcion && (
                                                            <div 
                                                                className="text-xs text-gray-500 line-clamp-2 italic prose prose-sm max-w-none"
                                                                dangerouslySetInnerHTML={{ __html: clase.descripcion }}
                                                            />
                                                        )}
                                                        
                                                        <div className="mt-4 flex items-center gap-3">
                                                            <Link href={`/alumno/clase/${clase.clase_id}`} className="px-4 py-1.5 bg-gray-900 text-white text-[10px] font-black rounded-lg hover:bg-black transition-colors uppercase tracking-widest leading-none">
                                                                Abrir Contenido
                                                            </Link>
                                                            {clase.archivos?.length > 0 && (
                                                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                                    <FileText className="size-3" /> {clase.archivos.length} archivos
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* ACTIVITIES LINKED TO CLASS (TASKS/EXAMS) */}
                                                {clase.actividades?.map((act: any) => (
                                                    <div key={act.actividad_id} className="ml-10 group flex items-start gap-4 p-5 bg-[#FCFDFF] border border-gray-100 rounded-2xl hover:bg-white hover:border-amber-200 hover:shadow-md transition-all border-l-4 border-l-amber-500">
                                                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                                            {act.id_tipo_actividad === 2 || act.id_tipo_actividad === 3 ? <Star className="size-6" /> : <ClipboardList className="size-6" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">
                                                                    {act.tipo_actividad?.nombre || 'Actividad'}
                                                                </span>
                                                                <span className="text-[9px] text-red-500 font-black flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">
                                                                    Vence: {new Date(act.fecha_cierre).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-md font-black text-gray-800 mb-1 uppercase tracking-tight">{act.nombre_actividad}</h4>
                                                            
                                                            {act.descripcion_corta && (
                                                                <div 
                                                                    className="text-xs text-gray-500 line-clamp-1 italic mb-3 prose prose-sm"
                                                                    dangerouslySetInnerHTML={{ __html: act.descripcion_corta }}
                                                                />
                                                            )}
                                                            
                                                            <div className="mt-3">
                                                                <Link 
                                                                    href={act.id_tipo_actividad === 2 || act.id_tipo_actividad === 3 ? `/examenes/${act.actividad_id}/resolver` : `/alumno/clase/${clase.clase_id}`} 
                                                                    className="inline-flex items-center gap-2 px-5 py-2 border-2 border-amber-500 text-amber-600 text-[10px] font-black rounded-xl hover:bg-amber-500 hover:text-white transition-all uppercase tracking-widest"
                                                                >
                                                                    {act.id_tipo_actividad === 2 || act.id_tipo_actividad === 3 ? 'Comenzar Evaluación' : 'Entregar Tarea'}
                                                                    <ChevronRight className="size-3" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </AppLayout>
    );
}
