import { useMemo } from 'react';
import { UserCheck, Clock, UserX, ShieldCheck, SearchX } from 'lucide-react';
import { AlumnoAvatar } from './AlumnoAvatar';
import { StatsBar } from './StatsBar';
import type { SesionHistorial, EstadoAsistencia } from './types';

interface Props {
    records: SesionHistorial[];
    stats: {
        totalClases: number;
        totalEstudiantes: number;
        promedioAsistencia: number;
        totalFaltas: number;
    } | null;
    loading: boolean;
}

function EstadoCelda({ estado }: { estado?: EstadoAsistencia }) {
    if (!estado) {
        return (
            <div className="flex flex-col items-center gap-1 text-neutral-200">
                <span className="text-[10px] font-bold tracking-widest">—</span>
            </div>
        );
    }

    const config = {
        P: { icon: <UserCheck size={16} strokeWidth={2.5} className="text-emerald-600" />, label: 'Presente', bg: 'bg-emerald-50' },
        T: { icon: <Clock size={16} strokeWidth={2.5} className="text-amber-500" />, label: 'Tardanza', bg: 'bg-amber-50' },
        F: { icon: <UserX size={16} strokeWidth={2.5} className="text-rose-600" />, label: 'Falta', bg: 'bg-rose-50' },
        J: { icon: <ShieldCheck size={16} strokeWidth={2.5} className="text-blue-500" />, label: 'Justif.', bg: 'bg-blue-50' },
    }[estado];

    return (
        <div className={`inline-flex flex-col items-center justify-center w-full min-h-[44px] rounded-xl transition-all duration-300 hover:scale-110`}>
            {config.icon}
            <span className={`text-[8px] font-black uppercase tracking-tighter mt-0.5 opacity-60`}>{config.label}</span>
        </div>
    );
}

function PorcentajeBadge({ pct }: { pct: number }) {
    const isPerfect = pct === 100;
    const isWarning = pct < 80;
    const isDanger = pct < 60;

    return (
        <div className={`relative inline-flex items-center justify-center px-4 py-2 rounded-2xl font-black text-xs shadow-sm border
            ${isPerfect ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-100' : 
              isDanger ? 'bg-rose-600 text-white border-rose-500 shadow-rose-100' :
              isWarning ? 'bg-amber-500 text-white border-amber-400 shadow-amber-100' :
              'bg-indigo-600 text-white border-indigo-500 shadow-indigo-100'}`}>
            {pct}%
        </div>
    );
}

function fmtFecha(fecha: string) {
    const d = new Date(fecha + 'T00:00:00');
    return (
        <div className="flex flex-col items-center leading-tight">
            <span className="text-[10px] font-black uppercase text-neutral-400">{d.toLocaleDateString('es-PE', { weekday: 'short' })}</span>
            <span className="text-xs font-bold text-neutral-900">{d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })}</span>
        </div>
    );
}

export function AsistenciaGeneral({ records, stats, loading }: Props) {
    const { students, dates, matrix } = useMemo(() => {
        if (!records.length) return { students: [], dates: [], matrix: {} };

        const datesArr = [...new Set(records.map(r => r.fecha))].sort().reverse();

        const studentsMap: Record<number, string> = {};
        records.forEach(r => r.estudiantes.forEach(e => { studentsMap[e.estu_id] = e.nombre; }));

        const studentsArr = Object.entries(studentsMap)
            .map(([id, nombre]) => ({ estu_id: Number(id), nombre }))
            .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

        const mat: Record<number, Record<string, EstadoAsistencia>> = {};
        records.forEach(r => r.estudiantes.forEach(e => {
            if (!mat[e.estu_id]) mat[e.estu_id] = {};
            const existing = mat[e.estu_id][r.fecha];
            if (!existing || e.estado === 'F' || (e.estado === 'T' && existing === 'P')) {
                mat[e.estu_id][r.fecha] = e.estado;
            }
        }));

        return { students: studentsArr, dates: datesArr, matrix: mat };
    }, [records]);

    const getStudentPct = (estuId: number): number => {
        const row = matrix[estuId] || {};
        const total = dates.length;
        if (!total) return 100;
        const presentes = Object.values(row).filter(v => ['P', 'J'].includes(v)).length;
        return Math.round((presentes / total) * 100);
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="size-10 border-4 border-neutral-100 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!students.length) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
                <div className="w-20 h-20 rounded-3xl bg-neutral-50 flex items-center justify-center border border-dashed border-neutral-200">
                    <SearchX className="h-8 w-8 text-neutral-300" />
                </div>
                <div className="text-center">
                    <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">Sin registros históricos</p>
                    <p className="text-[10px] text-neutral-300 font-bold uppercase tracking-wider mt-1">No hay sesiones registradas aún</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {stats && (
                <StatsBar
                    promedioAsistencia={stats.promedioAsistencia}
                    totalEstudiantes={stats.totalEstudiantes}
                    estudiantesConAsistenciaPerfecta={students.filter(s => getStudentPct(s.estu_id) === 100).length}
                    estudiantesConFaltas={students.filter(s => Object.values(matrix[s.estu_id] || {}).some(v => v === 'F')).length}
                />
            )}

            <div className="overflow-auto border-t border-neutral-100 custom-scrollbar" style={{ maxHeight: '65vh' }}>
                <table className="border-separate border-spacing-0 w-full">
                    <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-30">
                        <tr>
                            <th className="text-left px-8 py-5 sticky left-0 bg-white z-40 border-b border-r border-neutral-100 min-w-[300px] shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Estudiante</span>
                            </th>
                            <th className="text-center px-4 py-5 border-b border-r border-neutral-100 min-w-[120px]">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Global</span>
                            </th>
                            {dates.map(fecha => (
                                <th key={fecha} className="text-center px-4 py-5 border-b border-neutral-100 min-w-[100px]">
                                    {fmtFecha(fecha)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {students.map((student) => {
                            const pct = getStudentPct(student.estu_id);
                            return (
                                <tr key={student.estu_id} className="group hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-8 py-4 sticky left-0 bg-white group-hover:bg-neutral-50 z-20 border-r border-neutral-100 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                                        <div className="flex items-center gap-4">
                                            <AlumnoAvatar nombre={student.nombre} size="sm" />
                                            <span className="text-xs font-bold text-neutral-900 uppercase tracking-tight group-hover:translate-x-1 transition-transform truncate max-w-[200px]">
                                                {student.nombre}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 text-center border-r border-neutral-100 font-mono">
                                        <PorcentajeBadge pct={pct} />
                                    </td>

                                    {dates.map(fecha => {
                                        const estado = matrix[student.estu_id]?.[fecha];
                                        return (
                                            <td key={fecha} className={`px-2 py-4 text-center transition-colors ${!estado ? 'bg-neutral-50/30' : ''}`}>
                                                <EstadoCelda estado={estado} />
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
