import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';

interface GradeMatrix {
    actividades: any[];
    estudiantes: any[];
}

interface Props {
    docenteCursoId: number;
}

export default function CalificacionesTab({ docenteCursoId }: Props) {
    const [view, setView] = useState<'manage' | 'grades'>('manage');
    const [selectedGrade, setSelectedGrade] = useState<any>(null);
    const [gradematrix, setGradeMatrix] = useState<GradeMatrix | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (view === 'grades') {
            loadGrades();
        }
    }, [view, docenteCursoId]);

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
                notas: [
                    {
                        estu_id: selectedGrade.estu_id,
                        nota: selectedGrade.nota,
                        obs: selectedGrade.observacion
                    }
                ]
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Evaluaciones & Calificaciones</h2>
                        <p className="text-gray-500 text-sm">Gestiona tareas, exámenes y el registro oficial de notas.</p>
                    </div>
                    {view === 'grades' && (
                        <Button 
                            onClick={downloadExcel}
                            className="rounded-2xl h-12 px-6 bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-emerald-100 animate-in fade-in zoom-in-95"
                        >
                            <Download size={16} /> Exportar Excel
                        </Button>
                    )}
                </div>
                <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-[1.5rem]">
                    <Button 
                        variant="ghost" 
                        onClick={() => setView('manage')}
                        className={`rounded-2xl text-[10px] font-black uppercase px-6 h-10 ${view === 'manage' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}
                    >
                        Gestionar
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => setView('grades')}
                        className={`rounded-2xl text-[10px] font-black uppercase px-6 h-10 ${view === 'grades' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}
                    >
                        Registro de Notas
                    </Button>
                </div>
            </div>

            {view === 'manage' ? (
                <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="size-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600">
                        <BarChart3 size={40} />
                    </div>
                    <div className="max-w-xs space-y-2">
                        <p className="font-black uppercase tracking-widest text-sm text-gray-900">Diseño de Pruebas</p>
                        <p className="text-xs font-bold text-gray-400 leading-relaxed">
                            Usa la pestaña <strong>Contenido</strong> para crear y configurar actividades, tareas y exámenes.
                        </p>
                    </div>
                </div>
            ) : (
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    {loading ? (
                        <div className="p-20 text-center animate-pulse font-black text-emerald-400 uppercase tracking-[0.2em] text-xs">Generando Sábana de Notas...</div>
                    ) : gradematrix ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="p-6 sticky left-0 bg-gray-50 z-10 border-r border-gray-100">Estudiante</th>
                                        {gradematrix.actividades.map((a: any) => (
                                            <th key={a.id} className="p-6 text-center border-l border-gray-100 min-w-[120px]">{a.nombre}</th>
                                        ))}
                                        <th className="p-6 text-center border-l bg-emerald-50/50 text-emerald-600 min-w-[80px]">PROM.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {gradematrix.estudiantes.map((e: any) => (
                                        <tr key={e.estu_id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-6 sticky left-0 bg-white group-hover:bg-gray-50 font-bold text-gray-700 text-sm border-r border-gray-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                                {e.nombre}
                                            </td>
                                            {e.notas.map((n: any) => {
                                                const actividad = gradematrix.actividades.find((a: any) => a.id === n.actividad_id);
                                                return (
                                                    <td 
                                                        key={n.actividad_id} 
                                                        className="p-6 text-center border-l border-gray-100 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                                                        onClick={() => setSelectedGrade({
                                                            ...n,
                                                            estu_id: e.estu_id,
                                                            nombre_student: e.nombre,
                                                            nombre_activity: actividad?.nombre
                                                        })}
                                                    >
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className={`text-sm font-black p-2 rounded-xl min-w-[36px] ${n.nota ? (parseInt(n.nota) >= 11 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50') : 'text-gray-200'}`}>
                                                                {n.nota || '-'}
                                                            </span>
                                                            {n.entregado && (
                                                                <div className="size-2 rounded-full bg-blue-500 shadow-sm" title="Tarea Entregada" />
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                            <td className="p-6 text-center border-l bg-emerald-50/10 font-black text-emerald-700">{e.promedio}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-20 text-center font-bold text-gray-300">No hay datos disponibles</div>
                    )}
                </Card>
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
                                    type="number" 
                                    min="0" 
                                    max="20"
                                    value={selectedGrade.nota}
                                    onChange={(e) => setSelectedGrade({...selectedGrade, nota: e.target.value})}
                                    className="w-full h-16 bg-gray-50 border-none rounded-2xl px-6 text-2xl font-black text-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                                    placeholder="--"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Observación / Feedback</label>
                                <textarea 
                                    value={selectedGrade.observacion}
                                    onChange={(e) => setSelectedGrade({...selectedGrade, observacion: e.target.value})}
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
                                <a href={`/storage/${selectedGrade.archivo_entrega}`} target="_blank" className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors">Descargar</a>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button 
                                variant="ghost" 
                                onClick={() => setSelectedGrade(null)}
                                className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] text-gray-400 hover:bg-gray-100"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                onClick={saveGrade}
                                disabled={saving}
                                className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                            >
                                {saving ? 'Guardando...' : 'Guardar Nota'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
