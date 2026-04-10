import { Head, Link } from '@inertiajs/react';
import { Plus, FileText, BookOpen, Trash2, Edit3, X, PlusCircle, Bell, BarChart2, Users, Settings, Layout, Phone, Mail, Fingerprint } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import CourseHero from '../../Cursos/components/CourseHero';
import CourseTabs from '../../Cursos/components/CourseTabs';

export default function ContenidoEditor({ docenteCursoId }: { docenteCursoId: number }) {
    const [unidades, setUnidades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('content');
    const [courseData, setCourseData] = useState<any>(null);
    const [showUnidadForm, setShowUnidadForm] = useState(false);
    const [nuevaUnidad, setNuevaUnidad] = useState('');
    
    // Roster State
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [loadingAlumnos, setLoadingAlumnos] = useState(false);

    useEffect(() => {
        loadData();
    }, [docenteCursoId]);

    useEffect(() => {
        if (activeTab === 'roster' && alumnos.length === 0) {
            fetchAlumnos();
        }
    }, [activeTab]);

    const fetchAlumnos = async () => {
        setLoadingAlumnos(true);
        try {
            const res = await api.get(`/docente/curso/${docenteCursoId}/alumnos`);
            setAlumnos(res.data);
        } finally {
            setLoadingAlumnos(false);
        }
    };

    const loadData = async () => {
        try {
            // Cargar info del curso
            const courseRes = await api.get('/docente/mis-cursos');
            const currentCourse = courseRes.data.find((c: any) => c.docen_curso_id === docenteCursoId);
            setCourseData(currentCourse);

            // Cargar contenido
            const contentRes = await api.get(`/docente/curso/${docenteCursoId}/contenido`);
            setUnidades(contentRes.data);
        } catch (error) {
            console.error("Error loading course data", error);
        } finally {
            setLoading(false);
        }
    };

    const loadContent = () => {
        api.get(`/docente/curso/${docenteCursoId}/contenido`)
            .then(res => setUnidades(res.data));
    };

    const addUnidad = () => {
        if (!nuevaUnidad) return;
        api.post('/docente/unidad', { docente_curso_id: docenteCursoId, titulo: nuevaUnidad })
            .then(() => {
                setNuevaUnidad('');
                setShowUnidadForm(false);
                loadContent();
            });
    };

    const addClase = (unidadId: number) => {
        const titulo = prompt('Título de la nueva sesión:');
        if (!titulo) return;
        api.post('/docente/clase', { unidad_id: unidadId, titulo })
            .then(() => loadContent());
    };

    const addActividad = (claseId: number, tipoId: number) => {
        const nombre = prompt(tipoId === 3 ? 'Nombre del Cuestionario/Examen:' : 'Nombre de la actividad/tarea:');
        if (!nombre) return;
        api.post('/docente/actividad', { id_clase_curso: claseId, nombre_actividad: nombre, tipo_id: tipoId })
            .then(() => loadContent());
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={[]}>
                <div className="p-20 text-center font-black animate-pulse text-indigo-600 uppercase tracking-widest text-xl">
                    Abriendo Aula Virtual...
                </div>
            </AppLayout>
        );
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Cursos', href: '/cursos' },
        { title: courseData?.curso?.nombre || 'Curso', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Aula: ${courseData?.curso?.nombre}`} />
            
            <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
                <CourseHero 
                    title={courseData?.curso?.nombre || 'Cargando...'}
                    courseCode={`COD-${courseData?.curso_id}`}
                    color="#4f46e5"
                    role="teacher"
                    term={courseData?.apertura?.nombre}
                />

                <CourseTabs activeTab={activeTab} onChange={setActiveTab} role="teacher" />

                <div className="min-h-[500px]">
                    {activeTab === 'content' && (
                        <div className="space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Contenido del curso</h2>
                                    <p className="text-gray-500 text-sm font-medium">Gestiona el material de estudio por unidades.</p>
                                </div>
                                <Button 
                                    onClick={() => setShowUnidadForm(true)}
                                    className="rounded-2xl h-12 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-bold transition-all hover:scale-105"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" /> Nueva Unidad
                                </Button>
                            </div>

                            {showUnidadForm && (
                                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-2xl flex items-center space-x-4 animate-in fade-in zoom-in-95 duration-300">
                                    <Input 
                                        placeholder="Nombre de la nueva unidad..." 
                                        value={nuevaUnidad}
                                        onChange={e => setNuevaUnidad(e.target.value)}
                                        className="flex-1 h-14 rounded-2xl border-gray-100 font-bold text-lg px-6"
                                    />
                                    <Button onClick={addUnidad} className="bg-indigo-600 rounded-2xl h-14 px-10 font-black">Crear</Button>
                                    <Button variant="ghost" onClick={() => setShowUnidadForm(false)} className="rounded-2xl h-14 px-6 font-bold text-gray-400"><X /></Button>
                                </div>
                            )}

                            <div className="space-y-12">
                                {unidades.map((u, i) => (
                                    <div key={u.unidad_id} className="bg-white rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden group transition-all hover:shadow-2xl">
                                        <div className="bg-gray-50/50 p-10 border-b border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center space-x-6">
                                                <div className="bg-indigo-600 text-white w-14 h-14 rounded-3xl flex items-center justify-center text-xl font-black italic">
                                                    U{i+1}
                                                </div>
                                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{u.titulo}</h3>
                                            </div>
                                            <Button variant="outline" onClick={() => addClase(u.unidad_id)} className="rounded-2xl h-12 px-6 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 font-black">
                                                <Plus className="w-4 h-4 mr-2" /> Añadir Sesión
                                            </Button>
                                        </div>
                                        <div className="p-10 space-y-8">
                                            {u.clases.length === 0 ? (
                                                <p className="text-center py-10 italic text-gray-400 font-medium">No hay sesiones en esta unidad.</p>
                                            ) : (
                                                u.clases.map((clase: any) => (
                                                    <div key={clase.clase_id} className="border border-gray-50 rounded-[2.5rem] p-8 hover:bg-gray-50/50 transition-all group/sesion">
                                                        <div className="flex items-center justify-between mb-8">
                                                            <div className="flex items-center space-x-5">
                                                                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm group-hover/sesion:text-indigo-600 transition-all">
                                                                    <BookOpen className="w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xl font-black text-gray-800 tracking-tight">{clase.titulo}</h4>
                                                                    <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Sesión #{clase.orden}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex space-x-3 opacity-0 group-hover/sesion:opacity-100 transition-all">
                                                                <Button variant="outline" size="sm" onClick={() => addActividad(clase.clase_id, 1)} className="rounded-xl border-indigo-100 text-indigo-600 font-black text-[10px] uppercase h-10 hover:bg-indigo-600 hover:text-white">+ Tarea</Button>
                                                                <Button variant="outline" size="sm" onClick={() => addActividad(clase.clase_id, 3)} className="rounded-xl border-emerald-100 text-emerald-600 font-black text-[10px] uppercase h-10 hover:bg-emerald-600 hover:text-white">+ Examen</Button>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                            {clase.actividades?.map((act: any) => (
                                                                <div key={act.actividad_id} className="bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center justify-between shadow-sm border-l-4 border-l-indigo-400">
                                                                    <div className="flex items-center space-x-4">
                                                                        <FileText className="w-5 h-5 text-indigo-500" />
                                                                        <span className="text-sm font-black text-gray-700">{act.nombre_actividad}</span>
                                                                    </div>
                                                                    <button className="text-gray-300 hover:text-rose-500 p-2"><Trash2 size={18} /></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'roster' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Alumnos Matriculados</h2>
                                <p className="bg-indigo-50 text-indigo-700 px-6 py-2 rounded-2xl font-black border border-indigo-100">{alumnos.length} Estudiantes</p>
                            </div>

                            {loadingAlumnos ? (
                                <div className="text-center py-20 animate-pulse text-indigo-400 font-bold uppercase tracking-widest">Cargando nómina...</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {alumnos.map((a: any) => (
                                        <div key={a.id_matricula} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20 hover:shadow-2xl transition-all group relative overflow-hidden">
                                            <div className="flex items-center space-x-5 mb-6">
                                                <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                                                    {a.estudiante?.perfil?.foto_perfil ? (
                                                        <img src={`/storage/${a.estudiante.perfil.foto_perfil}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users size={24} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-gray-900 leading-tight">
                                                        {a.estudiante?.perfil?.primer_nombre} {a.estudiante?.perfil?.apellido_paterno}
                                                    </h3>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">DNI: {a.estudiante?.perfil?.doc_numero}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3 pt-4 border-t border-gray-50">
                                                <div className="flex items-center text-sm font-medium text-gray-500">
                                                    <Mail size={16} className="mr-3 text-indigo-300" /> {a.estudiante?.user?.email || 'Sin correo'}
                                                </div>
                                                <div className="flex items-center text-sm font-medium text-gray-500">
                                                    <Phone size={16} className="mr-3 text-indigo-300" /> {a.estudiante?.perfil?.telefono || 'Sin teléfono'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {(activeTab === 'announcements' || activeTab === 'grades' || activeTab === 'settings') && (
                        <EmptyState icon={<Layout size={48} />} title="Próximamente" message="Esta funcionalidad se integrará en la siguiente fase del despliegue." />
                    )}
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
