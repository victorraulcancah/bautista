import React from 'react';
import { Calendar, Clock, Award } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ActivityFormData {
    nombre_actividad: string;
    descripcion_corta: string;
    descripcion_larga: string;
    fecha_inicio: string;
    fecha_cierre: string;
    nota_actividad: string;
    es_calificado: string;
    nota_visible: string;
    ocultar_actividad: string;
    peso_porcentaje: string;
    puntos_maximos: string;
}

interface Props {
    formData: ActivityFormData;
    onChange: (field: keyof ActivityFormData, value: string) => void;
}

export default function ActivityBaseForm({ formData, onChange }: Props) {
    return (
        <>
            <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Nombre de la Actividad</Label>
                <Input 
                    value={formData.nombre_actividad}
                    onChange={(e) => onChange('nombre_actividad', e.target.value)}
                    placeholder="Ej: Tarea 1 - Ecuaciones Lineales"
                    className="h-12 rounded-2xl font-bold"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Descripción Corta</Label>
                <Input 
                    value={formData.descripcion_corta}
                    onChange={(e) => onChange('descripcion_corta', e.target.value)}
                    placeholder="Breve descripción de la actividad"
                    className="h-12 rounded-2xl font-bold"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Instrucciones Detalladas</Label>
                <Textarea 
                    value={formData.descripcion_larga}
                    onChange={(e) => onChange('descripcion_larga', e.target.value)}
                    placeholder="Instrucciones completas para los estudiantes..."
                    className="rounded-2xl font-bold min-h-[120px]"
                    rows={5}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Calendar size={14} className="text-emerald-600" />
                        Fecha de Apertura
                    </Label>
                    <Input 
                        type="datetime-local"
                        value={formData.fecha_inicio}
                        onChange={(e) => onChange('fecha_inicio', e.target.value)}
                        className="h-12 rounded-2xl font-bold"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Clock size={14} className="text-rose-600" />
                        Fecha de Cierre
                    </Label>
                    <Input 
                        type="datetime-local"
                        value={formData.fecha_cierre}
                        onChange={(e) => onChange('fecha_cierre', e.target.value)}
                        className="h-12 rounded-2xl font-bold"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Award size={14} className="text-amber-600" />
                        Puntos Máximos
                    </Label>
                    <Input 
                        type="number"
                        value={formData.puntos_maximos}
                        onChange={(e) => onChange('puntos_maximos', e.target.value)}
                        placeholder="20"
                        className="h-12 rounded-2xl font-bold"
                        min="0"
                    />
                    <p className="text-[10px] text-gray-400 font-medium px-1">Escala sobre la cual se califica (ej: 20)</p>
                </div>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Opciones Generales</p>
                <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox"
                            checked={formData.es_calificado === '1'}
                            onChange={(e) => onChange('es_calificado', e.target.checked ? '1' : '0')}
                            className="size-5 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm font-bold text-gray-700">Actividad calificada</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox"
                            checked={formData.nota_visible === '1'}
                            onChange={(e) => onChange('nota_visible', e.target.checked ? '1' : '0')}
                            className="size-5 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm font-bold text-gray-700">Nota visible para estudiantes</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox"
                            checked={formData.ocultar_actividad === '0'}
                            onChange={(e) => onChange('ocultar_actividad', e.target.checked ? '0' : '1')}
                            className="size-5 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm font-bold text-gray-700">Visible para estudiantes</span>
                    </label>
                </div>
            </div>
        </>
    );
}
