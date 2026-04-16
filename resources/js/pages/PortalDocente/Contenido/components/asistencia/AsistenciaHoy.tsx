/**
 * AsistenciaHoy — tab para marcar la asistencia del día.
 * Responsabilidad: UI de toma de asistencia diaria por clase.
 */
import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlumnoAvatar } from './AlumnoAvatar';
import { EstadoSelector } from './EstadoSelector';
import type { Alumno, Clase, EstadoAsistencia, RegistroHoy } from './types';

interface Props {
    clases: Clase[];   // usado internamente para resolver id_clase_curso
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

    // Inicializar estados cuando llegan los alumnos
    useEffect(() => {
        const defaults: Record<number, EstadoAsistencia> = {};
        alumnos.forEach(a => { defaults[a.estu_id] = 'P'; });
        setEstados(defaults);
    }, [alumnos]);

    const handleEstado = (estuId: number, estado: EstadoAsistencia) => {
        setEstados(prev => ({ ...prev, [estuId]: estado }));
    };

    const handleGuardar = async () => {
        // Usa la primera clase disponible del curso como referencia técnica
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
            <div className="flex items-center justify-center py-24 text-sm text-gray-400 font-medium">
                No hay alumnos matriculados en este curso.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fecha</label>
                    <input
                        type="date"
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                        className="rounded-lg border border-gray-200 h-8 px-3 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                </div>
                <h2 className="text-lg font-black text-gray-900 absolute left-1/2 -translate-x-1/2">Hoy</h2>
                <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                    <span className="text-emerald-600">{resumen.P || 0} P</span>
                    <span className="text-amber-500">{resumen.T || 0} T</span>
                    <span className="text-rose-600">{resumen.F || 0} F</span>
                    <span className="text-blue-500">{resumen.J || 0} J</span>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-y-auto flex-1">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-white z-10 border-b border-gray-100">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 w-[280px]">Estudiante</th>
                            <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 w-[120px]">Hoy</th>
                            <th className="text-center px-2 py-3 text-xs font-bold text-gray-400 w-[80px]">Presente</th>
                            <th className="text-center px-2 py-3 text-xs font-bold text-gray-400 w-[80px]">Atrasado</th>
                            <th className="text-center px-2 py-3 text-xs font-bold text-gray-400 w-[80px]">Ausente</th>
                            <th className="text-center px-2 py-3 text-xs font-bold text-gray-400 w-[80px]">Justificado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {alumnos.map(alumno => {
                            const estado = estados[alumno.estu_id] || 'P';
                            return (
                                <AlumnoRowHoy
                                    key={alumno.estu_id}
                                    alumno={alumno}
                                    estado={estado}
                                    onChange={e => handleEstado(alumno.estu_id, e)}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer guardar */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-white">
                <Button
                    onClick={handleGuardar}
                    disabled={saving}
                    className="h-10 px-8 rounded-xl bg-gray-900 hover:bg-gray-700 font-bold text-sm gap-2"
                >
                    {saving
                        ? <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Save size={14} />
                    }
                    Guardar
                </Button>
            </div>
        </div>
    );
}

// ── Fila individual del tab Hoy ──────────────────────────────────────────────
interface AlumnoRowHoyProps {
    alumno: Alumno;
    estado: EstadoAsistencia;
    onChange: (estado: EstadoAsistencia) => void;
}

function AlumnoRowHoy({ alumno, estado, onChange }: AlumnoRowHoyProps) {
    const ESTADOS: EstadoAsistencia[] = ['P', 'T', 'F', 'J'];

    return (
        <tr className="hover:bg-gray-50/60 transition-colors">
            {/* Nombre */}
            <td className="px-6 py-3">
                <div className="flex items-center gap-3">
                    <AlumnoAvatar nombre={alumno.nombre} foto={alumno.foto} />
                    <span className="text-sm font-semibold text-gray-800 uppercase leading-tight">
                        {alumno.nombre}
                    </span>
                </div>
            </td>

            {/* Badge estado actual */}
            <td className="px-4 py-3 text-center">
                <button
                    onClick={() => {
                        const idx = ESTADOS.indexOf(estado);
                        onChange(ESTADOS[(idx + 1) % ESTADOS.length]);
                    }}
                    className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold min-w-[60px] hover:bg-gray-700 transition-colors"
                >
                    {estado === 'P' ? 'P' : estado === 'T' ? 'T' : estado === 'F' ? 'F' : 'J'}
                </button>
            </td>

            {/* Columnas de estado — click para seleccionar */}
            {ESTADOS.map(e => (
                <td key={e} className="px-2 py-3 text-center">
                    <button
                        onClick={() => onChange(e)}
                        className={`transition-colors ${
                            estado === e
                                ? e === 'P' ? 'text-emerald-600'
                                : e === 'T' ? 'text-amber-500'
                                : e === 'F' ? 'text-rose-600'
                                : 'text-blue-500'
                                : 'text-gray-200 hover:text-gray-400'
                        }`}
                    >
                        {e === 'P' && <span className="text-lg font-bold">✓</span>}
                        {e === 'T' && <span className="text-lg">⏱</span>}
                        {e === 'F' && <span className="text-lg font-bold">✕</span>}
                        {e === 'J' && <span className="text-lg">⊘</span>}
                    </button>
                </td>
            ))}
        </tr>
    );
}
