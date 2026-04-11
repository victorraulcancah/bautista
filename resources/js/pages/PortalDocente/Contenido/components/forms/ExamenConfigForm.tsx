import React from 'react';
import { Shield, Clock, Lock, Shuffle, Eye } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ExamenConfig } from '../../hooks/useExamenConfig';

interface Props {
    config: ExamenConfig;
    onUpdateField: (field: keyof ExamenConfig, value: string | boolean) => void;
}

export default function ExamenConfigForm({ config, onUpdateField }: Props) {
    return (
        <div className="space-y-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
            <div className="flex items-center gap-2">
                <Shield size={16} className="text-rose-600" />
                <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">Configuración de Examen</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Clock size={14} />
                        Límite de Tiempo (minutos)
                    </Label>
                    <Input 
                        type="number"
                        value={config.tiempo_limite}
                        onChange={(e) => onUpdateField('tiempo_limite', e.target.value)}
                        className="h-10 rounded-xl font-bold"
                        min="1"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Puntaje para Aprobar</Label>
                    <Input 
                        type="number"
                        value={config.passing_score}
                        onChange={(e) => onUpdateField('passing_score', e.target.value)}
                        className="h-10 rounded-xl font-bold"
                        min="0"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Lock size={14} />
                    Contraseña de Acceso (opcional)
                </Label>
                <Input 
                    type="text"
                    value={config.password}
                    onChange={(e) => onUpdateField('password', e.target.value)}
                    placeholder="Dejar vacío si no requiere contraseña"
                    className="h-10 rounded-xl font-bold"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Seguridad y Orden</Label>
                <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-rose-50 transition-colors">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-rose-600" />
                            <span className="text-sm font-bold text-gray-700">Envío automático al expirar</span>
                        </div>
                        <input 
                            type="checkbox"
                            checked={config.auto_submit}
                            onChange={(e) => onUpdateField('auto_submit', e.target.checked)}
                            className="size-5 rounded-lg border-2 border-gray-300 text-rose-600 focus:ring-rose-500"
                        />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-rose-50 transition-colors">
                        <div className="flex items-center gap-2">
                            <Shuffle size={14} className="text-rose-600" />
                            <span className="text-sm font-bold text-gray-700">Aleatorizar preguntas</span>
                        </div>
                        <input 
                            type="checkbox"
                            checked={config.randomize_questions}
                            onChange={(e) => onUpdateField('randomize_questions', e.target.checked)}
                            className="size-5 rounded-lg border-2 border-gray-300 text-rose-600 focus:ring-rose-500"
                        />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-rose-50 transition-colors">
                        <div className="flex items-center gap-2">
                            <Lock size={14} className="text-rose-600" />
                            <span className="text-sm font-bold text-gray-700">Bloquear navegación</span>
                        </div>
                        <input 
                            type="checkbox"
                            checked={config.lock_navigation}
                            onChange={(e) => onUpdateField('lock_navigation', e.target.checked)}
                            className="size-5 rounded-lg border-2 border-gray-300 text-rose-600 focus:ring-rose-500"
                        />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-rose-50 transition-colors">
                        <div className="flex items-center gap-2">
                            <Eye size={14} className="text-rose-600" />
                            <span className="text-sm font-bold text-gray-700">Mostrar nota al finalizar</span>
                        </div>
                        <input 
                            type="checkbox"
                            checked={config.show_grade}
                            onChange={(e) => onUpdateField('show_grade', e.target.checked)}
                            className="size-5 rounded-lg border-2 border-gray-300 text-rose-600 focus:ring-rose-500"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
