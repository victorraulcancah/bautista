import { Head, Link } from '@inertiajs/react';
import { BookOpen, Calendar, ChevronRight, GraduationCap, LayoutDashboard, Star, User, MessageSquare, Newspaper, Folder } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function AlumnoDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/alumno/dashboard')
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-center animate-pulse text-purple-600 font-black uppercase tracking-widest">Iniciando Portal Alumno...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8 font-sans selection:bg-purple-200">
            <Head title="Mi Portal" />

            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-purple-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center space-x-3">
                        <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                            Estudiante de {data.matricula?.seccion?.nombre || 'Bautista'}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                        ¡Hola, {data.matricula?.estudiante?.perfil?.primer_nombre || 'Bienvenido'}!
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-white/80 max-w-2xl">
                        Hoy tienes <span className="text-white font-black underline decoration-pink-400 decoration-4 underline-offset-4">{data.resumen.pendientes} actividades</span> pendientes de cierre. ¡Vamos a por ello!
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Mis Cursos', value: data.resumen.cursos, icon: BookOpen, color: 'bg-blue-500' },
                    { label: 'Tareas Pendientes', value: data.resumen.pendientes, icon: Calendar, color: 'bg-orange-500' },
                    { label: 'Asistencia General', value: `${data.resumen.asistencia}%`, icon: User, color: 'bg-emerald-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex items-center space-x-6 group hover:scale-[1.02] transition-transform duration-300">
                        <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending Evaluations (Exams/Questionnaires) */}
            {data.examenes && data.examenes.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-gray-900 flex items-center">
                            <Star className="w-5 h-5 mr-3 text-red-500 fill-red-500" />Evaluaciones Pendientes
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.examenes.map((ex: any) => (
                            <div key={ex.actividad_id} className="bg-white p-6 rounded-[2rem] border-2 border-red-100 shadow-xl shadow-red-50 flex items-center justify-between group hover:border-red-500 transition-all duration-300">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Atención: Cierra pronto</p>
                                    <h4 className="text-xl font-black text-gray-900">{ex.nombre_actividad}</h4>
                                    <p className="text-xs text-gray-400 font-medium italic">Vence el {new Date(ex.fecha_cierre).toLocaleString()}</p>
                                </div>
                                <Link href={`/alumno/actividad/${ex.actividad_id}`}>
                                    <Button className="bg-red-600 hover:bg-black text-white rounded-2xl h-12 px-6 font-black uppercase tracking-widest">
                                        Resolver Ahora
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Activities */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-gray-900 flex items-center">
                            <Calendar className="w-5 h-5 mr-3 text-purple-600" /> Próximas Actividades
                        </h3>
                        <Link href="/alumno/cursos" className="text-xs font-bold text-purple-600 hover:underline flex items-center">
                            Ver todas <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {data.actividades.length === 0 ? (
                            <div className="p-10 bg-white border border-dashed border-gray-200 rounded-[2rem] text-center">
                                <p className="text-gray-400 font-bold">¡Estás al día! No hay tareas pendientes.</p>
                            </div>
                        ) : (
                            data.actividades.map((act: any) => (
                                <div key={act.actividad_id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-purple-600 uppercase tracking-tighter">Cierra: {new Date(act.fecha_cierre).toLocaleDateString()}</p>
                                        <h4 className="text-lg font-black text-gray-800">{act.nombre_actividad}</h4>
                                    </div>
                                    <Link href={act.id_tipo_actividad === 2 ? `/examenes/${act.actividad_id}/resolver` : '#'}>
                                        <Button className="rounded-xl h-10 font-bold bg-gray-900 hover:bg-black">
                                            {act.id_tipo_actividad === 2 ? 'Resolver Examen' : 'Ver Detalles'}
                                        </Button>
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Grades */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-gray-900 flex items-center">
                            <Star className="w-5 h-5 mr-3 text-amber-500" /> Notas Recientes
                        </h3>
                        <Link href="/alumno/notas" className="text-xs font-bold text-amber-600 hover:underline flex items-center">
                            Ver libreta <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                        {data.notas.length === 0 ? (
                            <div className="p-10 text-center text-gray-400 font-bold">Aún no tienes calificaciones registradas.</div>
                        ) : (
                            <div className="divide-y divide-gray-50 text-sm">
                                {data.notas.map((n: any) => (
                                    <div key={n.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actividad</p>
                                            <p className="font-bold text-gray-800">{n.actividad?.nombre_actividad}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-black ${parseFloat(n.nota) >= 11 ? 'text-blue-600' : 'text-red-600'}`}>
                                                {n.nota}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Institutional Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/mensajeria" className="group">
                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 hover:scale-[1.03] transition-all flex flex-col justify-between h-48">
                        <MessageSquare className="w-10 h-10 opacity-50" />
                        <div>
                            <p className="text-2xl font-black tracking-tighter">Mensajería</p>
                            <p className="text-xs font-medium text-indigo-100 italic">Habla con tus profes</p>
                        </div>
                    </div>
                </Link>
                <Link href="/comunicados" className="group">
                    <div className="bg-rose-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-200 hover:scale-[1.03] transition-all flex flex-col justify-between h-48">
                        <Newspaper className="w-10 h-10 opacity-50" />
                        <div>
                            <p className="text-2xl font-black tracking-tighter">Comunicados</p>
                            <p className="text-xs font-medium text-rose-100 italic">Noticias del cole</p>
                        </div>
                    </div>
                </Link>
                <Link href="/biblioteca" className="group">
                    <div className="bg-amber-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-200 hover:scale-[1.03] transition-all flex flex-col justify-between h-48">
                        <Folder className="w-10 h-10 opacity-50" />
                        <div>
                            <p className="text-2xl font-black tracking-tighter">Mi Biblioteca</p>
                            <p className="text-xs font-medium text-amber-100 italic">Tus archivos</p>
                        </div>
                    </div>
                </Link>
                <Link href="/alumno/cursos" className="group">
                    <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-gray-200 hover:scale-[1.03] transition-all flex flex-col justify-between h-48">
                        <BookOpen className="w-10 h-10 opacity-50" />
                        <div>
                            <p className="text-2xl font-black tracking-tighter">Mis Cursos</p>
                            <p className="text-xs font-medium text-gray-400 italic">Ver contenido</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Biblioteca - Resources List */}
            {data.biblioteca && data.biblioteca.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-gray-900 flex items-center px-2">
                        <Folder className="w-5 h-5 mr-3 text-amber-500" /> Mi Biblioteca Digital
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.biblioteca.map((file: any) => (
                            <a 
                                key={file.id_medio}
                                href={`/storage/${file.ruta}`}
                                target="_blank"
                                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-all group"
                            >
                                <div className="bg-amber-100 p-3 rounded-2xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                    <Folder className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-gray-800 truncate">{file.nombre}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{file.tipo}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Latest News (from Blog) */}
            {data.noticias && data.noticias.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-gray-900 flex items-center px-2">
                        <Star className="w-5 h-5 mr-3 text-pink-500" /> Últimas Noticias
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {data.noticias.map((post: any) => (
                            <div key={post.blo_id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col group">
                                {post.blo_imagen && (
                                    <div className="h-48 overflow-hidden">
                                        <img 
                                            src={`/storage/${post.blo_imagen}`} 
                                            alt={post.blo_titulo}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <div className="p-8 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.2em] mb-2">
                                            {new Date(post.blo_fecha).toLocaleDateString()}
                                        </p>
                                        <h4 className="text-xl font-black text-gray-900 leading-tight">{post.blo_titulo}</h4>
                                    </div>
                                    <Link href={`/blog/${post.blo_id}`}>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-pink-600 cursor-pointer">Leer más →</p>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Horarios Section */}
            {data.horarios && data.horarios.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-gray-900 flex items-center px-2">
                        <Calendar className="w-5 h-5 mr-3 text-emerald-500" /> Mi Horario Escolar
                    </h3>
                    <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                        {data.horarios.map((h: any) => (
                            <div key={h.horario_archivo_id} className="space-y-4">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{h.nombre}</p>
                                <div className="rounded-3xl overflow-hidden border-8 border-gray-50 shadow-inner bg-gray-50/50">
                                    <img 
                                        src={`/storage/${h.path}`} 
                                        alt={h.nombre}
                                        className="w-full h-auto object-contain max-h-[800px]"
                                    />
                                </div>
                                <div className="flex justify-end p-2">
                                    <a 
                                        href={`/storage/${h.path}`} 
                                        target="_blank" 
                                        download 
                                        className="text-xs font-black text-purple-600 uppercase tracking-widest hover:underline"
                                    >
                                        Descargar Horario ↓
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
