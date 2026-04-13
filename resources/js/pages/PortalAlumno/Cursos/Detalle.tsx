import { Head, Link } from '@inertiajs/react';
import { BookOpen, FileText, ChevronRight, Bell, BarChart2, MessageSquare, Clock, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import CourseTabs from '../../Cursos/components/CourseTabs';

export default function CursoDetalleAlumno({ cursoId }: { cursoId: number }) {
    const [activeTab, setActiveTab] = useState('contenido');
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
            setUnidades(contentRes.data.unidades || []);
            
            // Si no tenemos la info básica del curso aún, la sacamos de aquí
            if (!courseData && contentRes.data.curso) {
                setCourseData({ curso: contentRes.data.curso });
            }
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
                <div className="pb-0">
                    <PageHeader 
                        icon={BookOpen}
                        title={courseData?.curso?.nombre || 'Curso'}
                        subtitle={`Código: COD-${courseData?.curso_id} • ${courseData?.docente?.perfil?.primer_nombre} ${courseData?.docente?.perfil?.apellido_paterno}`}
                        iconColor="bg-blue-600"
                    />
                </div>

                {/* Navigation Tabs */}
                <CourseTabs 
                    activeTab={activeTab} 
                    onChange={setActiveTab} 
                    role="student" 
                />

                {/* Tab Content */}
                <div className="min-h-[500px]">
                    {/* Main Content Area */}
                    <main className="max-w-7xl mx-auto p-4 md:p-8">
                        {activeTab === 'contenido' && <ContenidoTab unidades={unidades} />}
                        {activeTab === 'anuncios' && <AnunciosTab anuncios={courseData?.anuncios || []} />}
                        {activeTab === 'calificaciones' && <NotasTab cursoId={cursoId} />}
                        {activeTab === 'asistencia' && <AsistenciaTab cursoId={cursoId} />}
                        {activeTab === 'mensajes' && (
                            <ChatWithTeacher 
                                teacher={courseData?.docente} 
                                cursoId={cursoId}
                            />
                        )}
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}

function ChatWithTeacher({ teacher, cursoId }: { teacher: any, cursoId: number }) {
    const [mensaje, setMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);

    const enviarMensaje = async () => {
        if (!mensaje.trim()) return;
        setEnviando(true);
        try {
            await api.post('/mensajes-legacy/enviar', {
                receptor_id: teacher.user?.id,
                asunto: `Consulta de Alumno - Curso ID: ${cursoId}`,
                mensaje: mensaje
            });
            alert('Mensaje enviado con éxito');
            setMensaje('');
        } catch (error) {
            alert('No se pudo enviar el mensaje');
        } finally {
            setEnviando(false);
        }
    };

    if (!teacher) return <div className="p-20 text-center font-bold text-gray-400">Cargando información del docente...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="rounded-[3rem] p-10 border-none shadow-xl bg-white overflow-hidden relative">
                <div className="flex items-center gap-6 mb-8">
                    <div className="size-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl">
                        {teacher.perfil?.primer_nombre?.[0] || 'D'}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 leading-tight">
                            {teacher.perfil?.primer_nombre} {teacher.perfil?.apellido_paterno}
                        </h3>
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-1">Docente del curso</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Escribe tu consulta</label>
                    <textarea 
                        className="w-full min-h-[150px] p-6 rounded-[2rem] border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-100 transition-all outline-none font-bold text-gray-700 resize-none"
                        placeholder="Hola profesor, tengo una duda sobre..."
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                    />
                    <Button 
                        onClick={enviarMensaje}
                        disabled={enviando || !mensaje.trim()}
                        className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-lg font-black gap-3 shadow-lg shadow-indigo-100"
                    >
                        <MessageSquare size={20} />
                        {enviando ? 'Enviando...' : 'Enviar Mensaje'}
                    </Button>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between text-gray-400">
                    <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span className="text-[10px] font-bold">Respuesta estimada: 24h</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span className="text-[10px] font-bold">Privado: Solo tú y el profesor</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}

// ── SUB-COMPONENTES PORTAL ALUMNO ──────────────────────────────────────────

function ContenidoTab({ unidades }: any) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Material de Estudio</h2>
                    <p className="text-gray-500 text-sm font-bold">Revisa las sesiones y actividades publicadas por tu docente.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {unidades.map((u: any, i: number) => (
                    <Card key={u.unidad_id} className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                        <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center gap-4">
                            <div className="size-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-blue-100 italic">
                                U{i + 1}
                            </div>
                            <h3 className="font-black text-xl text-gray-900">{u.titulo}</h3>
                        </div>
                        <div className="p-6 space-y-2">
                            {u.clases?.map((clase: any) => (
                                <Link 
                                    key={clase.clase_id} 
                                    href={`/alumno/clase/${clase.clase_id}`}
                                    className="flex items-center justify-between p-4 rounded-3xl border border-transparent hover:bg-blue-50/50 hover:border-blue-100 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                                            <BookOpen size={18} />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800 group-hover:text-blue-600 transition-colors">{clase.titulo}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Sesión {clase.orden}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-200 group-hover:text-blue-600 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </Card>
                ))}
                {unidades.length === 0 && (
                    <div className="py-20 text-center opacity-30">
                        <BookOpen size={64} className="mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">No hay contenido publicado aún</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function AnunciosTab({ anuncios }: any) {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Anuncios y Comunicados</h2>
            {anuncios.map((anuncio: any) => (
                <Card key={anuncio.id} className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">D</div>
                            <div>
                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Publicado por tu docente</p>
                                <p className="text-[10px] font-bold text-gray-400 capitalize">{new Date(anuncio.created_at).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">{anuncio.titulo}</h3>
                        <p className="text-gray-600 font-bold leading-relaxed">{anuncio.contenido}</p>
                    </div>
                </Card>
            ))}
            {anuncios.length === 0 && (
                <div className="py-20 text-center opacity-30">
                    <Bell size={64} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">No hay novedades por ahora</p>
                </div>
            )}
        </div>
    );
}

function NotasTab({ cursoId }: { cursoId: number }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<number | null>(null);

    useEffect(() => {
        api.get(`/alumno/curso/${cursoId}`).then(res => {
            // El endpoint /alumno/curso/{id} ya trae las notas cruzadas
            const simplifiedData = {
                actividades: res.data.unidades.flatMap((u: any) => u.clases.flatMap((c: any) => c.actividades)),
                promedio: res.data.unidades[0]?.clases[0]?.actividades[0]?.promedio || 0 // Ajustar según API real
            };
            setData(res.data);
            setLoading(false);
        });
    }, [cursoId]);

    const handleUpload = async (actividadId: number, file: File) => {
        setUploading(actividadId);
        const formData = new FormData();
        formData.append('archivo', file);
        try {
            await api.post(`/alumno/actividad/${actividadId}/entregar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Tarea entregada con éxito');
            // Recargar datos
            const res = await api.get(`/alumno/curso/${cursoId}`);
            setData(res.data);
        } catch (error) {
            alert('Error al subir la tarea');
        } finally {
            setUploading(null);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse font-black text-blue-400 uppercase text-xs">Calculando promedio...</div>;

    // Extraer todas las actividades con sus notas
    const actividades = data.unidades.flatMap((u: any) => 
        u.clases.flatMap((c: any) => 
            c.actividades.map((a: any) => ({ ...a, clase_titulo: c.titulo }))
        )
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Mi Historial de Notas</h2>
                    <p className="text-gray-500 text-sm font-bold italic">Revisa tus actividades y entrega tus tareas pendientes.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {actividades.map((act: any, idx: number) => (
                    <Card key={`${act.id || 'act'}-${idx}`} className="rounded-[2.5rem] border-none shadow-sm p-8 flex items-center justify-between bg-white group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900">{act.nombre}</h4>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                    {act.tipo_actividad?.nombre} • {act.clase_titulo}
                                </p>
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-6">
                            {act.entregado ? (
                                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
                                    ✅ Entregado {act.fecha_entrega && `(${new Date(act.fecha_entrega).toLocaleDateString()})`}
                                </div>
                            ) : (
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">⏳ Pendiente</span>
                                    {act.id_tipo_actividad === 1 && ( // Solo Tareas
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                id={`file-${act.id}`}
                                                className="hidden" 
                                                onChange={(e) => e.target.files?.[0] && handleUpload(act.id, e.target.files[0])}
                                            />
                                            <Button 
                                                disabled={uploading === act.id}
                                                onClick={() => document.getElementById(`file-${act.id}`)?.click()}
                                                className="h-8 rounded-xl bg-indigo-600 text-[10px] font-bold uppercase px-4"
                                            >
                                                {uploading === act.id ? 'Subiendo...' : 'Subir Tarea'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="text-center min-w-[60px]">
                                <div className={`text-3xl font-black ${act.nota ? (parseInt(act.nota) >= 11 ? 'text-emerald-600' : 'text-rose-600') : 'text-gray-200'}`}>
                                    {act.nota || '--'}
                                </div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nota</p>
                            </div>
                        </div>
                    </Card>
                ))}
                {actividades.length === 0 && (
                    <div className="py-20 text-center opacity-30">
                        <FileText size={64} className="mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">No hay actividades registradas</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function AsistenciaTab({ cursoId }: { cursoId: number }) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/alumno/curso/${cursoId}/asistencia`).then(res => {
            setHistory(res.data);
            setLoading(false);
        });
    }, [cursoId]);

    const stats = {
        P: history.filter(h => h.estado === 'P').length,
        F: history.filter(h => h.estado === 'F').length,
        total: history.length
    };

    const percent = stats.total > 0 ? Math.round((stats.P / stats.total) * 100) : 100;

    if (loading) return <div className="p-20 text-center animate-pulse font-black text-indigo-400 uppercase text-xs tracking-widest">Cargando récord de asistencia...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2.5rem] p-8 border-none bg-indigo-600 text-white shadow-xl shadow-indigo-100 flex flex-col items-center justify-center space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Porcentaje</span>
                    <span className="text-4xl font-black">{percent}%</span>
                </Card>
                <Card className="rounded-[2.5rem] p-8 border-none bg-white shadow-sm flex flex-col items-center justify-center space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Asistencias</span>
                    <span className="text-4xl font-black text-emerald-500">{stats.P}</span>
                </Card>
                <Card className="rounded-[2.5rem] p-8 border-none bg-white shadow-sm flex flex-col items-center justify-center space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inasistencias</span>
                    <span className="text-4xl font-black text-rose-500">{stats.F}</span>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-black text-gray-900 px-4">Historial de Sesiones</h3>
                <div className="grid gap-3">
                    {history.map((h, i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm flex items-center justify-between group hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-2xl flex items-center justify-center font-black ${
                                    h.estado === 'P' ? 'bg-emerald-50 text-emerald-600' : 
                                    h.estado === 'F' ? 'bg-rose-50 text-rose-600' : 
                                    'bg-gray-100 text-gray-400'
                                }`}>
                                    {h.estado || '?'}
                                </div>
                                <div>
                                    <p className="font-black text-gray-900">{h.clase_titulo}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                        {new Date(h.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    h.estado === 'P' ? 'bg-emerald-500 text-white' : 
                                    h.estado === 'F' ? 'bg-rose-500 text-white' : 
                                    'bg-gray-200 text-gray-600'
                                }`}>
                                    {h.estado === 'P' ? 'Presente' : h.estado === 'F' ? 'Falta' : 'Pendiente'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
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
