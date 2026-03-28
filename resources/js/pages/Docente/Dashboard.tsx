import { Head, Link } from '@inertiajs/react';
import { BookOpen, Users, ClipboardCheck, GraduationCap, ChevronRight, Calendar, AlertCircle, PlusCircle, Folder, MessageSquare, Newspaper, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function DocenteDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/docente/dashboard')
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-center font-black animate-pulse text-indigo-600">Cargando Panel Docente...</div>;

    return (
        <div className="min-h-screen bg-[#FDFDFF] p-4 md:p-10 space-y-10 font-sans selection:bg-indigo-100">
            <Head title="Panel Docente" />

            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Panel de Control</h1>
                    <p className="text-gray-500 font-medium">Gestiona tus clases, alumnos y evaluaciones desde un solo lugar.</p>
                </div>
                <div className="flex space-x-3">
                    <Link href="/horarios">
                        <Button className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-bold">
                            <PlusCircle className="w-4 h-4 mr-2" /> Nueva Clase
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Materias Asignadas', value: data.resumen.cursos, icon: BookOpen, color: 'bg-blue-600', shadow: 'shadow-blue-200' },
                    { label: 'Total Estudiantes', value: data.resumen.estudiantes, icon: Users, color: 'bg-purple-600', shadow: 'shadow-purple-200' },
                    { label: 'Pendientes por Calificar', value: data.resumen.pendientes_calificar, icon: GraduationCap, color: 'bg-rose-600', shadow: 'shadow-rose-200' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 flex items-center space-x-6 hover:scale-[1.02] transition-transform group">
                        <div className={`${stat.color} p-5 rounded-3xl text-white shadow-2xl ${stat.shadow}`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Courses */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Courses List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-black text-gray-900 flex items-center">
                            <ClipboardCheck className="w-6 h-6 mr-3 text-indigo-600" /> Mis Cursos Actuales
                        </h3>
                        <Link href="/docente/mis-cursos" className="text-xs font-bold text-indigo-600 hover:underline flex items-center">
                            Ver todos <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.cursos.map((c: any) => (
                            <div key={c.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-indigo-100 transition-shadow group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-10 -mt-10 group-hover:bg-indigo-100 transition-colors" />
                                <div className="relative z-10 space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">
                                            {c.seccion?.grado?.nombre} - {c.seccion?.nombre}
                                        </p>
                                        <h4 className="text-xl font-black text-gray-800 line-clamp-1">{c.curso?.nombre}</h4>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href="/notas" className="flex-1">
                                            <Button variant="outline" className="w-full rounded-xl border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-bold h-10">
                                                Notas
                                            </Button>
                                        </Link>
                                        <Link href="/horarios" className="flex-1">
                                            <Button variant="outline" className="w-full rounded-xl border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 font-bold h-10">
                                                Asistencia
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Alerts / Shortcuts */}
                <div className="space-y-8">
                    <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-10 -mr-10" />
                        <h4 className="text-xl font-black mb-4 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-3 text-indigo-400" /> Próximos Eventos
                        </h4>
                        <div className="space-y-6">
                            <div className="flex space-x-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/10">
                                    <span className="text-[10px] font-black uppercase">Mar</span>
                                    <span className="text-lg font-black leading-none">28</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Cierre de Examen Trimestral</p>
                                    <p className="text-xs text-white/60">Matemáticas 5to B</p>
                                </div>
                            </div>
                            <div className="flex space-x-4 opacity-70">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/10">
                                    <span className="text-[10px] font-black uppercase">Abr</span>
                                    <span className="text-lg font-black leading-none">02</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Reunión de Docentes</p>
                                    <p className="text-xs text-white/60">Auditorio Principal</p>
                                </div>
                            </div>
                        </div>
                        <Button className="w-full mt-8 rounded-xl bg-white text-indigo-900 hover:bg-gray-100 font-black h-12">
                            Ver Calendario Completo
                        </Button>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-6">
                        <h4 className="font-black text-gray-900 text-lg">Accesos Directos</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/biblioteca" className="flex flex-col items-center justify-center p-4 rounded-3xl border border-gray-50 hover:bg-gray-50 transition-colors space-y-2 group">
                                <Folder className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                <span className="text-[10px] font-bold text-gray-500">Mis Archivos</span>
                            </Link>
                            <Link href="/mensajeria" className="flex flex-col items-center justify-center p-4 rounded-3xl border border-gray-50 hover:bg-gray-50 transition-colors space-y-2 group">
                                <MessageSquare className="w-6 h-6 text-gray-400 group-hover:text-amber-500 transition-colors" />
                                <span className="text-[10px] font-bold text-gray-500">Mensajes</span>
                            </Link>
                            <Link href="/comunicados" className="flex flex-col items-center justify-center p-4 rounded-3xl border border-gray-50 hover:bg-gray-50 transition-colors space-y-2 group">
                                <Newspaper className="w-6 h-6 text-gray-400 group-hover:text-rose-500 transition-colors" />
                                <span className="text-[10px] font-bold text-gray-500">Noticias</span>
                            </Link>
                            <Link href="/scanner" className="flex flex-col items-center justify-center p-4 rounded-3xl border border-gray-50 hover:bg-gray-50 transition-colors space-y-2 group">
                                <QrCode className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                <span className="text-[10px] font-bold text-gray-500">Scanner QR</span>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
