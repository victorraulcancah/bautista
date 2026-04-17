import { useState, useEffect } from 'react';
import { Save, UserCheck, Clock, UserX, ShieldCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlumnoAvatar } from './AlumnoAvatar';
import type { Alumno, Clase, EstadoAsistencia, RegistroHoy } from './types';

interface Props {
    clases: Clase[];
    alumnos: Alumno[];
    onGuardar: (claseId: number, fecha: string, registros: RegistroHoy[]) => Promise<void>;
    saving: boolean;
}

const HOY = new Date().toISOString().split('T')[0];

export function AsistenciaHoy({ clases, alumnos, onGuardar, saving }: Props) {
    const [fecha, setFecha] = useState(HOY);
    const [estados, setEstados] = useState<Record<number, EstadoAsistencia>>(() => {
        const defaults: Record<number, EstadoAsistencia> = {};
        alumnos.forEach(a => { defaults[a.estu_id] = 'P'; });
        return defaults;
    });

    useEffect(() => {
        const defaults: Record<number, EstadoAsistencia> = {};
        alumnos.forEach(a => { defaults[a.estu_id] = 'P'; });
        setEstados(defaults);
    }, [alumnos]);

    const handleEstado = (estuId: number, estado: EstadoAsistencia) => {
        setEstados(prev => ({ ...prev, [estuId]: estado }));
    };

    const handleGuardar = async () => {
        const claseId = clases[0]?.clase_id;
        if (!claseId) return;
        const registros: RegistroHoy[] = alumnos.map(a => ({
            estu_id: a.estu_id,
            estado: estados[a.estu_id] || 'P',
        }));
        await onGuardar(claseId, fecha, registros);
    };

    const resumen = (alumnos ?? []).reduce((acc, a) => {
        const e = estados[a.estu_id] || 'P';
        acc[e] = (acc[e] || 0) + 1;
        return acc;
    }, {} as Record<EstadoAsistencia, number>);

    if (!alumnos.length) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center border border-dashed border-neutral-200">
                    <UserX className="h-6 w-6 text-neutral-300" />
                </div>
                <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">No hay alumnos matriculados</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header modernizado */}
            <div className="flex flex-wrap items-center justify-between px-8 py-5 border-b border-neutral-100 gap-4">
                <div className="flex items-center gap-4 bg-neutral-50 p-1.5 rounded-2xl border border-neutral-200">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-3">Fecha</label>
                    <input
                        type="date"
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                        className="rounded-xl border-none h-9 px-4 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <SummaryBadge label="P" count={resumen.P || 0} color="emerald" icon={UserCheck} />
                    <SummaryBadge label="T" count={resumen.T || 0} color="amber" icon={Clock} />
                    <SummaryBadge label="F" count={resumen.F || 0} color="rose" icon={UserX} />
                    <SummaryBadge label="J" count={resumen.J || 0} color="blue" icon={ShieldCheck} />
                </div>
            </div>

            {/* Tabla Premium */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full border-separate border-spacing-0">
                    <thead className="sticky top-0 bg-white z-10">
                        <tr className="bg-neutral-50/80 backdrop-blur-sm">
                            <th className="text-left px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100">Estudiante</th>
                            <th className="text-center px-4 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100">Rápido</th>
                            <th className="text-center px-2 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100">Presente</th>
                            <th className="text-center px-2 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100">Tardanza</th>
                            <th className="text-center px-2 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100">Falta</th>
                            <th className="text-center px-2 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100">Justif.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {alumnos.map(alumno => (
                            <AlumnoRowHoy
                                key={alumno.estu_id}
                                alumno={alumno}
                                estado={estados[alumno.estu_id] || 'P'}
                                onChange={e => handleEstado(alumno.estu_id, e)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer con botón premium */}
            <div className="px-8 py-5 border-t border-neutral-100 flex justify-end bg-neutral-50/30">
                <Button
                    onClick={handleGuardar}
                    disabled={saving}
                    className="h-11 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest gap-3 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                >
                    {saving ? (
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Check className="h-4 w-4" strokeWidth={3} />
                    )}
                    Guardar Asistencia
                </Button>
            </div>
        </div>
    );
}

function SummaryBadge({ label, count, color, icon: Icon }: { label: string, count: number, color: 'emerald' | 'amber' | 'rose' | 'blue', icon: any }) {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
    };

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs ${colors[color]}`}>
            <Icon className="h-3.5 w-3.5" />
            <span>{count}</span>
        </div>
    );
}

interface AlumnoRowHoyProps {
    alumno: Alumno;
    estado: EstadoAsistencia;
    onChange: (estado: EstadoAsistencia) => void;
}

function AlumnoRowHoy({ alumno, estado, onChange }: AlumnoRowHoyProps) {
    const ESTADOS: { val: EstadoAsistencia, icon: any, color: string }[] = [
        { val: 'P', icon: UserCheck, color: 'text-emerald-600' },
        { val: 'T', icon: Clock, color: 'text-amber-500' },
        { val: 'F', icon: UserX, color: 'text-rose-600' },
        { val: 'J', icon: ShieldCheck, color: 'text-blue-500' },
    ];

    return (
        <tr className="group hover:bg-indigo-50/30 transition-all duration-200">
            <td className="px-8 py-4">
                <div className="flex items-center gap-4">
                    <AlumnoAvatar nombre={alumno.nombre} foto={alumno.foto} />
                    <span className="text-xs font-bold text-neutral-900 uppercase tracking-tight group-hover:translate-x-1 transition-transform">
                        {alumno.nombre}
                    </span>
                </div>
            </td>

            <td className="px-4 py-4 text-center">
                <button
                    onClick={() => {
                        const idx = ESTADOS.findIndex(e => e.val === estado);
                        onChange(ESTADOS[(idx + 1) % ESTADOS.length].val);
                    }}
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl transition-all shadow-sm border
                        ${estado === 'P' ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-100' : 
                          estado === 'T' ? 'bg-amber-500 text-white border-amber-400 shadow-amber-100' : 
                          estado === 'F' ? 'bg-rose-600 text-white border-rose-500 shadow-rose-100' : 
                          'bg-blue-500 text-white border-blue-400 shadow-blue-100'}`}
                >
                    {estado}
                </button>
            </td>

            {ESTADOS.map(e => {
                const Icon = e.icon;
                const isActive = estado === e.val;
                return (
                    <td key={e.val} className="px-2 py-4 text-center">
                        <button
                            onClick={() => onChange(e.val)}
                            className={`p-2.5 rounded-xl transition-all duration-300
                                ${isActive ? `${e.color} bg-white shadow-md border border-neutral-100 scale-110` : 'text-neutral-200 hover:text-neutral-400 hover:bg-neutral-50'}`}
                        >
                            <Icon className="h-5 w-5" strokeWidth={isActive ? 3 : 2} />
                        </button>
                    </td>
                );
            })}
        </tr>
    );
}
