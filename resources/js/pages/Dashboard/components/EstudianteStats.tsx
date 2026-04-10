import SectionCard from '@/components/shared/SectionCard';
import StatCard from '@/components/shared/StatCard';
import { BookOpen, ClipboardList, TrendingUp } from 'lucide-react';

interface Stats {
    tareas_pendientes: number;
    asistencia_perc: number;
    promedio_general: number;
}

export default function EstudianteStats({ stats }: { stats: Stats }) {
    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    title="Tareas Pendientes"
                    value={stats.tareas_pendientes}
                    icon={ClipboardList}
                    color="text-rose-600"
                    iconBg="bg-rose-600"
                />
                <StatCard
                    title="Asistencia General"
                    value={`${stats.asistencia_perc}%`}
                    icon={TrendingUp}
                    color="text-emerald-600"
                    iconBg="bg-emerald-600"
                />
                <StatCard
                    title="Promedio General"
                    value={stats.promedio_general}
                    icon={BookOpen}
                    color="text-blue-600"
                    iconBg="bg-blue-600"
                />
            </div>
            
            <SectionCard title="Cursos en curso">
                <div className="p-4 text-center text-gray-500 italic border border-dashed rounded-xl">
                    Próximamente: Lista detallada de progreso por curso.
                </div>
            </SectionCard>
        </div>
    );
}
