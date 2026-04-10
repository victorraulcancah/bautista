import { Head, Link } from '@inertiajs/react';
import { BookOpen, FileText, ChevronRight, Bell, BarChart2, MessageSquare, Clock, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import CourseHero from '../../Cursos/components/CourseHero';
import CourseTabs from '../../Cursos/components/CourseTabs';

export default function CursoDetalleAlumno({ cursoId }: { cursoId: number }) {
    const [activeTab, setActiveTab] = useState('content');
    const [courseData, setCourseData] = useState<any>(null);
    const [unidades, setUnidades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [cursoId]);

    const loadData = async () => {
        try {
            // Cargar info de mis cursos para obtener el detalle de este curso específico (color, docente, etc)
            const coursesRes = await api.get('/alumno/cursos');
            const currentCourse = coursesRes.data.find((c: any) => c.docen_curso_id === cursoId);
            setCourseData(currentCourse);

            // Cargar estructura del curso
            const contentRes = await api.get(`/alumno/curso/${cursoId}`);
            setUnidades(contentRes.data);
        } catch (error) {
            console.error("Error cargando detalle del curso", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={[]}>
                <div className="p-20 text-center font-black animate-pulse text-blue-600 uppercase tracking-widest text-xl">
                    Cargando material de estudio...
                </div>
            </AppLayout>
        );
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mis Materias', href: '/cursos' },
        { title: courseData?.curso?.nombre || 'Curso', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Curso: ${courseData?.curso?.nombre}`} />
            
            <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto font-sans">
                {/* Banner Hero */}
                <CourseHero 
                    title={courseData?.curso?.nombre || 'Curso'}
                    courseCode={`COD-${courseData?.curso_id}`}
                    color="#2563eb"
                    role="student"
                    term="Ciclo 2024-I"
                    professor={`${courseData?.docente?.perfil?.primer_nombre} ${courseData?.docente?.perfil?.apellido_paterno}`}
                />

                {/* Navigation Tabs */}
                <CourseTabs 
                    activeTab={activeTab} 
                    onChange={setActiveTab} 
                    role="student" 
                />

                {/* Tab Content */}
                <div className="min-h-[500px]">
                    {activeTab === 'content' && (
                        <div className="space-y-12">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Materiales y Sesiones</h2>
                                    <p className="text-gray-500 font-medium">Revisa las unidades y entra a cada sesión para ver las actividades.</p>
                                </div>
                                <div className="bg-blue-50 px-6 py-3 rounded-2xl flex items-center gap-4 border border-blue-100">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Tu Progreso</p>
                                        <p className="text-lg font-black text-blue-600 leading-none mt-1">65%</p>
                                    </div>
                                    <div className="h-10 w-px bg-blue-200" />
                                    <BarChart2 className="text-blue-500" size={24} />
                                </div>
                            </div>

                            <div className="space-y-12">
                                {unidades.length === 0 ? (
                                    <EmptyState 
                                        icon={<BookOpen size={48} />} 
                                        title="Contenido no disponible" 
                                        message="Todavía no se ha publicado contenido para este curso. ¡Vuelve pronto!" 
                                    />
                                ) : (
                                    unidades.map((u, i) => (
                                        <div key={u.unidad_id} className="bg-white rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden group">
                                            {/* Header de Unidad */}
                                            <div className="bg-gray-50/50 p-10 border-b border-gray-100 flex items-center gap-6">
                                                <div className="bg-blue-600 text-white w-14 h-14 rounded-3xl flex items-center justify-center text-xl font-black shadow-lg shadow-blue-100 italic">
                                                    U{i + 1}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Unidad Temática</p>
                                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{u.titulo}</h3>
                                                </div>
                                            </div>

                                            {/* Listado de Sesiones */}
                                            <div className="p-10 space-y-6">
                                                {u.clases.length === 0 ? (
                                                    <p className="text-center py-10 italic text-gray-400 font-medium">No hay sesiones publicadas en esta unidad.</p>
                                                ) : (
                                                    u.clases.map((clase: any) => (
                                                        <Link 
                                                            key={clase.clase_id} 
                                                            href={`/alumno/clase/${clase.clase_id}`}
                                                            className="block border border-gray-50 rounded-[2.5rem] p-8 hover:bg-blue-50/50 transition-all group/sesion bg-white hover:border-blue-100"
                                                        >
                                                            <div className="flex flex-wrap items-center justify-between gap-6">
                                                                <div className="flex items-center space-x-6">
                                                                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm group-hover/sesion:text-blue-600 group-hover/sesion:scale-110 transition-all duration-300">
                                                                        <BookOpen className="w-7 h-7" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-xl font-black text-gray-800 tracking-tight group-hover/sesion:text-blue-600 transition-colors">
                                                                            {clase.titulo}
                                                                        </h4>
                                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                                            Sesión #{clase.orden} • {clase.actividades?.length || 0} Actividades
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-6">
                                                                    <div className="hidden md:flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                                                                        <Clock size={14} />
                                                                        <span>Pendiente</span>
                                                                    </div>
                                                                    <div className="bg-gray-100 group-hover/sesion:bg-blue-600 group-hover/sesion:text-white p-3 rounded-2xl transition-all">
                                                                        <ChevronRight size={24} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'announcements' && <EmptyState icon={<Bell size={48} />} title="Anuncios" message="Aquí verás las noticias y comunicados importantes que publique tu profesor." />}
                    {activeTab === 'grades' && <EmptyState icon={<BarChart2 size={48} />} title="Mis Notas" message="Próximamente: Podrás ver tu récord de calificaciones de este curso." />}
                    {activeTab === 'messages' && <EmptyState icon={<MessageSquare size={48} />} title="Mensajes" message="Comunícate directamente con tu docente y compañeros del curso." />}
                </div>
            </div>
        </AppLayout>
    );
}

function EmptyState({ icon, title, message }: any) {
    return (
        <div className="bg-white rounded-[4rem] p-24 text-center border-2 border-dashed border-gray-100 space-y-6 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
            <div className="inline-flex p-8 rounded-[2.5rem] bg-gray-50 text-gray-400 mb-4 shadow-inner">
                {icon}
            </div>
            <h3 className="text-3xl font-black text-gray-800 tracking-tight">{title}</h3>
            <p className="text-gray-500 font-bold max-w-md mx-auto leading-relaxed">{message}</p>
        </div>
    );
}
