import { useState, useEffect } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface GradeMatrix {
    actividades: any[];
    estudiantes: any[];
}

interface Props {
    docenteCursoId: number;
}

export default function CalificacionesTab({ docenteCursoId }: Props) {
    const [selectedGrade, setSelectedGrade] = useState<any>(null);
    const [gradematrix, setGradeMatrix] = useState<GradeMatrix | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadGrades();
    }, [docenteCursoId]);

    const loadGrades = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/docente/curso/${docenteCursoId}/calificaciones`);
            setGradeMatrix(res.data);
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
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

            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                {loading ? (
                    <div className="p-20 text-center animate-pulse font-black text-emerald-400 uppercase tracking-[0.2em] text-xs">
                        Generando Sábana de Notas...
                    </div>
                ) : gradematrix ? (
                    <>
                        {/* Desktop: tabla con scroll horizontal */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 sticky left-0 bg-gray-50 z-10 border-r border-gray-100 min-w-[160px]">Estudiante</th>
                                        {gradematrix.actividades.map((a: any) => (
                                            <th key={a.id} className="p-4 text-center border-l border-gray-100 min-w-[100px] max-w-[120px]">
                                                <span className="line-clamp-2 text-[9px]">{a.nombre}</span>
                                            </th>
                                        ))}
                                        <th className="p-4 text-center border-l bg-emerald-50/50 text-emerald-600 min-w-[70px]">PROM.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {gradematrix.estudiantes
                                        .filter((e: any) => !search || e.nombre?.toLowerCase().includes(search.toLowerCase()))
                                        .map((e: any) => (
                                        <tr key={e.estu_id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-4 sticky left-0 bg-white group-hover:bg-gray-50 font-bold text-gray-700 text-sm border-r border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                                {e.nombre}
                                            </td>
                                            {e.notas.map((n: any) => {
                                                const actividad = gradematrix.actividades.find((a: any) => a.id === n.actividad_id);
                                                return (
                                                    <td key={n.actividad_id}
                                                        className="p-4 text-center border-l border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                                                        onClick={() => setSelectedGrade({ ...n, estu_id: e.estu_id, nombre_student: e.nombre, nombre_activity: actividad?.nombre })}
                                                    >
                                                        <span className={`text-sm font-black px-2 py-1 rounded-lg ${n.nota ? (parseInt(n.nota) >= 11 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50') : 'text-gray-200'}`}>
                                                            {n.nota || '-'}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                            <td className="p-4 text-center border-l bg-emerald-50/10 font-black text-emerald-700">{e.promedio}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Móvil: cards por alumno */}
                        <div className="sm:hidden divide-y divide-gray-100">
                            {gradematrix.estudiantes.map((e: any) => (
                                <div key={e.estu_id} className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-gray-800 text-sm capitalize">{e.nombre}</p>
                                        <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                                            Prom: {e.promedio}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {e.notas.map((n: any) => {
                                            const actividad = gradematrix.actividades.find((a: any) => a.id === n.actividad_id);
                                            return (
                                                <button key={n.actividad_id}
                                                    onClick={() => setSelectedGrade({ ...n, estu_id: e.estu_id, nombre_student: e.nombre, nombre_activity: actividad?.nombre })}
                                                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-left hover:bg-emerald-50 transition-colors"
                                                >
                                                    <span className="text-[10px] text-gray-500 font-medium truncate mr-2">{actividad?.nombre}</span>
                                                    <span className={`text-xs font-black shrink-0 ${n.nota ? (parseInt(n.nota) >= 11 ? 'text-emerald-600' : 'text-rose-500') : 'text-gray-300'}`}>
                                                        {n.nota || '-'}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="p-20 text-center font-bold text-gray-300">No hay datos disponibles</div>
                )}
            </Card>

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
                                    onChange={(e) => setSelectedGrade({ ...selectedGrade, nota: e.target.value })}
                                    className="w-full h-16 bg-gray-50 border-none rounded-2xl px-6 text-2xl font-black text-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                                    placeholder="--"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Observación / Feedback</label>
                                <textarea
                                    value={selectedGrade.observacion}
                                    onChange={(e) => setSelectedGrade({ ...selectedGrade, observacion: e.target.value })}
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
                                <a href={`/storage/${selectedGrade.archivo_entrega}`} target="_blank" className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors">
                                    Descargar
                                </a>
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
