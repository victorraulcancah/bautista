import { ExamenConfig, Question, Alternative } from '../../hooks/useExamenConfig';
import { Plus, Trash2, CheckCircle2, Circle, Shield, Clock, Lock, Shuffle, Eye, Sparkles, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    config: ExamenConfig;
    maxPuntosActividad: number;
    onUpdateField: (field: keyof ExamenConfig, value: any) => void;
    addQuestion: () => void;
    removeQuestion: (index: number) => void;
    updateQuestion: (index: number, updatedQuestion: Question) => void;
}

export default function ExamenConfigForm({ 
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
            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <Award size={18} className="text-rose-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">Puntos Totales de Examen</p>
                        <p className="text-xl font-black text-rose-900">{maxPuntosActividad} pts</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">Suma de Preguntas</p>
                    <p className={`text-xl font-black ${sumatorioPuntos === maxPuntosActividad ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {sumatorioPuntos} pts
                    </p>
                </div>
            </div>

            {/* General Settings */}
            <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 space-y-4">
                <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Ajustes del Examen</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-gray-500 uppercase px-1 flex items-center gap-2">
                            <Clock size={12} /> Tiempo Límite (min)
                        </Label>
                        <Input 
                            type="number"
                            value={config.duracion}
                            onChange={(e) => onUpdateField('duracion', e.target.value)}
                            className="h-11 rounded-2xl font-bold bg-white"
                            min="1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-gray-500 uppercase px-1 flex items-center gap-2">
                            <Award size={12} /> Puntaje Aprobatorio
                        </Label>
                        <Input 
                            type="number"
                            value={config.passing_score}
                            onChange={(e) => onUpdateField('passing_score', e.target.value)}
                            className="h-11 rounded-2xl font-bold bg-white"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                    <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-rose-300 transition-all">
                        <input 
                            type="checkbox"
                            checked={config.auto_submit}
                            onChange={(e) => onUpdateField('auto_submit', e.target.checked)}
                            className="size-4 rounded-md text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Auto-envío</span>
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-rose-300 transition-all">
                        <input 
                            type="checkbox"
                            checked={config.randomize_questions}
                            onChange={(e) => onUpdateField('randomize_questions', e.target.checked)}
                            className="size-4 rounded-md text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Aleatorizar</span>
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-rose-300 transition-all">
                        <input 
                            type="checkbox"
                            checked={config.show_grade}
                            onChange={(e) => onUpdateField('show_grade', e.target.checked)}
                            className="size-4 rounded-md text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Ver Nota al Final</span>
                    </label>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Preguntas del Examen ({config.questions.length})</h3>
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addQuestion}
                        className="rounded-xl font-bold text-[10px] uppercase gap-2 hover:bg-rose-600 hover:text-white border-rose-200 text-rose-600"
                    >
                        <Plus size={14} /> Añadir Pregunta
                    </Button>
                </div>

                {config.questions.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-center space-y-2">
                        <p className="font-bold text-gray-400 text-sm">El examen no tiene preguntas</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {config.questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:border-rose-200 transition-all p-6">
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
                                                    className="flex-1 h-12 rounded-2xl font-black text-gray-800 border-none bg-gray-50 focus:ring-4 focus:ring-rose-50 transition-all"
                                                />
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 px-1">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Tipo</p>
                                                    <select 
                                                        value={q.tipo_respuesta}
                                                        onChange={(e) => handleUpdateQuestion(qIndex, 'tipo_respuesta', e.target.value)}
                                                        className="h-10 px-4 rounded-xl border border-gray-100 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                                                            <div className="px-3 py-2 bg-rose-50 rounded-xl border border-rose-100 flex flex-col items-center min-w-[80px]">
                                                                <span className="text-[8px] font-black text-rose-400 uppercase leading-none mb-1">Valor Real</span>
                                                                <span className="text-xs font-black text-rose-600">
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
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Opciones</p>
                                                {q.tipo_respuesta === 'multiple' && (
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => addAlternative(qIndex)}
                                                        className="h-7 rounded-lg text-rose-600 font-black text-[9px] uppercase tracking-widest hover:bg-rose-100 transition-all"
                                                    >
                                                        + Opción
                                                    </Button>
                                                )}
                                            </div>
                                            
                                            <div className="grid gap-2">
                                                {q.alternativas.map((alt, aIndex) => (
                                                    <div key={aIndex} className="flex items-center gap-3 group/alt">
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleUpdateAlternative(qIndex, aIndex, 'es_correcta', !alt.es_correcta)}
                                                            className={`size-6 flex-shrink-0 rounded-full flex items-center justify-center transition-all ${alt.es_correcta ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-200'}`}
                                                        >
                                                            {alt.es_correcta ? <CheckCircle2 size={14} strokeWidth={3} /> : <Circle size={14} />}
                                                        </button>
                                                        <Input 
                                                            value={alt.contenido}
                                                            onChange={(e) => handleUpdateAlternative(qIndex, aIndex, 'contenido', e.target.value)}
                                                            placeholder="Escribe la respuesta..."
                                                            className="flex-1 h-9 rounded-xl text-xs font-bold"
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
