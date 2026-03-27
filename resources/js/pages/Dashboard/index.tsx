import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/shared/PageHeader';
import type { BreadcrumbItem } from '@/types';
import api from '@/lib/api';
import AccesosRapidos from './components/AccesosRapidos';
import NotificacionesPendientes from './components/NotificacionesPendientes';
import StatsCards from './components/StatsCards';
import type { DashboardStats } from './hooks/useDashboard';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        api.get('/dashboard/stats').then(({ data }) => setStats(data));
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-6">
                <PageHeader
                    icon={TrendingUp}
                    title="Panel de Control"
                    subtitle="IEP Bautista La Pascana"
                />
                {stats !== null ? <StatsCards stats={stats} /> : null}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <NotificacionesPendientes />
                    <AccesosRapidos />
                </div>
            </div>
        </AppLayout>
    );
}
