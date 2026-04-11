import React, { useState, useEffect } from 'react';
import { BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';

interface Props {
    docenteCursoId: number;
}

export default function ConfiguracionTab({ docenteCursoId }: Props) {
    const [settings, setSettings] = useState<any>({ weights: {} });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const activityTypes = [
        { id: 1, name: 'Tareas' },
        { id: 2, name: 'Exámenes' },
        { id: 3, name: 'Cuestionarios' },
        { id: 5, name: 'Dibujos' },
        { id: 6, name: 'Puzzles' },
    ];

    useEffect(() => {
        loadSettings();
    }, [docenteCursoId]);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/docente/mis-cursos`);
            const current = res.data.find((c: any) => c.docen_curso_id === docenteCursoId);
            if (current?.settings) {
                setSettings(current.settings);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleWeightChange = (typeId: number, value: string) => {
        const numValue = parseInt(value) || 0;
        setSettings({
            ...settings,
            weights: {
                ...settings.weights,
                [typeId]: numValue
            }
        });
    };

    const saveSettings = async () => {
        const total = Object.values(settings.weights).reduce((acc: number, val: any) => acc + (parseInt(val) || 0), 0);
        if (total !== 100 && total !== 0) {
            alert(`La suma de los pesos debe ser 100%. Actual: ${total}%`);
            return;
        }

        setSaving(true);
        try {
            await api.put(`/docente/curso/${docenteCursoId}/settings`, { settings });
            alert("Configuración guardada correctamente");
        } catch (error) {
            alert("Error al guardar la configuración");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-emerald-400 font-black uppercase text-[10px]">Cargando configuración...</div>;

    const totalWeight = Object.values(settings.weights).reduce((acc: number, val: any) => acc + (parseInt(val) || 0), 0);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Configuración del Curso</h2>
                    <p className="text-gray-500 text-sm">Personaliza el sistema de calificación y preferencias.</p>
                </div>
                <Button 
                    onClick={saveSettings} 
                    disabled={saving}
                    className="rounded-2xl h-12 px-8 bg-emerald-600 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-100"
                >
                    {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-[2.5rem] border-none shadow-sm p-10 space-y-8 bg-white">
                    <div className="flex items-center gap-4 text-emerald-600">
                        <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 leading-none">Sistema de Pesos</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Calificación Ponderada</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {activityTypes.map(type => (
                            <div key={type.id} className="flex items-center justify-between group">
                                <span className="font-bold text-gray-600 group-hover:text-emerald-600 transition-colors uppercase text-[11px] tracking-wide">{type.name}</span>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={settings.weights?.[type.id] || ''}
                                        onChange={(e) => handleWeightChange(type.id, e.target.value)}
                                        placeholder="0"
                                        className="w-20 h-12 bg-gray-50 border-none rounded-xl text-center font-black text-emerald-600 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                                    />
                                    <span className="text-gray-400 font-black">%</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                        <span className="font-black text-gray-400 uppercase tracking-widest text-xs">Total</span>
                        <div className={`text-xl font-black ${totalWeight === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {totalWeight}%
                        </div>
                    </div>
                </Card>

                <Card className="rounded-[2.5rem] border-none shadow-sm p-10 space-y-8 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Settings size={120} />
                    </div>
                    
                    <div className="flex items-center gap-4 text-emerald-600">
                        <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 leading-none">Preferencias</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Visualización y Acceso</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                            <div>
                                <p className="font-bold text-gray-900">Visibilidad del Curso</p>
                                <p className="text-[10px] font-bold text-gray-400">Ocultar contenido a alumnos</p>
                            </div>
                            <div className="size-12 rounded-full bg-gray-100 border-4 border-white shadow-inner" />
                        </div>
                        <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                            <div>
                                <p className="font-bold text-gray-900">Cerrar Calificaciones</p>
                                <p className="text-[10px] font-bold text-gray-400">Bloquear edición de notas</p>
                            </div>
                            <div className="size-12 rounded-full bg-gray-100 border-4 border-white shadow-inner" />
                        </div>
                    </div>

                    <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Nota Informativa</p>
                        <p className="text-blue-800 text-xs font-bold leading-relaxed">
                            Si el total de pesos es **0%**, el sistema calculará un promedio simple de todas las actividades detectadas.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
