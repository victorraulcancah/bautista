import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Download, Filter, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

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
            `/docente/cursos/${cursoSeleccionado}/asistencias/exportar?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
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

            <div className="min-h-screen bg-[#FDFDFF] p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                            Asistencia General
                        </h1>
                        <p className="text-gray-500 font-medium italic mt-2">
                            Consulta y exporta registros de asistencia
                        </p>
                    </div>
                    <Link href="/docente/dashboard">
                        <Button variant="outline" className="rounded-2xl">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                    </Link>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl">
                    <h3 className="text-2xl font-black text-gray-900 mb-6">Filtros de Búsqueda</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Curso / Materia
                            </label>
                            <select
                                value={cursoSeleccionado}
                                onChange={(e) => setCursoSeleccionado(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">Seleccione un curso</option>
                                {cursos.map((curso) => (
                                    <option key={curso.docen_curso_id} value={curso.docen_curso_id}>
                                        {curso.curso?.nombre} - {curso.seccion?.grado?.nombre} {curso.seccion?.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Fecha Inicio
                            </label>
                            <Input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="rounded-2xl"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Fecha Fin
                            </label>
                            <Input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="rounded-2xl"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-6">
                        <Button
                            onClick={buscarAsistencias}
                            disabled={!cursoSeleccionado || loading}
                            className="rounded-2xl bg-indigo-600"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {loading ? 'Buscando...' : 'Buscar'}
                        </Button>

                        {asistencias.length > 0 && (
                            <Button
                                onClick={exportarAsistencias}
                                variant="outline"
                                className="rounded-2xl"
                            >
                                <Download className="w-4 h-4 mr-2" /> Exportar
                            </Button>
                        )}
                    </div>
                </div>

                {asistencias.length > 0 && (
                    <>
                        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-lg">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por nombre del estudiante..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="pl-11 h-12 rounded-2xl"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#00a65a] text-white">
                                        <tr>
                                            <th className="px-6 py-4 font-black uppercase tracking-wider">#</th>
                                            <th className="px-6 py-4 font-black uppercase tracking-wider">Estudiante</th>
                                            <th className="px-6 py-4 font-black uppercase tracking-wider text-center">
                                                Total Clases
                                            </th>
                                            <th className="px-6 py-4 font-black uppercase tracking-wider text-center">
                                                Asistencias
                                            </th>
                                            <th className="px-6 py-4 font-black uppercase tracking-wider text-center">
                                                Faltas
                                            </th>
                                            <th className="px-6 py-4 font-black uppercase tracking-wider text-center">
                                                Tardanzas
                                            </th>
                                            <th className="px-6 py-4 font-black uppercase tracking-wider text-center">
                                                % Asistencia
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {asistenciasFiltradas.map((asistencia, index) => {
                                            const porcentaje = asistencia.total_clases > 0
                                                ? (asistencia.asistencias / asistencia.total_clases) * 100
                                                : 0;

                                            return (
                                                <tr key={asistencia.estudiante_id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-gray-900">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">
                                                            {asistencia.primer_nombre} {asistencia.segundo_nombre}
                                                        </div>
                                                        <div className="text-gray-500 text-xs">
                                                            {asistencia.apellido_paterno} {asistencia.apellido_materno}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-gray-700">
                                                        {asistencia.total_clases}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                            {asistencia.asistencias}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                            {asistencia.faltas}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                                            {asistencia.tardanzas}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full ${
                                                                        porcentaje >= 80
                                                                            ? 'bg-green-500'
                                                                            : porcentaje >= 60
                                                                            ? 'bg-amber-500'
                                                                            : 'bg-red-500'
                                                                    }`}
                                                                    style={{ width: `${porcentaje}%` }}
                                                                />
                                                            </div>
                                                            <span className="font-bold text-gray-700 text-xs">
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
                        </div>
                    </>
                )}

                {!loading && asistencias.length === 0 && cursoSeleccionado && (
                    <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 italic">
                            No se encontraron registros de asistencia para los filtros seleccionados
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
