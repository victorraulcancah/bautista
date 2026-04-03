import { Head } from '@inertiajs/react';
import { Star, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import SectionCard from '@/components/shared/SectionCard';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Portal', href: '/alumno/dashboard' },
    { title: 'Mis Calificaciones', href: '/alumno/notas' },
];

export default function AlumnoNotasPage() {
    const [notas, setNotas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/alumno/notas')
            .then(res => setNotas(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-center font-black animate-pulse text-amber-500">Cargando tus calificaciones...</div>;

    const promedio = (notas.length > 0) ? (notas.reduce((acc, n) => acc + parseFloat(n.nota), 0) / (notas.length)).toFixed(1) : '---';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Notas" />

            <div className="flex flex-col gap-8 p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
                    <PageHeader 
                        icon={Star}
                        title="Mis Calificaciones"
                        subtitle="Tu desempeño académico actualizado en tiempo real."
                        iconColor="bg-amber-500"
                    />

                    <div className="w-full md:w-72">
                        <StatCard 
                            title="Promedio General"
                            value={promedio}
                            icon={TrendingUp}
                            color={parseFloat(promedio) >= 11 ? 'text-blue-600' : 'text-red-600'}
                            iconBg="bg-amber-500"
                            href="/alumno/notas"
                        />
                    </div>
                </div>

                <SectionCard title="Historial de Calificaciones">
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <th className="px-6 py-4">Actividad / Evaluación</th>
                                    <th className="px-6 py-4 text-center">Nota</th>
                                    <th className="px-6 py-4">Comentario</th>
                                    <th className="px-6 py-4 text-right">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {notas.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-gray-400 italic">No hay registros aún</td>
                                    </tr>
                                ) : (
                                    notas.map((n: any) => (
                                        <tr key={n.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{n.actividad?.nombre_actividad}</p>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{n.actividad?.tipo?.nombre}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex h-9 w-12 items-center justify-center rounded-lg text-lg font-black ${parseFloat(n.nota) >= 11 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                                                    {n.nota}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-gray-600 line-clamp-1 italic">{n.observacion || 'Sin comentarios'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-400 font-bold text-[10px]">
                                                {new Date(n.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                <div className="flex items-center gap-4 rounded-xl bg-blue-50 p-6 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    <AlertCircle className="size-6 shrink-0" />
                    <div>
                        <p className="text-sm font-bold uppercase tracking-tight">Nota Informativa</p>
                        <p className="text-xs font-medium opacity-80">Los promedios se cierran al finalizar cada bimestre.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
