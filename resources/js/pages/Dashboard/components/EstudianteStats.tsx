import SectionCard from '@/components/shared/SectionCard';
import StatCard from '@/components/shared/StatCard';
import { BookOpen, ClipboardList, TrendingUp } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Stats {
    tareas_pendientes: number;
    asistencia_perc: number;
    promedio_general: number;
}

export default function EstudianteStats({ stats, cursos = [] }: { stats: any, cursos?: any[] }) {
    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    title="Tareas Pendientes"
                    value={stats?.tareas_pendientes ?? 0}
                    icon={ClipboardList}
                    color="text-rose-600"
                    iconBg="bg-rose-600"
                />
                <StatCard
                    title="Asistencia General"
                    value={`${stats?.asistencia_perc ?? 0}%`}
                    icon={TrendingUp}
                    color="text-emerald-600"
                    iconBg="bg-emerald-600"
                />
                <StatCard
                    title="Promedio General"
                    value={stats?.promedio_general ?? 0}
                    icon={BookOpen}
                    color="text-blue-600"
                    iconBg="bg-blue-600"
                />
            </div>
            
            <SectionCard title="Cursos en curso">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cursos.map((c: any) => (
                        <div key={c.id} className="p-6 rounded-[2rem] border border-gray-100 hover:border-indigo-100 bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black group-hover:scale-110 transition-transform">
                                    {c.apertura?.nivel?.nombre?.[0] || 'C'}
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 leading-none">{c.apertura?.nivel?.nombre} - {c.apertura?.nombre}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Sede: {c.apertura?.sede?.nombre || 'General'}</p>
                                </div>
                            </div>
                            <Link 
                                href={`/alumno/curso/${c.apertura_id}`}
                                className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all"
                            >
                                <TrendingUp size={16} />
                            </Link>
                        </div>
                    ))}
                    {cursos.length === 0 && (
                        <div className="col-span-full p-10 text-center text-gray-400 font-bold border-2 border-dashed rounded-[2rem]">
                            No tienes cursos matriculados actualmente.
                        </div>
                    )}
                </div>
            </SectionCard>
        </div>
    );
}
