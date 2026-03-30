import { Link } from '@inertiajs/react';
import SectionCard from '@/components/shared/SectionCard';
import { ClipboardCheck, UserPlus, UserCheck, CalendarDays, Search } from 'lucide-react';

const icons: Record<string, any> = {
    'Nueva Matrícula':       ClipboardCheck,
    'Registrar Estudiante':  UserPlus,
    'Registrar Docente':     UserCheck,
    'Ver Asistencia':        CalendarDays,
};

export default function AccesosRapidos() {
    const links = [
        { label: 'Nueva Matrícula',       href: '/matriculas/crear', color: 'text-blue-600',   bg: 'bg-blue-50' },
        { label: 'Registrar Estudiante',  href: '/estudiantes/crear', color: 'text-emerald-600',bg: 'bg-emerald-50' },
        { label: 'Registrar Docente',     href: '/docentes/crear',    color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Ver Asistencia',        href: '/asistencia',        color: 'text-amber-600',  bg: 'bg-amber-50' },
    ];

    return (
        <SectionCard title="Accesos Rápidos">
            <div className="grid grid-cols-2 gap-3">
                {links.map((link) => {
                    const Icon = icons[link.label] || Search;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center justify-center rounded-2xl border border-transparent p-4 text-center transition-all hover:border-gray-100 hover:bg-white hover:shadow-md group ${link.bg}`}
                        >
                            <div className={`mb-3 flex size-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105 ${link.color}`}>
                                <Icon className="size-6" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-tight text-gray-700">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </SectionCard>
    );
}
