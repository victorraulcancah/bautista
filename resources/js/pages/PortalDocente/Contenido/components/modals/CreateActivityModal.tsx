import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useActivityForm } from '../../hooks/useActivityForm';
import { useTareaConfig } from '../../hooks/useTareaConfig';
import { useExamenConfig } from '../../hooks/useExamenConfig';
import { useCuestionarioConfig } from '../../hooks/useCuestionarioConfig';
import ActivityBaseForm from '../forms/ActivityBaseForm';
import TareaConfigForm from '../forms/TareaConfigForm';
import ExamenConfigForm from '../forms/ExamenConfigForm';
import CuestionarioConfigForm from '../forms/CuestionarioConfigForm';

interface Props {
    open: boolean;
    onClose: () => void;
    claseId: number;
    cursoId: number;
    onSuccess: () => void;
}

export default function CreateActivityModal({ open, onClose, claseId, cursoId, onSuccess }: Props) {
    const { tipos, selectedTipo, formData, loading, handleTipoChange, handleChange, submitActivity } = useActivityForm(cursoId, claseId);
    const tareaHook = useTareaConfig();
    const examenHook = useExamenConfig();
    const cuestionarioHook = useCuestionarioConfig();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const config = selectedTipo === 'Tarea' ? tareaHook.config : 
                      selectedTipo === 'Examen' ? examenHook.config : 
                      selectedTipo === 'Cuestionario' ? cuestionarioHook.config : null;

        const success = await submitActivity(config);
        if (success) {
            onSuccess();
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                            <Sparkles size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Nueva Actividad</h2>
                            <p className="text-xs text-gray-500 font-bold">Crea una tarea, examen o cuestionario</p>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onClose}
                        className="size-10 rounded-2xl hover:bg-gray-100"
                    >
                        <X size={18} />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Activity Type Selector */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Tipo de Actividad</Label>
                        <select 
                            value={formData.id_tipo_actividad}
                            onChange={(e) => handleTipoChange(e.target.value)}
                            className="w-full h-12 px-4 rounded-2xl border border-gray-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        >
                            {tipos.map(tipo => (
                                <option key={tipo.tipo_id} value={tipo.tipo_id}>{tipo.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Base Form Fields */}
                    <ActivityBaseForm formData={formData} onChange={handleChange} />

                    {/* Specific Configuration Forms */}
                    {selectedTipo === 'Tarea' && (
                        <TareaConfigForm 
                            config={tareaHook.config}
                            onUpdateMaxFileSize={tareaHook.updateMaxFileSize}
                            onUpdateMaxAttempts={tareaHook.updateMaxAttempts}
                            onToggleFormat={tareaHook.toggleFormat}
                        />
                    )}

                    {selectedTipo === 'Examen' && (
                        <ExamenConfigForm 
                            config={examenHook.config}
                            maxPuntosActividad={Number(formData.puntos_maximos) || 20}
                            onUpdateField={examenHook.updateField}
                            addQuestion={examenHook.addQuestion}
                            removeQuestion={examenHook.removeQuestion}
                            updateQuestion={examenHook.updateQuestion}
                        />
                    )}

                    {selectedTipo === 'Cuestionario' && (
                        <CuestionarioConfigForm 
                            config={cuestionarioHook.config}
                            maxPuntosActividad={Number(formData.puntos_maximos) || 20}
                            onUpdateField={cuestionarioHook.updateField}
                            addQuestion={cuestionarioHook.addQuestion}
                            removeQuestion={cuestionarioHook.removeQuestion}
                            updateQuestion={cuestionarioHook.updateQuestion}
                        />
                    )}
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
                    <Button 
                        type="button"
                        variant="outline" 
                        onClick={onClose}
                        className="h-12 px-6 rounded-2xl font-bold"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="h-12 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 font-bold gap-2"
                    >
                        <Sparkles size={16} />
                        {loading ? 'Creando...' : 'Crear Actividad'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
