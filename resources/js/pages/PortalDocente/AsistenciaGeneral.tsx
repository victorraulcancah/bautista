import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Download, Filter, Search, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel Docente', href: '/docente/dashboard' },
    { title: 'Asistencia General', href: '#' },
];

export default function AsistenciaGeneralPage() {
    const [cursos, setCursos] = useState<any[]>([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState<string>('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [asistencias, setAsistencias] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        cargarCursos();
    }, []);

    const cargarCursos = () => {
        api.get('/docente/mis-cursos')
            .then((res) => setCursos(res.data));
    };

    const buscarAsistencias = () => {
        if (!cursoSeleccionado) return;

        setLoading(true);
        api.get(`/docente/cursos/${cursoSeleccionado}/asistencias`, {
            params: {
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
            },
        })
            .then((res) => setAsistencias(res.data))
            .finally(() => setLoading(false));
    };

    const exportarAsistencias = () => {
        window.open(
            `/api/docente/curso/${cursoSeleccionado}/exportar-excel`,
            '_blank'
        );
    };

    const asistenciasFiltradas = asistencias.filter((asistencia) => {
        const nombreCompleto = `${asistencia.primer_nombre} ${asistencia.segundo_nombre} ${asistencia.apellido_paterno} ${asistencia.apellido_materno}`.toLowerCase();
        return nombreCompleto.includes(busqueda.toLowerCase());
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Asistencia General" />

            <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <PageHeader 
                        icon={Calendar} 
                        title="Asistencia General" 
                        subtitle="Consulta y exporta registros históricos de asistencia de tus cursos."
                        iconColor="bg-emerald-600"
                    />
                    <Link href="/docente/dashboard">
                        <Button variant="ghost" className="rounded-2xl font-bold bg-white shadow-sm border-none hover:bg-gray-50 uppercase text-[10px] tracking-widest h-11 px-6">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                    </Link>
                </div>

                <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Filter size={20} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Filtros de Búsqueda</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Curso / Materia</label>
                            <Select onValueChange={setCursoSeleccionado} value={cursoSeleccionado}>
                                <SelectTrigger className="h-14 rounded-2xl border-none bg-gray-50 font-bold px-6 focus:ring-4 focus:ring-emerald-100 transition-all outline-none">
                                    <SelectValue placeholder="Seleccione un curso..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                    {cursos.map((curso) => (
                                        <SelectItem 
                                            key={curso.docen_curso_id} 
                                            value={curso.docen_curso_id.toString()}
                                            className="rounded-xl font-bold py-3 px-4 focus:bg-emerald-50 focus:text-emerald-600"
                                        >
                                            {curso.curso?.nombre} — {curso.seccion?.grado?.nombre} {curso.seccion?.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Fecha Inicio</label>
                            <Input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="h-14 rounded-2xl border-none bg-gray-50 font-bold px-6 focus:ring-4 focus:ring-emerald-100 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Fecha Fin</label>
                            <Input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="h-14 rounded-2xl border-none bg-gray-50 font-bold px-6 focus:ring-4 focus:ring-emerald-100 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <Button
                            onClick={buscarAsistencias}
                            disabled={!cursoSeleccionado || loading}
                            className="rounded-2xl h-14 px-10 bg-emerald-600 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-100 hover:scale-[1.02] transition-all active:scale-95"
                        >
                            {loading ? 'Buscando...' : 'Realizar Búsqueda'}
                        </Button>

                        {asistencias.length > 0 && (
                            <Button
                                onClick={exportarAsistencias}
                                variant="outline"
                                className="rounded-2xl h-14 px-10 border-emerald-100 text-emerald-600 font-black uppercase tracking-widest text-[10px] hover:bg-emerald-50"
                            >
                                <Download className="w-4 h-4 mr-2" /> Exportar Excel
                            </Button>
                        )}
                    </div>
                </Card>

                {asistencias.length > 0 ? (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                        <Card className="p-4 rounded-[1.5rem] border-none shadow-sm bg-white">
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                                <Input
                                    placeholder="Filtrar por nombre del alumno..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="pl-14 h-14 rounded-2xl border-none bg-gray-50/50 font-bold focus:ring-4 focus:ring-emerald-100 transition-all"
                                />
                            </div>
                        </Card>

                        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400">#</th>
                                            <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400">Estudiante</th>
                                            <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">Clases</th>
                                            <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">Asist.</th>
                                            <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">Faltas</th>
                                            <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">Tard.</th>
                                            <th className="px-8 py-6 font-black uppercase tracking-widest text-[10px] text-gray-400 text-center">% Rendimiento</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {asistenciasFiltradas.map((asistencia, index) => {
                                            const porcentaje = asistencia.total_clases > 0
                                                ? (asistencia.asistencias / asistencia.total_clases) * 100
                                                : 0;

                                            return (
                                                <tr key={asistencia.estudiante_id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-8 py-6 font-bold text-gray-300 group-hover:text-emerald-600 transition-colors">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-10 rounded-[1rem] bg-emerald-50 flex items-center justify-center font-black text-emerald-600 text-[10px] uppercase shadow-sm">
                                                                {asistencia.primer_nombre?.[0]}{asistencia.apellido_paterno?.[0]}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 leading-none">
                                                                    {asistencia.primer_nombre} {asistencia.segundo_nombre}
                                                                </div>
                                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-tight mt-1">
                                                                    {asistencia.apellido_paterno} {asistencia.apellido_materno}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center font-black text-gray-400">
                                                        {asistencia.total_clases}
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="inline-flex items-center justify-center size-8 rounded-xl font-black text-[11px] bg-emerald-50 text-emerald-600">
                                                            {asistencia.asistencias}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="inline-flex items-center justify-center size-8 rounded-xl font-black text-[11px] bg-rose-50 text-rose-600">
                                                            {asistencia.faltas}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="inline-flex items-center justify-center size-8 rounded-xl font-black text-[11px] bg-amber-50 text-amber-600">
                                                            {asistencia.tardanzas}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-1000 ${
                                                                        porcentaje >= 80 ? 'bg-emerald-500' : 
                                                                        porcentaje >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                                                    }`}
                                                                    style={{ width: `${porcentaje}%` }}
                                                                />
                                                            </div>
                                                            <span className="font-black text-gray-700 text-[10px] uppercase">
                                                                {porcentaje.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                ) : (
                    !loading && cursoSeleccionado && (
                        <div className="py-32 text-center space-y-4 opacity-40">
                            <div className="flex justify-center">
                                <Calendar size={80} className="text-gray-300" strokeWidth={1} />
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest text-gray-400">
                                No hay registros para este período
                            </p>
                        </div>
                    )
                )}
            </div>
        </AppLayout>
    );
}
