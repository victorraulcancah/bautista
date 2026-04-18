import { useState, useEffect, Fragment } from 'react';
import { Download, FileText, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface ActividadCol {
    id: number;
    nombre: string;
    tipo: string;
    tipo_id: number;
}

interface NotaRow {
    actividad_id: number;
    tipo_id: number;
    nota: string;
    observacion: string;
    entregado: boolean;
    puntos_maximos: number;
    peso_porcentaje: number;
}

interface EstudianteUnidad {
    estu_id: number;
    promedio_unidad: number;
    notas: NotaRow[];
}

interface Unidad {
    unidad_id: number;
    titulo: string;
    actividades: ActividadCol[];
    estudiantes: EstudianteUnidad[];
}

interface EstudianteFinal {
    estu_id: number;
    nombre: string;
    promedio: number;
}

interface GradeMatrix {
    curso: string;
    unidades: Unidad[];
    estudiantes: EstudianteFinal[];
    settings: Record<string, unknown>;
}

interface SelectedGrade {
    actividad_id: number;
    estu_id: number;
    nota: string;
    observacion: string;
    entregado: boolean;
    archivo_entrega?: string;
    nombre_student: string;
    nombre_activity: string;
}

interface Props {
    docenteCursoId: number;
}

function getNoteColor(nota: string): string {
    const n = parseFloat(nota);
    if (isNaN(n)) return 'text-gray-300';
    if (n >= 14) return 'text-emerald-600 bg-emerald-50';
    if (n >= 11) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
}

export default function CalificacionesTab({ docenteCursoId }: Props) {
    const [selectedGrade, setSelectedGrade] = useState<SelectedGrade | null>(null);
    const [gradematrix, setGradeMatrix] = useState<GradeMatrix | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>({});
    const [visibleUnits, setVisibleUnits] = useState<Set<number> | null>(null); // null = todas visibles

    useEffect(() => {
        loadGrades();
    }, [docenteCursoId]);

    const loadGrades = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/docente/curso/${docenteCursoId}/calificaciones`);
            const data: GradeMatrix = res.data;
            setGradeMatrix(data);
            // Expand all units by default
            const expanded: Record<number, boolean> = {};
            data.unidades?.forEach(u => { expanded[u.unidad_id] = true; });
            setExpandedUnits(expanded);
        } finally {
            setLoading(false);
        }
    };

    const saveGrade = async () => {
        if (!selectedGrade) return;
        setSaving(true);
        try {
            await api.post(`/actividades/${selectedGrade.actividad_id}/calificar`, {
                notas: [{ estu_id: selectedGrade.estu_id, nota: selectedGrade.nota, obs: selectedGrade.observacion }]
            });
            setSelectedGrade(null);
            loadGrades();
        } finally {
            setSaving(false);
        }
    };

    const downloadExcel = () => {
        window.open(`/api/docente/curso/${docenteCursoId}/exportar-excel`, '_blank');
    };

    const toggleUnit = (unidadId: number) => {
        setExpandedUnits(prev => ({ ...prev, [unidadId]: !prev[unidadId] }));
    };

    const toggleUnitFilter = (unidadId: number) => {
        setVisibleUnits(prev => {
            const all = new Set(gradematrix?.unidades.map(u => u.unidad_id) ?? []);
            const current = prev ?? all;
            const next = new Set(current);
            if (next.has(unidadId)) {
                next.delete(unidadId);
                if (next.size === 0) return all; // si quedó vacío, mostrar todos
            } else {
                next.add(unidadId);
            }
            return next.size === all.size ? null : next; // null = todos activos
        });
    };

    const openGradeModal = (
        estu: EstudianteFinal,
        unidad: Unidad,
        act: ActividadCol,
    ) => {
        const estudianteUnidad = unidad.estudiantes.find(eu => eu.estu_id === estu.estu_id);
        const nota = estudianteUnidad?.notas.find(n => n.actividad_id === act.id);
        setSelectedGrade({
            actividad_id: act.id,
            estu_id: estu.estu_id,
            nota: nota?.nota ?? '',
            observacion: nota?.observacion ?? '',
            entregado: nota?.entregado ?? false,
            nombre_student: estu.nombre,
            nombre_activity: act.nombre,
        });
    };

    const filteredEstudiantes = gradematrix?.estudiantes.filter(e =>
        !search || e.nombre?.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    const filteredUnidades = gradematrix?.unidades.filter(u =>
        !visibleUnits || visibleUnits.has(u.unidad_id)
    ) ?? [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Registro de Notas</h2>
                    <p className="text-gray-500 text-sm">Sábana oficial de calificaciones del curso.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar alumno..."
                            className="pl-9 h-10 rounded-xl border-gray-200 bg-white text-sm w-48 sm:w-56"
                        />
                    </div>
                    <Button
                        onClick={downloadExcel}
                        className="rounded-2xl h-10 px-4 bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-emerald-100 shrink-0"
                    >
                        <Download size={14} /> <span className="hidden sm:inline">Exportar Excel</span>
                    </Button>
                </div>
            </div>

            {/* Filtro de Bimestres */}
            {gradematrix && gradematrix.unidades.length > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">Bimestre:</span>
                    <button
                        onClick={() => setVisibleUnits(null)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            !visibleUnits
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                                : 'bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                    >
                        Todos
                    </button>
                    {filteredUnidades.map(u => {
                        const active = !visibleUnits || visibleUnits.has(u.unidad_id);
                        return (
                            <button
                                key={u.unidad_id}
                                onClick={() => toggleUnitFilter(u.unidad_id)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    active
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                                        : 'bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'
                                }`}
                            >
                                {u.titulo}
                            </button>
                        );
                    })}
                </div>
            )}

            {loading ? (
                <Card className="rounded-[2.5rem] border-none shadow-sm">
                    <div className="p-20 text-center animate-pulse font-black text-emerald-400 uppercase tracking-[0.2em] text-xs">
                        Generando Sábana de Notas...
                    </div>
                </Card>
            ) : !gradematrix || gradematrix.unidades.length === 0 ? (
                <Card className="rounded-[2.5rem] border-none shadow-sm">
                    <div className="p-20 text-center font-bold text-gray-300">No hay datos disponibles</div>
                </Card>
            ) : (
                <>
                    {/* Desktop: tabla con scroll horizontal */}
                    <div className="hidden sm:block">
                        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        {/* Row 1: Unit headers */}
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="p-4 sticky left-0 bg-gray-50 z-10 border-r border-gray-100 min-w-[180px]" />
                                            {filteredUnidades.map(u => (
                                                <th
                                                    key={u.unidad_id}
                                                    colSpan={expandedUnits[u.unidad_id] ? u.actividades.length + 1 : 1}
                                                    className="p-3 text-center border-l border-gray-200 bg-emerald-50/60"
                                                >
                                                    <button
                                                        onClick={() => toggleUnit(u.unidad_id)}
                                                        className="flex items-center gap-1.5 mx-auto font-black text-[10px] uppercase tracking-widest text-emerald-700 hover:text-emerald-900 transition-colors"
                                                    >
                                                        {u.titulo}
                                                        {expandedUnits[u.unidad_id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                    </button>
                                                </th>
                                            ))}
                                            <th className="p-3 text-center border-l border-gray-200 bg-gray-100 min-w-[80px]">
                                                <span className="font-black text-[10px] uppercase tracking-widest text-gray-500">Final</span>
                                            </th>
                                        </tr>
                                        {/* Row 2: Activity + avg column headers */}
                                        <tr className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            <th className="p-4 sticky left-0 bg-gray-50 z-10 border-r border-gray-100">Estudiante</th>
                                            {filteredUnidades.map(u =>
                                                expandedUnits[u.unidad_id] ? (
                                                    <Fragment key={u.unidad_id}>
                                                        {u.actividades.map(a => (
                                                            <th key={a.id} className="p-3 text-center border-l border-gray-100 min-w-[90px] max-w-[110px]">
                                                                <span className="line-clamp-2 leading-tight">{a.nombre}</span>
                                                                <span className="block text-gray-300 normal-case font-medium mt-0.5">{a.tipo}</span>
                                                            </th>
                                                        ))}
                                                        <th className="p-3 text-center border-l border-emerald-100 bg-emerald-50/40 text-emerald-600 min-w-[70px]">
                                                            Prom.
                                                        </th>
                                                    </Fragment>
                                                ) : (
                                                    <th key={u.unidad_id} className="p-3 text-center border-l border-emerald-100 bg-emerald-50/40 text-emerald-600 min-w-[70px]">
                                                        Prom.
                                                    </th>
                                                )
                                            )}
                                            <th className="p-3 text-center border-l border-gray-200 bg-gray-100 text-gray-600">Prom.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredEstudiantes.map(estu => (
                                            <tr key={estu.estu_id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="p-4 sticky left-0 bg-white group-hover:bg-gray-50 font-bold text-gray-700 text-sm border-r border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                                    {estu.nombre}
                                                </td>
                                                {filteredUnidades.map(u => {
                                                    const eu = u.estudiantes.find(x => x.estu_id === estu.estu_id);
                                                    const promedioUnidad = eu?.promedio_unidad ?? 0;
                                                    return expandedUnits[u.unidad_id] ? (
                                                        <Fragment key={u.unidad_id}>
                                                            {u.actividades.map(act => {
                                                                const nota = eu?.notas.find(n => n.actividad_id === act.id);
                                                                return (
                                                                    <td
                                                                        key={act.id}
                                                                        className="p-3 text-center border-l border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                                                                        onClick={() => openGradeModal(estu, u, act)}
                                                                    >
                                                                        <span className={`text-sm font-black px-2 py-1 rounded-lg ${nota?.nota ? getNoteColor(nota.nota) : 'text-gray-200'}`}>
                                                                            {nota?.nota || '-'}
                                                                        </span>
                                                                    </td>
                                                                );
                                                            })}
                                                            <td className="p-3 text-center border-l border-emerald-100 bg-emerald-50/10 font-black">
                                                                <span className={promedioUnidad > 0 ? getNoteColor(String(promedioUnidad)) : 'text-gray-300'}>
                                                                    {promedioUnidad > 0 ? promedioUnidad : '-'}
                                                                </span>
                                                            </td>
                                                        </Fragment>
                                                    ) : (
                                                        <td key={u.unidad_id} className="p-3 text-center border-l border-emerald-100 bg-emerald-50/10 font-black">
                                                            <span className={promedioUnidad > 0 ? getNoteColor(String(promedioUnidad)) : 'text-gray-300'}>
                                                                {promedioUnidad > 0 ? promedioUnidad : '-'}
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                                <td className="p-3 text-center border-l border-gray-200 bg-gray-50/50 font-black text-sm">
                                                    <span className={estu.promedio > 0 ? getNoteColor(String(estu.promedio)) : 'text-gray-300'}>
                                                        {estu.promedio > 0 ? estu.promedio : '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Móvil: cards por alumno */}
                    <div className="sm:hidden space-y-4">
                        {filteredEstudiantes.map(estu => (
                            <Card key={estu.estu_id} className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
                                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                    <p className="font-bold text-gray-800 text-sm">{estu.nombre}</p>
                                    <span className={`text-sm font-black px-3 py-1 rounded-xl ${estu.promedio > 0 ? getNoteColor(String(estu.promedio)) : 'text-gray-300 bg-gray-50'}`}>
                                        {estu.promedio > 0 ? estu.promedio : '-'}
                                    </span>
                                </div>
                                {filteredUnidades.map(u => {
                                    const eu = u.estudiantes.find(x => x.estu_id === estu.estu_id);
                                    const promedioUnidad = eu?.promedio_unidad ?? 0;
                                    return (
                                        <div key={u.unidad_id} className="p-4 space-y-3 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{u.titulo}</p>
                                                <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${promedioUnidad > 0 ? getNoteColor(String(promedioUnidad)) : 'text-gray-300 bg-gray-50'}`}>
                                                    {promedioUnidad > 0 ? promedioUnidad : '-'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {u.actividades.map(act => {
                                                    const nota = eu?.notas.find(n => n.actividad_id === act.id);
                                                    return (
                                                        <button
                                                            key={act.id}
                                                            onClick={() => openGradeModal(estu, u, act)}
                                                            className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-left hover:bg-emerald-50 transition-colors"
                                                        >
                                                            <div className="min-w-0 mr-2">
                                                                <span className="block text-[10px] text-gray-500 font-medium truncate">{act.nombre}</span>
                                                                <span className="block text-[9px] text-gray-300">{act.tipo}</span>
                                                            </div>
                                                            <span className={`text-xs font-black shrink-0 ${nota?.nota ? getNoteColor(nota.nota).split(' ')[0] : 'text-gray-300'}`}>
                                                                {nota?.nota || '-'}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Modal de Calificación Rápida */}
            {selectedGrade && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-md rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">{selectedGrade.nombre_activity}</p>
                            <h3 className="text-xl font-black text-gray-900 leading-tight">{selectedGrade.nombre_student}</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Calificación (0-20)</label>
                                <input
                                    type="number" min="0" max="20"
                                    value={selectedGrade.nota}
                                    onChange={e => setSelectedGrade({ ...selectedGrade, nota: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border-none rounded-2xl px-6 text-2xl font-black text-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                                    placeholder="--"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Observación / Feedback</label>
                                <textarea
                                    value={selectedGrade.observacion}
                                    onChange={e => setSelectedGrade({ ...selectedGrade, observacion: e.target.value })}
                                    className="w-full min-h-[100px] bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold text-gray-600 focus:ring-4 focus:ring-emerald-100 transition-all resize-none outline-none"
                                    placeholder="Escribe un comentario para el estudiante..."
                                />
                            </div>
                        </div>

                        {selectedGrade.entregado && (
                            <div className="p-4 bg-blue-50 rounded-2xl flex items-center justify-between border border-blue-100">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-blue-600" />
                                    <span className="text-xs font-bold text-blue-700">Tarea Entregada</span>
                                </div>
                                {selectedGrade.archivo_entrega && (
                                    <a href={`/storage/${selectedGrade.archivo_entrega}`} target="_blank" className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors">
                                        Descargar
                                    </a>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button variant="ghost" onClick={() => setSelectedGrade(null)}
                                className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] text-gray-400 hover:bg-gray-100">
                                Cancelar
                            </Button>
                            <Button onClick={saveGrade} disabled={saving}
                                className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                                {saving ? 'Guardando...' : 'Guardar Nota'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
