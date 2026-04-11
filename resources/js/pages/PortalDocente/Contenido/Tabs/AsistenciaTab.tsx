import { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface Props {
    docenteCursoId: number;
}

interface AttendanceRecord {
    fecha: string;
    estudiantes: {
        estu_id: number;
        nombre: string;
        estado: 'P' | 'F' | 'T' | 'J';
        observacion?: string;
    }[];
}

export default function AsistenciaTab({ docenteCursoId }: Props) {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateFilter, setDateFilter] = useState({ desde: '', hasta: '' });
    const [searchStudent, setSearchStudent] = useState('');
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadAttendance();
    }, [docenteCursoId]);

    const loadAttendance = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/docente/curso/${docenteCursoId}/asistencia-matrix`, {
                params: {
                    desde: dateFilter.desde || undefined,
                    hasta: dateFilter.hasta || undefined,
                }
            });
            setRecords(res.data.records || []);
            setStats(res.data.stats || null);
        } catch (error) {
            console.error('Error loading attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportAttendance = () => {
        const params = new URLSearchParams();
        if (dateFilter.desde) params.append('desde', dateFilter.desde);
        if (dateFilter.hasta) params.append('hasta', dateFilter.hasta);
        window.open(`/api/docente/curso/${docenteCursoId}/exportar-asistencia?${params.toString()}`, '_blank');
    };

    const getStatusBadge = (estado: string) => {
        const badges = {
            'P': { label: 'Presente', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            'F': { label: 'Falta', class: 'bg-rose-50 text-rose-600 border-rose-100' },
            'T': { label: 'Tardanza', class: 'bg-amber-50 text-amber-600 border-amber-100' },
            'J': { label: 'Justificado', class: 'bg-blue-50 text-blue-600 border-blue-100' },
        };
        const badge = badges[estado as keyof typeof badges] || badges['F'];
        return (
            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${badge.class}`}>
                {badge.label}
            </span>
        );
    };

    const filteredRecords = records.map(record => ({
        ...record,
        estudiantes: record.estudiantes.filter(e => 
            !searchStudent || e.nombre.toLowerCase().includes(searchStudent.toLowerCase())
        )
    })).filter(record => record.estudiantes.length > 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Historial de Asistencia</h2>
                    <p className="text-gray-500 text-sm">Revisa y exporta el registro de asistencia del curso.</p>
                </div>
                <Button 
                    onClick={exportAttendance}
                    disabled={loading || records.length === 0}
                    className="rounded-2xl h-12 px-6 bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-emerald-100"
                >
                    <Download size={16} /> Exportar Excel
                </Button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="rounded-[2rem] border-none shadow-sm p-6 bg-gradient-to-br from-emerald-50 to-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Clases</p>
                                <p className="text-3xl font-black text-emerald-600 mt-1">{stats.totalClases || 0}</p>
                            </div>
                            <div className="size-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                <Calendar size={20} className="text-emerald-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[2rem] border-none shadow-sm p-6 bg-gradient-to-br from-blue-50 to-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Estudiantes</p>
                                <p className="text-3xl font-black text-blue-600 mt-1">{stats.totalEstudiantes || 0}</p>
                            </div>
                            <div className="size-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                                <Users size={20} className="text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[2rem] border-none shadow-sm p-6 bg-gradient-to-br from-purple-50 to-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Asistencia Prom.</p>
                                <p className="text-3xl font-black text-purple-600 mt-1">{stats.promedioAsistencia || 0}%</p>
                            </div>
                            <div className="size-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                                <TrendingUp size={20} className="text-purple-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-[2rem] border-none shadow-sm p-6 bg-gradient-to-br from-rose-50 to-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Faltas Totales</p>
                                <p className="text-3xl font-black text-rose-600 mt-1">{stats.totalFaltas || 0}</p>
                            </div>
                            <div className="size-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                                <Filter size={20} className="text-rose-600" />
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="rounded-[2.5rem] border-none shadow-sm p-6 bg-white">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Buscar Estudiante</label>
                        <Input 
                            value={searchStudent}
                            onChange={(e) => setSearchStudent(e.target.value)}
                            placeholder="Nombre del estudiante..."
                            className="rounded-xl h-11 border-gray-200 font-medium"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Desde</label>
                        <Input 
                            type="date"
                            value={dateFilter.desde}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, desde: e.target.value }))}
                            className="rounded-xl h-11 border-gray-200 font-medium"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Hasta</label>
                        <Input 
                            type="date"
                            value={dateFilter.hasta}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, hasta: e.target.value }))}
                            className="rounded-xl h-11 border-gray-200 font-medium"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button 
                            onClick={loadAttendance}
                            disabled={loading}
                            className="rounded-xl h-11 px-6 bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] uppercase tracking-widest"
                        >
                            Aplicar Filtros
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Attendance Table */}
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                {loading ? (
                    <div className="p-20 text-center animate-pulse font-black text-emerald-400 uppercase tracking-[0.2em] text-xs">
                        Cargando Historial...
                    </div>
                ) : filteredRecords.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="p-6 sticky left-0 bg-gray-50 z-10 border-r border-gray-100">Fecha</th>
                                    <th className="p-6">Estudiante</th>
                                    <th className="p-6 text-center">Estado</th>
                                    <th className="p-6">Observación</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRecords.map((record, idx) => (
                                    record.estudiantes.map((estudiante, estudianteIdx) => (
                                        <tr key={`${idx}-${estudianteIdx}`} className="hover:bg-gray-50/50 transition-colors">
                                            {estudianteIdx === 0 && (
                                                <td 
                                                    rowSpan={record.estudiantes.length} 
                                                    className="p-6 sticky left-0 bg-white border-r border-gray-100 font-bold text-gray-700 text-sm align-top"
                                                >
                                                    {new Date(record.fecha).toLocaleDateString('es-PE', { 
                                                        weekday: 'short', 
                                                        year: 'numeric', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </td>
                                            )}
                                            <td className="p-6 font-medium text-gray-700 text-sm">{estudiante.nombre}</td>
                                            <td className="p-6 text-center">{getStatusBadge(estudiante.estado)}</td>
                                            <td className="p-6 text-sm text-gray-500">{estudiante.observacion || '-'}</td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="size-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300">
                            <Calendar size={40} />
                        </div>
                        <div className="max-w-xs space-y-2">
                            <p className="font-black uppercase tracking-widest text-sm text-gray-900">Sin Registros</p>
                            <p className="text-xs font-bold text-gray-400 leading-relaxed">
                                No hay registros de asistencia para mostrar. Toma asistencia desde el menú principal.
                            </p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
