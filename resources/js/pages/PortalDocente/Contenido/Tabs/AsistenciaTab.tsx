/**
 * AsistenciaTab — orquestador del módulo de asistencia.
 * Responsabilidad: manejar el tab activo, cargar datos y distribuirlos.
 */
import { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { useAsistenciaData } from '../components/asistencia/useAsistenciaData';
import { AsistenciaHoy } from '../components/asistencia/AsistenciaHoy';
import { AsistenciaGeneral } from '../components/asistencia/AsistenciaGeneral';

interface Props {
    docenteCursoId: number;
}

type Tab = 'hoy' | 'general';

export default function AsistenciaTab({ docenteCursoId }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('hoy');

    const {
        alumnos,
        clases,
        records,
        stats,
        loadingInit,
        loadingHistory,
        saving,
        feedback,
        loadHistorial,
        guardarAsistencia,
    } = useAsistenciaData(docenteCursoId);

    // Cargar historial al cambiar al tab general
    useEffect(() => {
        if (activeTab === 'general') {
            loadHistorial();
        }
    }, [activeTab]);

    if (loadingInit) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                    <p className="font-black text-[10px] uppercase tracking-widest text-neutral-400 animate-pulse">Cargando Asistencias...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-white rounded-3xl border border-neutral-200/60 shadow-xl shadow-neutral-100/50 overflow-hidden" style={{ minHeight: '650px' }}>
            {/* Header modernizado */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 border-b border-neutral-100 bg-neutral-50/50 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-neutral-900 tracking-tight leading-none">Registro de Asistencia</h3>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Control de asistencia por curso</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-neutral-200 shadow-sm">
                    <button
                        onClick={() => setActiveTab('hoy')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                            ${activeTab === 'hoy'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                : 'text-neutral-400 hover:text-indigo-600 hover:bg-neutral-50'}`}
                    >
                        Hoy
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                            ${activeTab === 'general'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                : 'text-neutral-400 hover:text-indigo-600 hover:bg-neutral-50'}`}
                    >
                        Historial
                    </button>
                </div>
            </div>

            {/* Contenido del tab activo */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'hoy' && (
                    <AsistenciaHoy
                        clases={clases}
                        alumnos={alumnos}
                        onGuardar={guardarAsistencia}
                        saving={saving}
                    />
                )}
                {activeTab === 'general' && (
                    <AsistenciaGeneral
                        records={records}
                        stats={stats}
                        loading={loadingHistory}
                    />
                )}

                {/* Feedback modernizado */}
                {feedback && (
                    <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-500
                        ${feedback.type === 'success' 
                            ? 'bg-emerald-600 text-white shadow-emerald-200' 
                            : 'bg-rose-600 text-white shadow-rose-200'}`}>
                        {feedback.type === 'success'
                            ? <CheckCircle2 size={16} strokeWidth={3} />
                            : <AlertTriangle size={16} strokeWidth={3} />
                        }
                        {feedback.msg}
                    </div>
                )}
            </div>
        </div>
    );
}
