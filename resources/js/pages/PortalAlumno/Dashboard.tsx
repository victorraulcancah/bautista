import { Head, Link } from '@inertiajs/react';
import { BookOpen, Calendar, ChevronRight, GraduationCap, LayoutDashboard, Star, User, MessageSquare, Newspaper, Folder } from 'lucide-react';
import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import SectionCard from '@/components/shared/SectionCard';
import StatCard from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Portal', href: '/alumno/dashboard' },
];

export default function AlumnoDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/alumno/dashboard')
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
return <div className="p-10 text-center animate-pulse text-primary font-bold uppercase tracking-widest">Iniciando Portal Alumno...</div>;
}

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Portal" />

            <div className="flex flex-col gap-8 p-6">
                <PageHeader
                    icon={GraduationCap}
                    title={`¡Hola, ${data.matricula?.estudiante?.perfil?.primer_nombre || 'Bienvenido'}!`}
                    subtitle={`Estudiante de ${data.matricula?.seccion?.nombre || 'Bautista'}`}
                    iconColor="bg-indigo-600"
                />

                {/* Quick Stats */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StatCard 
                        title="Mis Cursos"
                        value={data.resumen.cursos}
                        icon={BookOpen}
                        color="text-blue-600"
                        iconBg="bg-blue-600"
                        href="/alumno/cursos"
                    />
                    <StatCard 
                        title="Tareas Pendientes"
                        value={data.resumen.pendientes}
                        icon={Calendar}
                        color="text-orange-600"
                        iconBg="bg-orange-600"
                        href="/alumno/cursos"
                    />
                    <StatCard 
                        title="Asistencia General"
                        value={`${data.resumen.asistencia}%`}
                        icon={User}
                        color="text-emerald-600"
                        iconBg="bg-emerald-600"
                        href="/alumno/asistencia"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Pending Activities */}
                    <SectionCard title="Próximas Actividades">
                        <div className="space-y-4">
                            {data.actividades.length === 0 ? (
                                <p className="py-8 text-center text-sm italic text-gray-400">¡Estás al día! No hay tareas pendientes.</p>
                            ) : (
                                data.actividades.map((act: any) => (
                                    <div key={act.actividad_id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Vence: {new Date(act.fecha_cierre).toLocaleDateString()}</p>
                                            <h4 className="font-bold text-gray-800">{act.nombre_actividad}</h4>
                                        </div>
                                        <Link href={act.id_tipo_actividad === 2 ? `/examenes/${act.actividad_id}/resolver` : '#'}>
                                            <Button size="sm" className="rounded-lg font-bold">
                                                {act.id_tipo_actividad === 2 ? 'Resolver' : 'Ver'}
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </SectionCard>

                    {/* Recent Grades */}
                    <SectionCard title="Notas Recientes">
                        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100">
                            {data.notas.length === 0 ? (
                                <p className="py-8 text-center text-sm italic text-gray-400">Aún no tienes calificaciones registradas.</p>
                            ) : (
                                data.notas.map((n: any) => (
                                    <div key={n.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Actividad</p>
                                            <p className="font-bold text-gray-800">{n.actividad?.nombre_actividad}</p>
                                        </div>
                                        <div className={`rounded-lg px-3 py-1 text-xl font-black ${parseFloat(n.nota) >= 11 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                                            {n.nota}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </SectionCard>
                </div>

                {/* Institutional Links (Simpler style) */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { label: 'Mensajería', href: '/mensajeria', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Comunicados', href: '/comunicados', icon: Newspaper, color: 'text-rose-600', bg: 'bg-rose-50' },
                        { label: 'Biblioteca', href: '/alumno/cursos', icon: Folder, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Cursos', href: '/alumno/cursos', icon: BookOpen, color: 'text-gray-600', bg: 'bg-gray-50' },
                    ].map((item, i) => (
                        <Link key={i} href={item.href} className={`flex flex-col items-center justify-center rounded-2xl p-6 text-center transition-all hover:shadow-md ${item.bg}`}>
                            <item.icon className={`mb-3 size-8 ${item.color}`} />
                            <span className="text-xs font-black uppercase tracking-tight text-gray-700">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
