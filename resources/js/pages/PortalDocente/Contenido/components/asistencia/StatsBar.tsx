import { Users, Trophy, AlertCircle } from 'lucide-react';

interface Props {
    promedioAsistencia: number;
    totalEstudiantes: number;
    estudiantesConAsistenciaPerfecta: number;
    estudiantesConFaltas: number;
}

export function StatsBar({ promedioAsistencia, totalEstudiantes, estudiantesConAsistenciaPerfecta, estudiantesConFaltas }: Props) {
    const pctPerfecta = totalEstudiantes > 0
        ? Math.round((estudiantesConAsistenciaPerfecta / totalEstudiantes) * 100)
        : 0;
    const pctFaltas = totalEstudiantes > 0
        ? Math.round((estudiantesConFaltas / totalEstudiantes) * 100)
        : 0;

    return (
        <div className="flex flex-wrap items-stretch border-b border-neutral-100 bg-neutral-50/20 p-6 gap-6">
            {/* Promedio */}
            <div className="flex-1 min-w-[200px] flex items-center gap-5 bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm transition-all hover:shadow-md group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                    <span className="text-white text-base font-black tracking-tighter">
                        {Math.round(promedioAsistencia)}%
                    </span>
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Promedio General</h4>
                    <p className="text-sm font-bold text-neutral-900 mt-1">Asistencia del curso</p>
                </div>
            </div>

            {/* Asistencia perfecta */}
            <div className="flex-1 min-w-[200px] flex items-center gap-5 bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm transition-all hover:shadow-md group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trophy className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-neutral-900">{estudiantesConAsistenciaPerfecta}</span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{pctPerfecta}%</span>
                    </div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Asistencia Perfecta</p>
                </div>
            </div>

            {/* Con faltas */}
            <div className="flex-1 min-w-[200px] flex items-center gap-5 bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm transition-all hover:shadow-md group">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertCircle className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-neutral-900">{estudiantesConFaltas}</span>
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">{pctFaltas}%</span>
                    </div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Registran Faltas</p>
                </div>
            </div>
        </div>
    );
}
