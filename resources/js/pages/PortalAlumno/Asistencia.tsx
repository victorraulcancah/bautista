import { Head } from '@inertiajs/react';
import { CalendarCheck, Clock, FileText, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import SectionCard from '@/components/shared/SectionCard';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mi Portal', href: '/alumno/dashboard' },
    { title: 'Asistencia', href: '/alumno/asistencia' },
];

export default function Asistencia() {
    const [asistencias, setAsistencias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/alumno/asistencia')
            .then(res => setAsistencias(res.data))
            .catch(err => console.error("Error fetching attendance:", err))
            .finally(() => setLoading(false));
    }, []);

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case '1': return 'text-emerald-600 bg-emerald-50 border-emerald-100'; // Asistió
            case '0': return 'text-red-600 bg-red-50 border-red-100'; // Falta
            case 'T': return 'text-orange-600 bg-orange-50 border-orange-100'; // Tardanza
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const getStatusLabel = (estado: string) => {
        switch (estado) {
            case '1': return 'Asistió';
            case '0': return 'Falta';
            case 'T': return 'Tardanza';
            default: return 'Desconocido';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mi Asistencia" />
            
            <div className="flex flex-col gap-8 p-6">
                <PageHeader
                    icon={CalendarCheck}
                    title="Control de Asistencia"
                    subtitle="Consulta tu historial de ingresos y salidas diarias"
                    iconColor="bg-emerald-600"
                />

                <SectionCard title="Historial Reciente">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-12 text-center text-sm font-black uppercase tracking-widest text-indigo-600 animate-pulse">
                                Cargando historial...
                            </div>
                        ) : asistencias.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 italic">
                                <AlertCircle className="mx-auto mb-2 size-8 opacity-20" />
                                <p>No tienes registros de asistencia en este período.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-separate border-spacing-0 overflow-hidden rounded-xl border border-gray-100">
                                <thead>
                                    <tr className="bg-[#00a65a] text-white text-[10px] font-black uppercase tracking-widest">
                                        <th className="py-3 pl-4 first:rounded-tl-xl border-b border-green-600">Fecha</th>
                                        <th className="py-3 border-b border-green-600">Turno</th>
                                        <th className="py-3 border-b border-green-600">Entrada</th>
                                        <th className="py-3 border-b border-green-600">Salida</th>
                                        <th className="py-3 pr-4 text-center last:rounded-tr-xl border-b border-green-600">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {asistencias.map((log) => (
                                        <tr key={log.asistencia_id} className="group transition-all hover:bg-gray-50/50">
                                            <td className="py-4 pl-4 font-bold text-gray-800">
                                                {new Date(log.fecha).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' })}
                                            </td>
                                            <td className="py-4 text-xs font-black text-indigo-600 uppercase tracking-tighter">
                                                {log.turno === 'M' ? 'Mañana' : 'Tarde'}
                                            </td>
                                            <td className="py-4 font-mono text-xs font-bold text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="size-3 text-emerald-500" />
                                                    {log.hora_entrada || '--:--'}
                                                </div>
                                            </td>
                                            <td className="py-4 font-mono text-xs font-bold text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="size-3 text-rose-500" />
                                                    {log.hora_salida || '--:--'}
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className={`mx-auto w-fit rounded-lg border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusColor(log.estado)}`}>
                                                    {getStatusLabel(log.estado)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </SectionCard>

                {/* Additional Info / Tips */}
                <div className="rounded-2xl bg-indigo-50 p-6 border border-indigo-100">
                    <div className="flex gap-4">
                        <div className="rounded-xl bg-white p-3 shadow-sm text-indigo-600">
                            <AlertCircle className="size-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest mb-1">Nota Importante</h4>
                            <p className="text-sm text-indigo-700/80 leading-relaxed">
                                Recuerda marcar tu asistencia al ingresar y salir del plantel utilizando tu QR personal. 
                                Si encuentras alguna discrepancia en tus registros, por favor contacta con secretaría académica.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
