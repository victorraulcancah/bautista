import { Head, Link } from '@inertiajs/react';
import { GraduationCap, ClipboardCheck, CreditCard, ChevronLeft, Star, Clock, AlertCircle, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function HijoDetallePage({ hijoId }: { hijoId: number }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'academico' | 'asistencia' | 'pagos'>('academico');

    useEffect(() => {
        api.get(`/padre/hijo/${hijoId}/resumen`)
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, [hijoId]);

    if (loading) return <div className="p-10 text-center font-black animate-pulse text-rose-500">Cargando detalles...</div>;

    return (
        <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-10 space-y-10 font-sans">
            <Head title={`Seguimiento - ${data.hijo?.perfil?.primer_nombre}`} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                    <Link href="/padre/dashboard">
                        <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 p-0">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seguimiento Académico</p>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
                            {data.hijo?.perfil?.primer_nombre} {data.hijo?.perfil?.apellido_paterno}
                        </h1>
                    </div>
                </div>
                
                <div className="flex p-2 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    {[
                        { id: 'academico', icon: GraduationCap, label: 'Notas' },
                        { id: 'asistencia', icon: ClipboardCheck, label: 'Asistencia' },
                        { id: 'pagos', icon: CreditCard, label: 'Pagos' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all font-bold text-sm ${
                                activeTab === tab.id 
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'academico' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-xl font-black text-gray-800 flex items-center px-2">
                                <Star className="w-5 h-5 mr-3 text-amber-500" /> Últimas Calificaciones
                            </h3>
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-8 py-6">Materia / Actividad</th>
                                            <th className="px-8 py-6 w-32 text-center">Nota</th>
                                            <th className="px-8 py-6">Observación</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {data.notas.map((n: any) => (
                                            <tr key={n.actividad_id} className="hover:bg-rose-50/20 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <p className="text-xs text-rose-400 font-bold uppercase tracking-tight">{n.actividad?.clase?.unidad?.curso?.nombre}</p>
                                                    <p className="font-bold text-gray-800 text-lg leading-tight">{n.actividad?.nombre_actividad}</p>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`text-2xl font-black ${parseFloat(n.nota) >= 11 ? 'text-blue-600' : 'text-red-500'} bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 group-hover:bg-white transition-all`}>
                                                        {n.nota}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-xs text-gray-500 italic max-w-xs">{n.observacion || 'Evaluado satisfactoriamente.'}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                                <h4 className="font-black text-gray-900 border-b pb-4">Resumen de Periodo</h4>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><GraduationCap className="w-5 h-5" /></div>
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-tighter">Promedio General</p>
                                        </div>
                                        <p className="text-2xl font-black text-gray-900">16.8</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Clock className="w-5 h-5" /></div>
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-tighter">Cursos Jalados</p>
                                        </div>
                                        <p className="text-2xl font-black text-rose-600">0</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-tighter">Conducta</p>
                                        </div>
                                        <p className="text-lg font-black text-gray-900">A+</p>
                                    </div>
                                </div>
                            </div>
                            
                            <Button className="w-full h-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 text-white font-black text-lg">
                                <FileText className="w-6 h-6 mr-3" /> Descargar Libreta PDF
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'asistencia' && (
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl text-center py-20 italic text-gray-400 font-bold">
                        Resumen de asistencia detallado cargando...
                    </div>
                )}

                {activeTab === 'pagos' && (
                    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-6">Concepto / Mes</th>
                                    <th className="px-8 py-6 text-center">Monto</th>
                                    <th className="px-8 py-6 text-center">Estado</th>
                                    <th className="px-8 py-6 text-right">Fecha Pago</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.pagos.map((p: any) => (
                                    <tr key={p.pago_id} className="hover:bg-rose-50/20">
                                        <td className="px-8 py-6 font-bold text-gray-800">{p.tipo_pago || 'Mensualidad'}</td>
                                        <td className="px-8 py-6 text-center font-black">S/ {p.monto}</td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Pagado</span>
                                        </td>
                                        <td className="px-8 py-6 text-right text-gray-400 font-bold">{p.fecha_pago}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
