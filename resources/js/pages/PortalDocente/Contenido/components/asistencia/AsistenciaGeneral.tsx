/**
 * AsistenciaGeneral — tab de historial general con matriz de asistencia.
 * Responsabilidad: mostrar la vista matricial con scroll horizontal y estadísticas.
 */
import { useMemo } from 'react';
import { Check, X, Clock, Ban } from 'lucide-react';
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
            <div className="flex flex-col items-center gap-0.5 text-gray-300">
                <span className="text-xs">—</span>
            </div>
        );
    }

    const config = {
        P: { icon: <Check size={16} strokeWidth={2.5} className="text-gray-700" />, label: 'Presente',    text: 'text-gray-500' },
        T: { icon: <Clock size={15} strokeWidth={2}   className="text-amber-500" />, label: 'Atrasado',   text: 'text-amber-500' },
        F: { icon: <X     size={16} strokeWidth={2.5} className="text-rose-600"  />, label: 'Ausente',    text: 'text-rose-500' },
        J: { icon: <Ban   size={15} strokeWidth={2}   className="text-blue-400"  />, label: 'Justificado',text: 'text-blue-400' },
    }[estado];

    return (
        <div className="flex flex-col items-center gap-0.5">
            {config.icon}
            <span className={`text-[10px] font-medium ${config.text}`}>{config.label}</span>
        </div>
    );
}

function PorcentajeBadge({ pct }: { pct: number }) {
    const label = `${pct} / 100`;
    const isZero = pct === 0;
    return (
        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black text-white min-w-[80px]
            ${isZero ? 'bg-gray-900' : 'bg-gray-900'}`}>
            {label}
        </span>
    );
}

function fmtFecha(fecha: string) {
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', year: '2-digit' });
}

export function AsistenciaGeneral({ records, stats, loading }: Props) {
    const { students, dates, matrix } = useMemo(() => {
        if (!records.length) return { students: [], dates: [], matrix: {} };

        // Deduplicar fechas (puede haber múltiples sesiones el mismo día)
        const datesArr = [...new Set(records.map(r => r.fecha))];

        const studentsMap: Record<number, string> = {};
        records.forEach(r => r.estudiantes.forEach(e => { studentsMap[e.estu_id] = e.nombre; }));

        const studentsArr = Object.entries(studentsMap)
            .map(([id, nombre]) => ({ estu_id: Number(id), nombre }))
            .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

        const mat: Record<number, Record<string, EstadoAsistencia>> = {};
        records.forEach(r => r.estudiantes.forEach(e => {
            if (!mat[e.estu_id]) mat[e.estu_id] = {};
            // Si ya hay un registro para esa fecha, priorizar F sobre P (más conservador)
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
        const presentes = Object.values(row).filter(v => v === 'P').length;
        return Math.round((presentes / total) * 100);
    };

    const statsCalculados = useMemo(() => {
        if (!students.length || !dates.length) return { perfecta: 0, conFaltas: 0 };
        const perfecta = students.filter(s => getStudentPct(s.estu_id) === 100).length;
        const conFaltas = students.filter(s => {
            const row = matrix[s.estu_id] || {};
            return Object.values(row).some(v => v === 'F');
        }).length;
        return { perfecta, conFaltas };
    }, [students, dates, matrix]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="size-10 border-4 border-gray-100 border-t-gray-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!students.length) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sin registros</p>
                <p className="text-xs text-gray-300">No hay sesiones de asistencia registradas aún.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Stats bar */}
            {stats && (
                <StatsBar
                    promedioAsistencia={stats.promedioAsistencia}
                    totalEstudiantes={stats.totalEstudiantes}
                    estudiantesConAsistenciaPerfecta={statsCalculados.perfecta}
                    estudiantesConFaltas={statsCalculados.conFaltas}
                />
            )}

            {/* Matriz: scroll vertical Y horizontal */}
            <div className="overflow-auto" style={{ maxHeight: '65vh' }}>
                <table className="border-collapse" style={{ minWidth: `${280 + 120 + dates.length * 110}px` }}>
                    <thead className="sticky top-0 bg-white z-10 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 sticky left-0 bg-white z-20 border-r border-gray-100 w-[280px]">
                                Estudiante
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 w-[120px] border-r border-gray-100">
                                General
                            </th>
                            {dates.map(fecha => (
                                <th key={fecha} className="text-center px-4 py-3 text-xs font-bold text-gray-500 w-[110px]">
                                    {fmtFecha(fecha)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.map((student, idx) => {
                            const pct = getStudentPct(student.estu_id);
                            return (
                                <tr key={student.estu_id} className={`hover:bg-gray-50/50 transition-colors ${idx % 2 !== 0 ? 'bg-gray-50/20' : 'bg-white'}`}>
                                    {/* Nombre — sticky */}
                                    <td className="px-6 py-3 sticky left-0 bg-inherit z-10 border-r border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <AlumnoAvatar nombre={student.nombre} size="sm" />
                                            <span className="text-xs font-bold text-gray-800 uppercase leading-tight">
                                                {student.nombre}
                                            </span>
                                        </div>
                                    </td>

                                    {/* % General */}
                                    <td className="px-4 py-3 text-center border-r border-gray-100">
                                        <PorcentajeBadge pct={pct} />
                                    </td>

                                    {/* Celdas por fecha */}
                                    {dates.map(fecha => {
                                        const estado = matrix[student.estu_id]?.[fecha];
                                        const sinRegistro = !estado;
                                        return (
                                            <td key={fecha} className={`px-4 py-3 text-center ${sinRegistro ? 'bg-gray-50/60' : ''}`}>
                                                {sinRegistro
                                                    ? <span className="text-xs text-blue-500 font-medium cursor-pointer hover:underline">Marcar</span>
                                                    : <EstadoCelda estado={estado} />
                                                }
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
