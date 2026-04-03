import { Head, Link } from '@inertiajs/react';
import { BookOpen, Users, GraduationCap, QrCode, MessageSquare, Library, UserCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import SectionCard from '@/components/shared/SectionCard';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel Docente', href: '/docente/dashboard' },
];

const accesos = [
    { label: 'Mis Alumnos',   href: '/docente/mis-alumnos',   icon: Users,        color: 'text-blue-600',    bg: 'bg-blue-50' },
    { label: 'Scanner QR',    href: '/asistencia/scanner',    icon: QrCode,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Mensajes',      href: '/mensajeria',            icon: MessageSquare,color: 'text-purple-600',  bg: 'bg-purple-50' },
    { label: 'Biblioteca',    href: '/biblioteca',            icon: Library,      color: 'text-amber-600',   bg: 'bg-amber-50' },
];

export default function DocenteDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.get('/docente/dashboard')
            .then(res => setData(res.data))
            .catch(() => setError('No se pudo cargar la información del panel.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel Docente" />

            <div className="flex flex-col gap-8 p-6">
                <PageHeader
                    icon={UserCheck}
                    title="Panel de Control"
                    subtitle="Portal del Docente"
                    iconColor="bg-indigo-600"
                />

                {loading && (
                    <div className="p-10 text-center font-bold text-indigo-600 animate-pulse">
                        Cargando panel...
                    </div>
                )}

                {error && (
                    <div className="p-6 bg-red-50 text-red-600 rounded-xl font-medium">{error}</div>
                )}

                {!loading && !error && data && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <StatCard
                                title="Materias Asignadas"
                                value={data.resumen.cursos}
                                icon={BookOpen}
                                color="text-blue-600"
                                iconBg="bg-blue-600"
                                href="/docente/mis-cursos"
                            />
                            <StatCard
                                title="Total Estudiantes"
                                value={data.resumen.estudiantes}
                                icon={Users}
                                color="text-purple-600"
                                iconBg="bg-purple-600"
                                href="/docente/mis-alumnos"
                            />
                            <StatCard
                                title="Pendientes por Calificar"
                                value={data.resumen.pendientes_calificar}
                                icon={GraduationCap}
                                color="text-rose-600"
                                iconBg="bg-rose-600"
                                href="/docente/mis-cursos"
                            />
                        </div>

                        {/* Mis Cursos + Accesos Rápidos */}
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                            <div className="lg:col-span-3">
                                <SectionCard title="Mis Cursos Actuales">
                                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="bg-[#00a65a] text-white">
                                                    <th className="px-4 py-3.5 font-black uppercase tracking-wider">Curso</th>
                                                    <th className="px-4 py-3.5 font-black uppercase tracking-wider">Grado</th>
                                                    <th className="px-4 py-3.5 font-black uppercase tracking-wider">Sección</th>
                                                    <th className="px-4 py-3.5 font-black uppercase tracking-wider text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {data.cursos.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-4 py-12 text-center text-gray-400 italic">
                                                            No tienes cursos asignados aún.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    data.cursos.map((c: any) => (
                                                        <tr key={c.docen_curso_id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-4 py-3 font-bold text-gray-900">{c.curso?.nombre}</td>
                                                            <td className="px-4 py-3 text-gray-600">{c.seccion?.grado?.nombre_grado}</td>
                                                            <td className="px-4 py-3 text-gray-600">{c.seccion?.nombre}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <Link
                                                                    href={`/docente/cursos/${c.docen_curso_id}/contenido`}
                                                                    className="inline-flex items-center justify-center rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white"
                                                                >
                                                                    Ver contenido
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </SectionCard>
                            </div>

                            <div className="lg:col-span-1">
                                <SectionCard title="Accesos Rápidos">
                                    <div className="grid grid-cols-2 gap-3">
                                        {accesos.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex flex-col items-center justify-center rounded-2xl border border-transparent p-4 text-center transition-all hover:border-gray-100 hover:bg-white hover:shadow-md group ${item.bg}`}
                                            >
                                                <div className={`mb-3 flex size-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105 ${item.color}`}>
                                                    <item.icon className="size-6" />
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-tight text-gray-700">{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </SectionCard>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
