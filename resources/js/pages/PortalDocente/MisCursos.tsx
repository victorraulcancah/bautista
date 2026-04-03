import { Head, Link } from '@inertiajs/react';
import { Book, GraduationCap, Users, Search, Filter, MoreVertical, LayoutGrid, List, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel Docente', href: '/docente/dashboard' },
    { title: 'Mis Cursos', href: '/docente/mis-cursos' },
];

export default function DocenteMisCursosPage() {
    const [cursos, setCursos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        api.get('/docente/mis-cursos')
            .then(res => setCursos(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-10 text-center font-black animate-pulse text-indigo-600">Cargando mis materias...</div>
        </AppLayout>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
        <div className="min-h-screen bg-[#FDFDFF] p-8 space-y-10">
            <Head title="Mis Materias Asignadas" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Mis Materias</h1>
                    <p className="text-gray-500 font-medium italic">Listado completo de cursos y secciones a tu cargo.</p>
                </div>
                
                <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Buscar por nombre de curso o grado..." className="pl-11 h-12 rounded-2xl border-gray-100 focus:ring-indigo-100" />
                </div>
                <Button variant="outline" className="rounded-2xl h-12 px-6 border-gray-100 font-bold text-gray-500">
                    <Filter className="w-4 h-4 mr-2" /> Filtrar Por Nivel
                </Button>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cursos.map((c: any) => (
                        <div key={c.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col hover:shadow-indigo-100 transition-all group border-b-8 border-b-indigo-500">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-indigo-50 p-4 rounded-3xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Book className="w-8 h-8" />
                                </div>
                                <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-200">
                                        {c.seccion?.grado?.nivel_educativo?.nombre || 'General'}
                                    </span>
                                    <h4 className="text-2xl font-black text-gray-900 mt-3 line-clamp-2">{c.curso?.nombre}</h4>
                                    <p className="text-indigo-600 font-bold text-sm">{c.seccion?.grado?.nombre} - {c.seccion?.nombre}</p>
                                </div>

                                <div className="flex items-center space-x-6 pt-4">
                                    <div className="flex items-center text-gray-400 font-bold text-xs uppercase tracking-tighter">
                                        <Users className="w-4 h-4 mr-2" /> 28 Alumnos
                                    </div>
                                    <div className="flex items-center text-gray-400 font-bold text-xs uppercase tracking-tighter">
                                        <GraduationCap className="w-4 h-4 mr-2" /> Bimestre 1
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                                <Link href={`/docente/cursos/${c.docen_curso_id}/contenido`} className="flex-1">
                                    <Button variant="outline" className="w-full h-12 rounded-2xl border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-all">
                                        Contenido
                                    </Button>
                                </Link>
                                <Link href={`/docente/cursos/${c.docen_curso_id}/asistencia`} className="flex-1">
                                    <Button variant="outline" className="w-full h-12 rounded-2xl border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-all">
                                        Asistencia
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/80 border-b text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-6">Curso / Materia</th>
                                <th className="px-8 py-6">Grado y Sección</th>
                                <th className="px-8 py-6">Nivel</th>
                                <th className="px-8 py-6">Periodo Lectivo</th>
                                <th className="px-8 py-6 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {cursos.map((c: any) => (
                                <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <p className="font-black text-gray-800">{c.curso?.nombre}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-indigo-600">{c.seccion?.grado?.nombre} {c.seccion?.nombre}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-bold text-gray-500">{c.seccion?.grado?.nivel_educativo?.nombre}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-bold text-gray-500">{c.apertura?.nombre || '2026'}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Link href={`/docente/cursos/${c.docen_curso_id}/contenido`}>
                                                <Button size="sm" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-lg">
                                                    <Settings className="w-5 h-5" />
                                                </Button>
                                            </Link>
                                            <Link href="/notas">
                                                <Button size="sm" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-lg">
                                                    <GraduationCap className="w-5 h-5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        </AppLayout>
    );
}
