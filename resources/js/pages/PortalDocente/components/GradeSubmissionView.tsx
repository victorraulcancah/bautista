import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, CheckCircle, Award, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getGradeStatus, GRADING_SYSTEM } from '@/constants/grading';

export interface Entrega {
    entrega_id: number;
    estu_id?: number;
    estudiante: {
        estu_id: number;
        nombre: string;
        apellido_paterno: string;
        apellido_materno: string;
    };
    archivos: Array<{
        archivo_id: number;
        nombre: string;
        path: string;
        tamanio: number;
    }>;
    intento?: {
        intento_id: number;
        fecha_inicio: string;
        fecha_fin: string;
        puntaje_total: number;
        estado: string;
        respuestas: Array<{
            pregunta: string;
            tipo: string;
            respuesta_estudiante: string;
            alternativa_id: number | null;
            es_correcta: boolean | null;
            puntaje: number;
        }>;
    } | null;
    fecha_entrega: string;
    nota: string | null;
    observacion: string | null;
    estado: string;
}

interface Props {
    entregas: Entrega[];
    maxNota?: number;
    onSaveGrade: (entregaId: number, nota: string, observacion: string) => Promise<void>;
    isLoading?: boolean;
}

export default function GradeSubmissionView({ 
    entregas, 
    maxNota = 20, 
    onSaveGrade,
    isLoading = false 
}: Props) {
    const [calificando, setCalificando] = useState<number | null>(null);
    const [notaForm, setNotaForm] = useState({ nota: '', observacion: '' });
    const [saving, setSaving] = useState(false);

    const startCalificar = (entrega: Entrega) => {
        setCalificando(entrega.entrega_id);
        setNotaForm({
            nota: entrega.nota || '',
            observacion: entrega.observacion || ''
        });
    };

    const handleSave = async (entregaId: number) => {
        setSaving(true);
        try {
            await onSaveGrade(entregaId, notaForm.nota, notaForm.observacion);
            setCalificando(null);
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-20 text-center animate-pulse">
                <div className="size-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="font-black text-xs uppercase tracking-widest text-gray-400">Cargando entregas...</p>
            </div>
        );
    }

    if (entregas.length === 0) {
        return (
            <Card className="rounded-[2.5rem] p-12 text-center border-none shadow-sm bg-white">
                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold">No hay entregas aún</p>
                <p className="text-sm text-gray-400 mt-2">Los estudiantes aún no han enviado sus trabajos</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {entregas.map((entrega) => (
                <Card key={entrega.entrega_id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                    <div className="p-8">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                            {/* Información del Estudiante */}
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="size-14 rounded-2xl bg-emerald-50 flex items-center justify-center font-black text-emerald-600 text-lg shadow-inner">
                                        {entrega.estudiante.nombre.charAt(0)}{entrega.estudiante.apellido_paterno.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-gray-900 group-hover:text-emerald-600 transition-colors uppercase">
                                            {entrega.estudiante.nombre} {entrega.estudiante.apellido_paterno} {entrega.estudiante.apellido_materno}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="rounded-lg border-emerald-100 text-emerald-600 font-bold text-[10px] uppercase">
                                                ID: {entrega.estudiante.estu_id}
                                            </Badge>
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-tight">
                                                Entregado: {entrega.fecha_entrega
                                                    ? format(new Date(entrega.fecha_entrega), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
                                                    : 'Pendiente'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Archivos Adjuntos */}
                                {entrega.archivos.length > 0 ? (
                                    <div className="space-y-3 mb-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100/50">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Archivos del Estudiante</p>
                                        <div className="flex flex-wrap gap-2">
                                            {entrega.archivos.map((archivo) => (
                                                <a
                                                    key={archivo.archivo_id}
                                                    href={archivo.url || `/storage/${archivo.path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm group/file"
                                                >
                                                    <FileText size={16} className="text-emerald-500 group-hover/file:scale-110 transition-transform" />
                                                    <span className="text-xs font-bold text-gray-700">{archivo.nombre}</span>
                                                    <Download size={14} className="text-gray-300 group-hover/file:text-emerald-400" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-6 px-4 py-2 bg-rose-50 rounded-xl w-fit">
                                        <AlertCircle size={14} /> Sin archivos adjuntos
                                    </div>
                                )}

                                {/* Questionnaire Answers */}
                                {entrega.intento && (
                                    <div className="space-y-4 mb-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Respuestas del Cuestionario</p>
                                            <Badge variant="secondary" className="bg-slate-200 text-slate-600 font-black text-[9px] uppercase">
                                                Auto-Puntaje: {entrega.intento.puntaje_total}
                                            </Badge>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {entrega.intento.respuestas.map((resp, idx) => {
                                                const isAbierta = !resp.alternativa_id && resp.respuesta_estudiante;
                                                return (
                                                    <div key={idx} className={`p-4 rounded-2xl border ${isAbierta ? 'bg-amber-50 border-amber-100 shadow-sm' : 'bg-white border-slate-100 shadow-sm'}`}>
                                                        <div className="flex items-start justify-between gap-4 mb-2">
                                                            <p className="text-xs font-black text-gray-800 flex-1">{idx+1}. {resp.pregunta}</p>
                                                            {isAbierta && (
                                                                <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px] uppercase">Revisión Manual</Badge>
                                                            )}
                                                        </div>
                                                        <div className="pl-4 border-l-2 border-slate-200">
                                                            {isAbierta ? (
                                                                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white/50 p-2 rounded-lg">
                                                                    {resp.respuesta_estudiante}
                                                                </p>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`size-2 rounded-full ${resp.es_correcta ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                                    <p className="text-xs font-bold text-gray-600">Respuesta marcada</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 flex justify-end">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Puntos: {resp.puntaje}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Formulario de Calificación */}
                                {calificando === entrega.entrega_id ? (
                                    <div className="space-y-4 p-6 bg-amber-50/50 rounded-[2rem] border border-amber-100 animate-in zoom-in-95 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-1">
                                                <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 block">Calificación</label>
                                                <Input 
                                                    type="number"
                                                    value={notaForm.nota}
                                                    onChange={(e) => setNotaForm(prev => ({ ...prev, nota: e.target.value }))}
                                                    placeholder={`0-${maxNota}`}
                                                    className="h-12 rounded-xl font-black text-lg text-emerald-600 border-amber-200 focus:ring-amber-200"
                                                    min="0"
                                                    max={maxNota}
                                                />
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 block">Retroalimentación</label>
                                                <Textarea 
                                                    value={notaForm.observacion}
                                                    onChange={(e) => setNotaForm(prev => ({ ...prev, observacion: e.target.value }))}
                                                    placeholder="Comentarios para el estudiante..."
                                                    className="rounded-xl font-bold min-h-[48px] border-amber-200 focus:ring-amber-200"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button 
                                                variant="ghost"
                                                onClick={() => setCalificando(null)}
                                                className="rounded-xl font-black uppercase text-[10px] tracking-widest h-11"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button 
                                                onClick={() => handleSave(entrega.entrega_id)}
                                                disabled={saving}
                                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-[10px] tracking-widest h-11 px-6 shadow-lg shadow-emerald-100 text-white"
                                            >
                                                {saving ? 'Guardando...' : 'Guardar Nota'}
                                            </Button>
                                        </div>
                                    </div>
                                ) : entrega.nota ? (() => {
                                    const { label, color, bg } = getGradeStatus(entrega.nota);
                                    return (
                                        <div className={`p-6 ${bg}/50 rounded-[2rem] border ${bg.replace('bg-', 'border-')} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                                    <Award size={24} className={color} />
                                                </div>
                                                <div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className={`text-3xl font-black ${color}`}>{entrega.nota}</span>
                                                        <span className="text-[10px] font-black uppercase text-gray-300">/ {maxNota}</span>
                                                        <Badge className={`${bg} ${color} border-none font-black text-[9px] uppercase ml-2`}>
                                                            {label}
                                                        </Badge>
                                                    </div>
                                                    {entrega.observacion && (
                                                        <p className="text-xs text-gray-600 font-medium italic mt-1 line-clamp-1">{entrega.observacion}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <Button 
                                                variant="outline"
                                                onClick={() => startCalificar(entrega)}
                                                className={`rounded-xl border-current ${color} font-black uppercase text-[9px] tracking-widest h-10 px-6 hover:bg-white`}
                                            >
                                                Editar Calificación
                                            </Button>
                                        </div>
                                    );
                                })() : (
                                    <Button 
                                        onClick={() => startCalificar(entrega)}
                                        className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-[10px] tracking-widest h-14 px-8 shadow-xl shadow-emerald-100 gap-2 text-white"
                                    >
                                        <Award size={18} /> Calificar Entrega
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
