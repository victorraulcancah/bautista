import React from 'react';
import { Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CuestionarioConfig } from '../../hooks/useCuestionarioConfig';

interface Props {
    config: CuestionarioConfig;
    onUpdateField: (field: keyof CuestionarioConfig, value: string | boolean) => void;
}

export default function CuestionarioConfigForm({ config, onUpdateField }: Props) {
    return (
        <div className="space-y-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
            <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600" />
                <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Configuración de Cuestionario</p>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Tipo de Respuesta Predeterminado</Label>
                <select 
                    value={config.default_question_type}
                    onChange={(e) => onUpdateField('default_question_type', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="multiple">Opción Múltiple</option>
                    <option value="true_false">Verdadero/Falso</option>
                    <option value="likert">Escala de Likert</option>
                    <option value="open">Respuesta Abierta</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Mensaje de Finalización</Label>
                <Textarea 
                    value={config.completion_message}
                    onChange={(e) => onUpdateField('completion_message', e.target.value)}
                    placeholder="Mensaje que verán los estudiantes al completar"
                    className="rounded-xl font-bold"
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Opciones</Label>
                <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-purple-50 transition-colors">
                        <span className="text-sm font-bold text-gray-700">Todas las preguntas obligatorias</span>
                        <input 
                            type="checkbox"
                            checked={config.all_required}
                            onChange={(e) => onUpdateField('all_required', e.target.checked)}
                            className="size-5 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-purple-50 transition-colors">
                        <span className="text-sm font-bold text-gray-700">Mostrar respuesta correcta</span>
                        <input 
                            type="checkbox"
                            checked={config.show_correct_answer}
                            onChange={(e) => onUpdateField('show_correct_answer', e.target.checked)}
                            className="size-5 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-purple-50 transition-colors">
                        <span className="text-sm font-bold text-gray-700">Cuestionario anónimo</span>
                        <input 
                            type="checkbox"
                            checked={config.is_anonymous}
                            onChange={(e) => onUpdateField('is_anonymous', e.target.checked)}
                            className="size-5 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-purple-50 transition-colors">
                        <span className="text-sm font-bold text-gray-700">Mostrar resumen al grupo</span>
                        <input 
                            type="checkbox"
                            checked={config.show_summary}
                            onChange={(e) => onUpdateField('show_summary', e.target.checked)}
                            className="size-5 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
