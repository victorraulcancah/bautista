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
import PadreDashboard from './components/PadreDashboard';
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
            .catch((error) => {
                console.error('Error loading dashboard:', error);
                setData(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const roleName = user?.roles?.[0]?.name || 'Usuario';

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
                        {(can('dashboard.stats.instituciones') || can('dashboard.stats.docentes') || 
                          can('dashboard.stats.estudiantes') || can('dashboard.stats.cursos')) && (
                            <StatsCards stats={data} />
                        )}

                        {/* 2. Mensajes y Accesos Rápidos (Modular) */}
                        {(can('dashboard.mensajes.pendientes') || can('dashboard.accesos.rapidos')) && (
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                                {can('dashboard.mensajes.pendientes') && (
                                    <div className="lg:col-span-3">
                                        <NotificacionesPendientes 
                                            messages={data?.mensajes_pendientes ?? []}
                                        />
                                    </div>
                                )}
                                {can('dashboard.accesos.rapidos') && (
                                    <div className="lg:col-span-1">
                                        <AccesosRapidos />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. Vista Docente (Cursos Asignados) */}
                        {can('dashboard.docente.resumen') && data && (
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
                                {can('dashboard.docente.cursos') && (
                                    <DocenteCourses cursos={data.cursos ?? []} />
                                )}
                            </div>
                        )}

                        {/* 4. Vista Estudiante (Resumen Académico) */}
                        {can('dashboard.estudiante.resumen') && data && (
                            <EstudianteStats stats={data.stats} cursos={data.cursos ?? []} />
                        )}

                        {/* 5. Vista Padre (Resumen de Hijos) */}
                        {can('dashboard.padre.resumen') && data && (
                            <PadreDashboard data={data} />
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
