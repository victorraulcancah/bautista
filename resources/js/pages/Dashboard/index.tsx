import { Head, Link } from '@inertiajs/react';
import { LayoutDashboard, TrendingUp, Users, UserCheck, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import AccesosRapidos from './components/AccesosRapidos';
import NotificacionesPendientes from './components/NotificacionesPendientes';
import StatsCards from './components/StatsCards';
import DocenteCourses from './components/DocenteCourses';
import EstudianteStats from './components/EstudianteStats';
import { usePermission } from '@/hooks/usePermission';
import StatCard from '@/components/shared/StatCard';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard() {
    const { can, user } = usePermission();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard/stats')
            .then(({ data }) => setData(data))
            .finally(() => setLoading(false));
    }, []);

    const roleName = user?.roles?.[0] || 'Usuario';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-8 p-6">
                <PageHeader
                    icon={LayoutDashboard}
                    title="Panel de Control"
                    subtitle={`Bienvenido, ${user?.name} (${roleName})`}
                />

                {loading ? (
                    <div className="flex items-center justify-center p-20 text-indigo-600 animate-pulse font-bold">
                        Cargando panel...
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {/* 1. Estadísticas Globales (Admin/Auxiliar) */}
                        {can('dashboard.periodo.global') && <StatsCards stats={data} />}

                        {/* 2. Mensajes y Accesos Rápidos (Modular) */}
                        {(can('dashboard.mensajes.recientes') || can('dashboard.accesos.admin')) && (
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                                {can('dashboard.mensajes.recientes') && (
                                    <div className="lg:col-span-3">
                                        <NotificacionesPendientes 
                                            messages={data?.mensajes_pendientes ?? []}
                                        />
                                    </div>
                                )}
                                {can('dashboard.accesos.admin') && (
                                    <div className="lg:col-span-1">
                                        <AccesosRapidos />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. Vista Docente (Cursos Asignados) */}
                        {can('dashboard.cursos.asignados') && data && (
                            <div className="flex flex-col gap-8">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <StatCard
                                        title="Materias Asignadas"
                                        value={data.resumen?.cursos ?? 0}
                                        icon={BookOpen}
                                        color="text-blue-600"
                                        iconBg="bg-blue-600"
                                        href="/docente/mis-cursos"
                                    />
                                    <StatCard
                                        title="Total Estudiantes"
                                        value={data.resumen?.estudiantes ?? 0}
                                        icon={Users}
                                        color="text-purple-600"
                                        iconBg="bg-purple-600"
                                        href="/docente/mis-alumnos"
                                    />
                                    <StatCard
                                        title="Pendientes por Calificar"
                                        value={data.resumen?.pendientes_calificar ?? 0}
                                        icon={UserCheck}
                                        color="text-rose-600"
                                        iconBg="bg-rose-600"
                                    />
                                </div>
                                <DocenteCourses cursos={data.cursos ?? []} />
                            </div>
                        )}

                        {/* 4. Vista Estudiante (Resumen Académico) */}
                        {can('dashboard.resumen.academico') && data && (
                            <EstudianteStats stats={data.stats} />
                        )}

                        {/* 5. Vista Padre (Resumen de Hijos) */}
                        {can('dashboard.resumen.familiar') && data && (
                            <div className="p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Panel de Familia</h3>
                                <p className="text-gray-500">Aquí verás el resumen de tus {data.hijos?.length ?? 0} hijos.</p>
                                <Link href="/padre/dashboard" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">
                                    Ir a gestión de hijos →
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
