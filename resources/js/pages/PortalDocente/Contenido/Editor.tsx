import { Head, Link } from '@inertiajs/react';
import { Plus, ChevronRight, FileText, Layout, Settings, BookOpen, Trash2, Edit3, Save, X, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import api from '@/lib/api';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel Docente', href: '/docente/dashboard' },
    { title: 'Mis Cursos', href: '/docente/mis-cursos' },
    { title: 'Contenido del Curso', href: '#' },
];

export default function ContenidoEditor({ docenteCursoId }: { docenteCursoId: number }) {
    const [unidades, setUnidades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUnidadForm, setShowUnidadForm] = useState(false);
    const [nuevaUnidad, setNuevaUnidad] = useState('');

    useEffect(() => {
        loadContent();
    }, [docenteCursoId]);

    const loadContent = () => {
        api.get(`/alumno/curso/${docenteCursoId}`) // Reusing the same data structure
            .then(res => setUnidades(res.data))
            .finally(() => setLoading(false));
    };

    const addUnidad = () => {
        if (!nuevaUnidad) {
return;
}

        api.post('/docente/unidad', { docente_curso_id: docenteCursoId, titulo: nuevaUnidad })
            .then(() => {
                setNuevaUnidad('');
                setShowUnidadForm(false);
                loadContent();
            });
    };

    const addClase = (unidadId: number) => {
        const titulo = prompt('Título de la nueva sesión:');

        if (!titulo) {
return;
}

        api.post('/docente/clase', { unidad_id: unidadId, titulo })
            .then(() => loadContent());
    };

    const addActividad = (claseId: number, tipoId: number) => {
        const nombre = prompt(tipoId === 3 ? 'Nombre del Cuestionario/Examen:' : 'Nombre de la actividad/tarea:');

        if (!nombre) {
return;
}

        api.post('/docente/actividad', { id_clase_curso: claseId, nombre_actividad: nombre, tipo_id: tipoId })
            .then(() => loadContent());
    };

    if (loading) {
return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-10 text-center font-black animate-pulse text-indigo-600 uppercase tracking-widest">Abriendo Gestor de Contenido...</div>
        </AppLayout>
    );
}

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
        <div className="min-h-screen bg-[#FDFDFF] p-4 md:p-10 space-y-10 font-sans">
            <Head title="Gestor de Contenido" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center">
                        <Layout className="w-8 h-8 mr-4 text-indigo-600" /> Estructura del Curso
                    </h1>
                    <p className="text-gray-500 font-medium italic">Organiza tus unidades, sesiones y tareas para tus alumnos.</p>
                </div>
                <div className="flex space-x-3">
                    <Button 
                        onClick={() => setShowUnidadForm(true)}
                        className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-bold"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" /> Nueva Unidad
                    </Button>
                </div>
            </div>

            {showUnidadForm && (
                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-2xl flex items-center space-x-4 animate-in fade-in zoom-in-95 duration-300">
                    <Input 
                        placeholder="Nombre de la nueva unidad..." 
                        value={nuevaUnidad}
                        onChange={e => setNuevaUnidad(e.target.value)}
                        className="flex-1 h-12 rounded-xl border-gray-100 font-bold"
                    />
                    <Button onClick={addUnidad} className="bg-indigo-600 rounded-xl h-12 px-8 font-black">Crear</Button>
                    <Button variant="ghost" onClick={() => setShowUnidadForm(false)} className="rounded-xl h-12 px-6 font-bold text-gray-400"><X /></Button>
                </div>
            )}

            <div className="space-y-10">
                {unidades.map((u, i) => (
                    <div key={u.unidad_id} className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/30 overflow-hidden">
                        <div className="bg-gray-50/50 p-8 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-indigo-100">
                                    {i + 1}
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight">{u.titulo}</h3>
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => addClase(u.unidad_id)} className="rounded-xl border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 font-bold h-9">
                                    <Plus className="w-4 h-4 mr-2" /> Añadir Sesión
                                </Button>
                                <Button variant="ghost" size="sm" className="rounded-xl text-gray-400 hover:text-rose-500 h-9">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {u.clases.length === 0 ? (
                                <p className="text-center py-10 italic text-gray-400 font-medium">No hay sesiones en esta unidad.</p>
                            ) : (
                                u.clases.map((clase: any) => (
                                    <div key={clase.clase_id} className="border border-gray-50 rounded-[2rem] p-6 hover:bg-gray-50/30 transition-colors group">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm group-hover:text-indigo-600 transition-colors">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-gray-800 tracking-tight">{clase.titulo}</h4>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sesión {clase.orden}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" onClick={() => addActividad(clase.clase_id, 1)} className="h-8 rounded-lg text-indigo-600 font-bold hover:bg-indigo-50">
                                                    + Tarea
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => addActividad(clase.clase_id, 3)} className="h-8 rounded-lg text-emerald-600 font-bold hover:bg-emerald-50">
                                                    + Examen
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg text-gray-400">
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Activities list for this class */}
                                            {clase.actividades?.map((act: any) => (
                                                <div key={act.actividad_id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm border-l-4 border-l-indigo-400">
                                                    <div className="flex items-center space-x-3">
                                                        <FileText className="w-4 h-4 text-indigo-400" />
                                                        <span className="text-sm font-bold text-gray-700">{act.nombre_actividad}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        {(act.id_tipo_actividad === 2 || act.id_tipo_actividad === 3) && (
                                                            <Link href={`/docente/cursos/${docenteCursoId}/cuestionario/${act.actividad_id}`}>
                                                                <button className="text-emerald-400 hover:text-emerald-600 p-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" title="Abrir Constructor de Examen">
                                                                    <Edit3 className="w-4 h-4" />
                                                                </button>
                                                            </Link>
                                                        )}
                                                        <button className="text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {clase.actividades?.length === 0 && (
                                                <div className="col-span-full border-2 border-dotted border-gray-100 rounded-2xl py-4 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                                    Sin Actividades Programadas
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </AppLayout>
    );
}
