import { CuestionarioConfig, Question, Alternative } from '../../hooks/useCuestionarioConfig';
import { Plus, Trash2, CheckCircle2, Circle, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface Props {
    config: CuestionarioConfig;
    maxPuntosActividad: number;
    onUpdateField: (field: keyof CuestionarioConfig, value: any) => void;
    addQuestion: () => void;
    removeQuestion: (index: number) => void;
    updateQuestion: (index: number, updatedQuestion: Question) => void;
}

export default function CuestionarioConfigForm({ 
    config, 
    maxPuntosActividad,
    onUpdateField, 
    addQuestion, 
    removeQuestion, 
    updateQuestion 
}: Props) {
    const handleUpdateQuestion = (index: number, field: keyof Question, value: any) => {
        const updated = { ...config.questions[index], [field]: value };
        updateQuestion(index, updated);
    };

    const handleImageUpload = (qIndex: number, file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        api.post('/actividades/cuestionario/upload-image-temp', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => {
            handleUpdateQuestion(qIndex, 'recurso_imagen', res.data.path);
        }).catch(() => alert('Error al subir la imagen.'));
    };

    const handleUpdateAlternative = (qIndex: number, aIndex: number, field: keyof Alternative, value: any) => {
        const question = { ...config.questions[qIndex] };
        const alternatives = [...question.alternativas];
        
        // Force single choice ONLY if it's True/False
        if (field === 'es_correcta' && value === true && question.tipo_respuesta === 'true_false') {
            alternatives.forEach((a, i) => {
                if (i !== aIndex) a.es_correcta = false;
            });
        }

        alternatives[aIndex] = { ...alternatives[aIndex], [field]: value };
        question.alternativas = alternatives;
        updateQuestion(qIndex, question);
    };

    const addAlternative = (qIndex: number) => {
        const question = { ...config.questions[qIndex] };
        question.alternativas = [
            ...question.alternativas, 
            { contenido: `Nueva Opción ${question.alternativas.length + 1}`, es_correcta: false }
        ];
        updateQuestion(qIndex, question);
    };

    const removeAlternative = (qIndex: number, aIndex: number) => {
        const question = { ...config.questions[qIndex] };
        question.alternativas = question.alternativas.filter((_, i) => i !== aIndex);
        updateQuestion(qIndex, question);
    };

    const sumatorioPuntos = config.questions.reduce((sum, q) => sum + (Number(q.valor_nota) || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header info */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Sparkles size={18} className="text-purple-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none mb-1">Puntos Totales de Actividad</p>
                        <p className="text-xl font-black text-purple-900">{maxPuntosActividad} pts</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none mb-1">Suma de Preguntas</p>
                    <p className={`text-xl font-black ${sumatorioPuntos === maxPuntosActividad ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {sumatorioPuntos} pts
                    </p>
                </div>
            </div>

            {/* General Config */}
            <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ajustes Generales</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase px-1">Tipo Predeterminado</Label>
                        <select 
                            value={config.default_question_type}
                            onChange={(e) => onUpdateField('default_question_type', e.target.value)}
                            className="w-full h-11 px-4 rounded-2xl border border-gray-100 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-purple-100 bg-white"
                        >
                            <option value="multiple">Opción Múltiple</option>
                            <option value="true_false">Verdadero/Falso</option>
                            <option value="likert">Escala de Likert (Encuesta)</option>
                            <option value="open">Respuesta Abierta</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase px-1">Mensaje de Finalización</Label>
                        <Input 
                            value={config.completion_message}
                            onChange={(e) => onUpdateField('completion_message', e.target.value)}
                            placeholder="Gracias por completar..."
                            className="h-11 rounded-2xl font-bold bg-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-gray-500 uppercase px-1 flex items-center gap-2">
                            Duración (min)
                        </Label>
                        <Input 
                            type="number"
                            value={config.duracion}
                            onChange={(e) => onUpdateField('duracion', e.target.value)}
                            className="h-11 rounded-2xl font-bold bg-white"
                            min="1"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                    <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-purple-300 transition-all">
                        <input 
                            type="checkbox"
                            checked={config.all_required}
                            onChange={(e) => onUpdateField('all_required', e.target.checked)}
                            className="size-4 rounded-md border-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Preguntas Obligatorias</span>
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-purple-300 transition-all">
                        <input 
                            type="checkbox"
                            checked={config.show_correct_answer}
                            onChange={(e) => onUpdateField('show_correct_answer', e.target.checked)}
                            className="size-4 rounded-md border-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Mostrar Respuestas Correctas</span>
                    </label>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Preguntas ({config.questions.length})</h3>
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addQuestion}
                        className="rounded-xl font-bold text-[10px] uppercase gap-2 hover:bg-purple-600 hover:text-white border-purple-200 text-purple-600"
                    >
                        <Plus size={14} /> Añadir Pregunta
                    </Button>
                </div>

                {config.questions.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-center space-y-2">
                        <p className="font-bold text-gray-400 text-sm">No has añadido preguntas aún</p>
                        <p className="text-[10px] text-gray-300 uppercase tracking-widest">Haz clic en el botón superior para comenzar</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {config.questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:border-purple-200 transition-all p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xs">
                                                    #{qIndex + 1}
                                                </div>
                                                <Input 
                                                    value={q.cabecera}
                                                    onChange={(e) => handleUpdateQuestion(qIndex, 'cabecera', e.target.value)}
                                                    placeholder="Escribe el enunciado de la pregunta..."
                                                    className="flex-1 h-12 rounded-2xl font-black text-gray-800 border-none bg-gray-50 focus:ring-4 focus:ring-purple-50 transition-all"
                                                />
                                            </div>

                                            {/* Imagen de apoyo */}
                                            <div className="flex items-center gap-3 px-1">
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(qIndex, e.target.files[0])}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                    <Button type="button" variant="outline" size="sm" className="rounded-xl border-purple-200 text-purple-500 hover:bg-purple-50 text-[10px] font-black uppercase tracking-widest gap-2">
                                                        <ImageIcon size={12} /> {q.recurso_imagen ? 'Cambiar Imagen' : 'Añadir Imagen'}
                                                    </Button>
                                                </div>
                                                {q.recurso_imagen && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 h-14 rounded-xl overflow-hidden border border-purple-100 bg-gray-50">
                                                            <img src={q.recurso_imagen.startsWith('http') ? q.recurso_imagen : `/storage/${q.recurso_imagen}`} alt="preview" className="w-full h-full object-contain" />
                                                        </div>
                                                        <button type="button" onClick={() => handleUpdateQuestion(qIndex, 'recurso_imagen', null)} className="p-1 text-rose-300 hover:text-rose-500">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 px-1">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Tipo de Respuesta</p>
                                                    <select 
                                                        value={q.tipo_respuesta}
                                                        onChange={(e) => handleUpdateQuestion(qIndex, 'tipo_respuesta', e.target.value)}
                                                        className="h-10 px-4 rounded-xl border border-gray-100 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    >
                                                        <option value="multiple">Opción Múltiple</option>
                                                        <option value="true_false">Verdadero/Falso</option>
                                                        <option value="likert">Escala de Likert</option>
                                                        <option value="open">Abierta</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Peso/Puntos</p>
                                                    <div className="flex items-center gap-2">
                                                        <Input 
                                                            type="number"
                                                            value={q.valor_nota}
                                                            onChange={(e) => handleUpdateQuestion(qIndex, 'valor_nota', e.target.value)}
                                                            className="h-10 w-20 rounded-xl font-black text-center"
                                                            min="0"
                                                        />
                                                        {sumatorioPuntos > 0 && (
                                                            <div className="px-3 py-2 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col items-center min-w-[80px]">
                                                                <span className="text-[8px] font-black text-indigo-400 uppercase leading-none mb-1">Valor Real</span>
                                                                <span className="text-xs font-black text-indigo-600">
                                                                    {((Number(q.valor_nota) / sumatorioPuntos) * maxPuntosActividad).toFixed(2)} pts
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => removeQuestion(qIndex)}
                                            className="size-10 rounded-2xl text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>

                                    {/* Alternatives Section */}
                                    {(q.tipo_respuesta === 'multiple' || q.tipo_respuesta === 'true_false') && (
                                        <div className="mt-6 space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                            <div className="flex items-center justify-between px-2">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Opciones de Respuesta</p>
                                                {q.tipo_respuesta === 'multiple' && (
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => addAlternative(qIndex)}
                                                        className="h-7 rounded-lg text-purple-600 font-black text-[9px] uppercase tracking-widest hover:bg-purple-100 transition-all"
                                                    >
                                                        + Añadir Opción
                                                    </Button>
                                                )}
                                            </div>
                                            
                                            <div className="grid gap-2">
                                                {q.alternativas.map((alt, aIndex) => (
                                                    <div key={aIndex} className="flex items-center gap-3 group/alt">
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleUpdateAlternative(qIndex, aIndex, 'es_correcta', !alt.es_correcta)}
                                                            className={`size-6 flex-shrink-0 rounded-full flex items-center justify-center transition-all ${alt.es_correcta ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100 ring-2 ring-emerald-100' : 'bg-white border-2 border-gray-200 text-gray-200 hover:border-emerald-200'}`}
                                                        >
                                                            {alt.es_correcta ? <CheckCircle2 size={14} strokeWidth={3} /> : <Circle size={14} />}
                                                        </button>
                                                        <Input 
                                                            value={alt.contenido}
                                                            onChange={(e) => handleUpdateAlternative(qIndex, aIndex, 'contenido', e.target.value)}
                                                            placeholder="Escribe la respuesta..."
                                                            className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all ${alt.es_correcta ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-white border-gray-100'}`}
                                                        />
                                                        {q.tipo_respuesta === 'multiple' && q.alternativas.length > 2 && (
                                                            <button 
                                                                type="button"
                                                                onClick={() => removeAlternative(qIndex, aIndex)}
                                                                className="opacity-0 group-hover/alt:opacity-100 p-2 text-rose-300 hover:text-rose-500 transition-all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {q.tipo_respuesta === 'multiple' && !q.alternativas.some(a => a.es_correcta) && (
                                                <p className="text-[9px] font-bold text-rose-400 px-1 uppercase tracking-widest mt-2 animate-pulse">Debes marcar una respuesta como correcta</p>
                                            )}
                                        </div>
                                    )}

                                    {q.tipo_respuesta === 'open' && (
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-relaxed">
                                                Los estudiantes verán una caja de texto para redactar su respuesta. <br />
                                                <span className="font-black">Estas preguntas deberán ser calificadas manualmente por el docente.</span>
                                            </p>
                                        </div>
                                    )}

                                    {q.tipo_respuesta === 'likert' && (
                                        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-relaxed">
                                                Escala de satisfacción (Encuesta). Los estudiantes verán opciones de 1 a 5 (Muy en desacuerdo a Muy de acuerdo).
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
