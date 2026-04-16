/**
 * AsistenciaTab — orquestador del módulo de asistencia.
 * Responsabilidad: manejar el tab activo, cargar datos y distribuirlos.
 */
import { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
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
            <div className="flex items-center justify-center py-24">
                <div className="size-10 border-4 border-gray-100 border-t-gray-700 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm" style={{ minHeight: '600px' }}>
            {/* Tabs — estilo Blackboard: botones en esquina superior derecha */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                <div>
                    <p className="text-xs text-gray-400 font-medium">Asistencia del curso</p>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('hoy')}
                        className={`px-5 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all
                            ${activeTab === 'hoy'
                                ? 'bg-gray-900 text-white shadow'
                                : 'text-gray-400 hover:text-gray-700'}`}
                    >
                        Hoy
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-5 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all
                            ${activeTab === 'general'
                                ? 'bg-gray-900 text-white shadow'
                                : 'text-gray-400 hover:text-gray-700'}`}
                    >
                        General
                    </button>
                </div>
            </div>

            {/* Contenido del tab activo */}
            <div className="flex-1 overflow-hidden">
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
            </div>

            {/* Feedback toast */}
            {feedback && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold animate-in slide-in-from-bottom-4
                    ${feedback.type === 'success' ? 'bg-gray-900 text-white' : 'bg-rose-600 text-white'}`}>
                    {feedback.type === 'success'
                        ? <CheckCircle2 size={16} />
                        : <AlertTriangle size={16} />
                    }
                    {feedback.msg}
                </div>
            )}
        </div>
    );
}
