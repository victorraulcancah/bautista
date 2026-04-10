import { BookOpen, Building2, GraduationCap, UserCheck } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import type { DashboardStats } from '../hooks/useDashboard';

const cards = [
    { title: 'Institución',  key: 'total_instituciones' as const, icon: Building2,     color: 'text-cyan-500',   iconBg: 'bg-cyan-500',   href: '/institucion' },
    { title: 'Docentes',     key: 'total_docentes'      as const, icon: UserCheck,     color: 'text-purple-600', iconBg: 'bg-purple-600', href: '/docentes' },
    { title: 'Estudiantes',  key: 'total_estudiantes'   as const, icon: GraduationCap, color: 'text-yellow-500', iconBg: 'bg-yellow-500', href: '/estudiantes' },
    { title: 'Cursos',       key: 'total_cursos'        as const, icon: BookOpen,      color: 'text-red-500',    iconBg: 'bg-red-500',    href: '/cursos' },
];

export default function StatsCards({ stats }: { stats: DashboardStats }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <StatCard
                    key={card.key}
                    title={card.title}
                    value={stats[card.key]}
                    icon={card.icon}
                    color={card.color}
                    iconBg={card.iconBg}
                    href={card.href}
                />
            ))}
        </div>
    );
}
