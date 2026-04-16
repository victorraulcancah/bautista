import { Head } from '@inertiajs/react';
import { CalendarCheck, Clock, AlertCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import SectionCard from '@/components/shared/SectionCard';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Portal Familia', href: '/padre/dashboard' },
    { title: 'Asistencia', href: '#' },
];

interface AsistenciaData {
    asistencia_id?: number;
    fecha: string;
    estado: string;
    turno?: string;
    hora_entrada?: string;
    hora_salida?: string;
}

const getStatusColor = (estado: string) => {
    switch (estado) {
        case '1': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        case '0': return 'text-red-600 bg-red-50 border-red-100';
        case 'T': return 'text-orange-600 bg-orange-50 border-orange-100';
        default:  return 'text-gray-600 bg-gray-50 border-gray-100';
    }
};

const getStatusLabel = (estado: string) => {
    switch (estado) {
        case '1': return 'Asistió';
        case '0': return 'Falta';
        case 'T': return 'Tardanza';
        default:  return 'Desconocido';
    }
};

export default function AsistenciaHijosPage() {
    const [hijos, setHijos] = useState<any[]>([]);
    const [hijoSel, setHijoSel] = useState<number | null>(null);
    const [asistencias, setAsistencias] = useState<AsistenciaData[]>([]);
    const [loadingHijos, setLoadingHijos] = useState(true);
    const [loadingAsist, setLoadingAsist] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');

    // Cargar hijos al montar
    useEffect(() => {
        api.get('/padre/hijos').then(res => {
            const data = res.data || [];
            setHijos(data);
            if (data.length > 0) setHijoSel(data[0].estu_id);
        }).finally(() => setLoadingHijos(false));
    }, []);

    // Cargar asistencia cuando cambia el hijo seleccionado
    useEffect(() => {
        if (!hijoSel) return;
        setLoadingAsist(true);
        api.get(`/padre/hijo/${hijoSel}/asistencia`)
            .then(res => setAsistencias(res.data || []))
            .catch(() => setAsistencias([]))
            .finally(() => setLoadingAsist(false));
    }, [hijoSel]);

    const stats = useMemo(() => {
        const totalAsistencias = asistencias.filter(a => a.estado === '1').length;
        const totalFaltas      = asistencias.filter(a => a.estado === '0').length;
        const totalTardanzas   = asistencias.filter(a => a.estado === 'T').length;
        const total = asistencias.length;
        const porcentaje = total > 0 ? ((totalAsistencias / total) * 100).toFixed(1) : '0';
        return { totalAsistencias, totalFaltas, totalTardanzas, total, porcentaje };
    }, [asistencias]);

    const getCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay  = new Date(year, month + 1, 0);
        const days: (Date | null)[] = [];
        for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
        for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
        return days;
    };

    const getAsistenciaForDate = (date: Date | null) => {
        if (!date) return null;
        const dateStr = date.toISOString().split('T')[0];
        return asistencias.find(a => a.fecha?.split('T')[0] === dateStr || a.fecha?.split(' ')[0] === dateStr);
    };

    const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const dayNames   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

    const hijoActual = hijos.find(h => h.estu_id === hijoSel);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Asistencia de Hijos" />
            <div className="flex flex-col gap-6 p-6">

                {/* Header + selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <PageHeader
                        icon={CalendarCheck}
                        title="Control de Asistencia"
                        subtitle="Historial de ingresos y salidas de tus hijos"
                        iconColor="bg-emerald-600"
                    />

                    {/* Select hijo */}
                    {!loadingHijos && hijos.length > 0 && (
                        <select
                            value={hijoSel ?? ''}
                            onChange={e => setHijoSel(Number(e.target.value))}
                            className="rounded-xl border border-gray-200 h-10 px-4 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 min-w-[200px]"
                        >
                            {hijos.map(h => (
                                <option key={h.estu_id} value={h.estu_id}>
                                    {h.perfil?.primer_nombre} {h.perfil?.apellido_paterno}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {loadingAsist ? (
                    <div className="flex justify-center py-20">
                        <div className="size-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-white/20 rounded-xl p-3"><CheckCircle className="size-8" /></div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black">{stats.totalAsistencias}</div>
                                        <div className="text-xs font-bold uppercase tracking-wider opacity-90">Asistencias</div>
                                    </div>
                                </div>
                                <div className="text-xs opacity-75">Total de días asistidos</div>
                            </div>
                            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-white/20 rounded-xl p-3"><XCircle className="size-8" /></div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black">{stats.totalFaltas}</div>
                                        <div className="text-xs font-bold uppercase tracking-wider opacity-90">Faltas</div>
                                    </div>
                                </div>
                                <div className="text-xs opacity-75">Total de inasistencias</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-white/20 rounded-xl p-3"><AlertTriangle className="size-8" /></div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black">{stats.totalTardanzas}</div>
                                        <div className="text-xs font-bold uppercase tracking-wider opacity-90">Tardanzas</div>
                                    </div>
                                </div>
                                <div className="text-xs opacity-75">Total de llegadas tarde</div>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-white/20 rounded-xl p-3"><TrendingUp className="size-8" /></div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black">{stats.porcentaje}%</div>
                                        <div className="text-xs font-bold uppercase tracking-wider opacity-90">Porcentaje</div>
                                    </div>
                                </div>
                                <div className="text-xs opacity-75">Tasa de asistencia</div>
                            </div>
                        </div>

                        {/* Últimas asistencias */}
                        {asistencias.length > 0 && (
                            <SectionCard title={`Últimas asistencias — ${hijoActual?.perfil?.primer_nombre ?? ''}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {asistencias.slice(0, 6).map((a, idx) => {
                                        const fecha = new Date(a.fecha);
                                        return (
                                            <div key={a.asistencia_id || idx}
                                                className={`rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                                                    a.estado === '1' ? 'border-emerald-200 bg-emerald-50/50'
                                                    : a.estado === '0' ? 'border-red-200 bg-red-50/50'
                                                    : 'border-orange-200 bg-orange-50/50'
                                                }`}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="text-sm font-black text-gray-800 uppercase tracking-wide">
                                                            {fecha.toLocaleDateString('es-PE', { weekday: 'short' })}
                                                        </div>
                                                        <div className="text-2xl font-black text-gray-900">{fecha.getDate()}</div>
                                                        <div className="text-xs text-gray-600">
                                                            {fecha.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                    <div className={`rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                                                        a.estado === '1' ? 'bg-emerald-100 text-emerald-700'
                                                        : a.estado === '0' ? 'bg-red-100 text-red-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                    }`}>{getStatusLabel(a.estado)}</div>
                                                </div>
                                                <div className="space-y-1 text-xs">
                                                    {a.turno && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <CalendarIcon className="size-3" />
                                                            <span className="font-bold">{a.turno === 'M' ? 'Mañana' : a.turno === 'T' ? 'Tarde' : '-'}</span>
                                                        </div>
                                                    )}
                                                    {a.hora_entrada && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Clock className="size-3 text-emerald-500" />
                                                            <span className="font-mono font-bold">Entrada: {a.hora_entrada}</span>
                                                        </div>
                                                    )}
                                                    {a.hora_salida && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Clock className="size-3 text-rose-500" />
                                                            <span className="font-mono font-bold">Salida: {a.hora_salida}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </SectionCard>
                        )}

                        {/* Toggle vista */}
                        <div className="flex justify-end gap-2">
                            {(['calendar', 'table'] as const).map(mode => (
                                <button key={mode} onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                        viewMode === mode ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}>
                                    {mode === 'calendar' ? <><CalendarIcon className="inline-block size-4 mr-2" />Calendario</> : <><Clock className="inline-block size-4 mr-2" />Lista</>}
                                </button>
                            ))}
                        </div>

                        {/* Calendario */}
                        {viewMode === 'calendar' && (
                            <SectionCard title="Calendario de Asistencia">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-6">
                                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                            <ChevronLeft className="size-5 text-gray-600" />
                                        </button>
                                        <h3 className="text-xl font-black text-gray-800 uppercase tracking-wide">
                                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                        </h3>
                                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                            <ChevronRight className="size-5 text-gray-600" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {dayNames.map(d => (
                                            <div key={d} className="text-center py-2 text-xs font-black text-gray-500 uppercase tracking-wider">{d}</div>
                                        ))}
                                        {getCalendarDays().map((date, i) => {
                                            const asist = getAsistenciaForDate(date);
                                            const isToday = date && date.toDateString() === new Date().toDateString();
                                            return (
                                                <div key={i} className={`min-h-[80px] p-2 rounded-lg border transition-all ${
                                                    date ? isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300' : 'bg-gray-50 border-transparent'
                                                }`}>
                                                    {date && (
                                                        <>
                                                            <div className={`text-sm font-bold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>{date.getDate()}</div>
                                                            {asist && (
                                                                <div className="space-y-0.5">
                                                                    <div className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                                                        asist.estado === '1' ? 'bg-emerald-100 text-emerald-700'
                                                                        : asist.estado === '0' ? 'bg-red-100 text-red-700'
                                                                        : 'bg-orange-100 text-orange-700'
                                                                    }`}>{getStatusLabel(asist.estado)}</div>
                                                                    {asist.hora_entrada && <div className="text-[9px] text-gray-500 font-mono">↓ {asist.hora_entrada}</div>}
                                                                    {asist.hora_salida  && <div className="text-[9px] text-gray-500 font-mono">↑ {asist.hora_salida}</div>}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex gap-4 justify-center mt-4 pt-4 border-t border-gray-200">
                                        {[['bg-emerald-100 border-emerald-200','Asistió'],['bg-red-100 border-red-200','Falta'],['bg-orange-100 border-orange-200','Tardanza']].map(([cls, lbl]) => (
                                            <div key={lbl} className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded border ${cls}`} />
                                                <span className="text-xs text-gray-600">{lbl}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SectionCard>
                        )}

                        {/* Lista */}
                        {viewMode === 'table' && (
                            <SectionCard title="Historial Reciente">
                                {asistencias.length === 0 ? (
                                    <div className="py-12 text-center text-gray-400 italic">
                                        <AlertCircle className="mx-auto mb-2 size-8 opacity-20" />
                                        <p>No hay registros de asistencia.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-separate border-spacing-0 overflow-hidden rounded-xl border border-gray-100">
                                            <thead>
                                                <tr className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest">
                                                    <th className="py-3 pl-4 rounded-tl-xl border-b border-emerald-700">Fecha</th>
                                                    <th className="py-3 border-b border-emerald-700">Turno</th>
                                                    <th className="py-3 border-b border-emerald-700">Entrada</th>
                                                    <th className="py-3 border-b border-emerald-700">Salida</th>
                                                    <th className="py-3 pr-4 text-center rounded-tr-xl border-b border-emerald-700">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {asistencias.map((log, idx) => (
                                                    <tr key={log.asistencia_id || idx} className="hover:bg-gray-50/50 transition-all">
                                                        <td className="py-4 pl-4 font-bold text-gray-800 text-sm">
                                                            {new Date(log.fecha).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' })}
                                                        </td>
                                                        <td className="py-4 text-xs font-black text-indigo-600 uppercase tracking-tighter">
                                                            {log.turno === 'M' ? 'Mañana' : log.turno === 'T' ? 'Tarde' : '-'}
                                                        </td>
                                                        <td className="py-4 font-mono text-xs font-bold text-gray-600">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="size-3 text-emerald-500" />{log.hora_entrada || '--:--'}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 font-mono text-xs font-bold text-gray-600">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="size-3 text-rose-500" />{log.hora_salida || '--:--'}
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
                                    </div>
                                )}
                            </SectionCard>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
