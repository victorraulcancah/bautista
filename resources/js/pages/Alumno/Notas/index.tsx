import { Head } from '@inertiajs/react';
import { Star, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AlumnoNotasPage() {
    const [notas, setNotas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/alumno/dashboard').then(res => {
            setNotas(res.data.notas);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-10 text-center font-black animate-pulse text-amber-500">Cargando tus calificaciones...</div>;

    const promedio = notas.length > 0 ? (notas.reduce((acc, n) => acc + parseFloat(n.nota), 0) / notas.length).toFixed(1) : '---';

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-10 selection:bg-amber-100">
            <Head title="Mis Notas" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Mis Calificaciones</h1>
                    <p className="text-gray-500 font-medium italic">Tu desempeño académico actualizado en tiempo real.</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-amber-200/30 flex items-center space-x-6 border-b-4 border-b-amber-500">
                    <div className="bg-amber-100 p-4 rounded-2xl text-amber-600">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Promedio General</p>
                        <p className={`text-4xl font-black ${parseFloat(promedio) >= 11 ? 'text-amber-600' : 'text-red-600'}`}>{promedio}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-10 py-8">Actividad / Evaluación</th>
                                <th className="px-10 py-8 w-40 text-center">Calificación</th>
                                <th className="px-10 py-8">Comentario del Docente</th>
                                <th className="px-10 py-8 text-right">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {notas.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="space-y-4">
                                            <FileText className="w-12 h-12 text-gray-200 mx-auto" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No hay registros aún</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                notas.map((n: any) => (
                                    <tr key={n.id} className="group hover:bg-amber-50/20 transition-colors">
                                        <td className="px-10 py-8">
                                            <h4 className="font-black text-gray-700 text-lg group-hover:text-amber-700 transition-colors">{n.actividad?.nombre_actividad}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold mt-1 inline-block bg-gray-100 px-2 py-0.5 rounded uppercase">{n.actividad?.tipo?.nombre || 'General'}</p>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className={`text-3xl font-black tracking-tighter ${parseFloat(n.nota) >= 11 ? 'text-blue-600' : 'text-red-600'} bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 group-hover:bg-white transition-all group-hover:shadow-lg`}>
                                                {n.nota}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="bg-gray-50 p-4 rounded-xl text-gray-600 font-medium italic border-l-4 border-amber-400 group-hover:bg-white transition-all">
                                                {n.observacion || "Sin comentarios adicionales."}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right text-gray-400 font-bold text-xs">
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex bg-blue-50 border border-blue-100 p-6 rounded-[2rem] text-blue-800 space-x-4">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div className="space-y-1">
                    <p className="font-black text-sm uppercase tracking-tight">Sobre tu Libreta Digital</p>
                    <p className="text-sm font-medium opacity-80 leading-relaxed">
                        Este registro muestra el promedio de tus actividades calificadas. Recuerda que los promedios de unidad se cierran al finalizar cada bimestre según las fórmulas del plan curricular.
                    </p>
                </div>
            </div>
        </div>
    );
}
