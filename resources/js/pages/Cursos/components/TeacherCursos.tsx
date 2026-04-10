import { Search, Filter, Grid, List as ListIcon, Sparkles, BookOpen, Users, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import CourseCard from './CourseCard';

const COURSE_COLORS = [
    '#4f46e5', '#0891b2', '#059669', '#d97706', '#2563eb', '#7c3aed', '#db2777'
];

export default function TeacherCursos() {
    const [cursos, setCursos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        api.get('/docente/mis-cursos')
            .then(res => setCursos(res.data))
            .finally(() => setLoading(false));
    }, []);

    const filteredCursos = cursos.filter(c => 
        c.curso?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        c.seccion?.grado?.nombre_grado?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 rounded-full" />
                    <div className="absolute top-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="font-black text-gray-400 uppercase tracking-[0.3em] text-[10px]">Preparando tu entorno...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            
            {/* Hero Section / Welcome Banner */}
            <div className="relative overflow-hidden rounded-[3rem] bg-gray-900 p-8 md:p-12 text-white shadow-2xl shadow-indigo-200 dark:shadow-none">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                            <Sparkles size={16} className="text-yellow-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Portal del Docente</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            Gestiona tus cursos y <br /> <span className="text-indigo-400">potencia el aprendizaje</span>
                        </h1>
                        <p className="text-gray-400 font-bold text-sm md:text-base leading-relaxed">
                            Bienvenido a tu panel central. Aquí podrás gestionar unidades, sesiones, asistencia y calificaciones de tus {cursos.length} cursos asignados.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Total Horas</p>
                            <p className="text-2xl font-black">24h</p>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Secciones</p>
                            <p className="text-2xl font-black">{cursos.length}</p>
                        </div>
                    </div>
                </div>

                {/* Decoración Abstracta */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Barra de Herramientas Premium */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Buscador de gran formato */}
                <div className="lg:col-span-7 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <Input 
                        placeholder="Buscar por nombre de curso o grado..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-16 pl-14 pr-6 rounded-[1.5rem] bg-white border-2 border-gray-50 font-bold text-gray-700 shadow-xl shadow-gray-100/50 focus-visible:ring-indigo-600/20 focus-visible:border-indigo-600 transition-all dark:bg-gray-800 dark:border-gray-800 dark:shadow-none dark:text-white"
                    />
                </div>

                {/* Filtros y Vista */}
                <div className="lg:col-span-5 flex items-center gap-4">
                    <div className="flex-1 flex items-center p-2 rounded-[1.5rem] bg-gray-50 dark:bg-gray-800/50">
                        <Button 
                            variant="ghost" 
                            onClick={() => setViewMode('grid')}
                            className={`flex-1 h-12 rounded-[1.25rem] gap-2 font-black uppercase tracking-widest text-[10px] ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600 dark:bg-gray-800' : 'text-gray-400'}`}
                        >
                            <Grid size={16} /> Grid
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={() => setViewMode('list')}
                            className={`flex-1 h-12 rounded-[1.25rem] gap-2 font-black uppercase tracking-widest text-[10px] ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600 dark:bg-gray-800' : 'text-gray-400'}`}
                        >
                            <ListIcon size={16} /> Lista
                        </Button>
                    </div>

                    <Button variant="outline" className="h-16 w-16 rounded-[1.5rem] border-2 border-gray-50 shadow-xl shadow-gray-100/50 dark:border-gray-800 dark:shadow-none hover:bg-gray-50 flex items-center justify-center p-0">
                        <Filter size={20} className="text-gray-600 dark:text-gray-400" />
                    </Button>
                </div>
            </div>

            {/* Contador y Estado */}
            <div className="flex items-center gap-6 px-4">
                <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] dark:text-white">
                        {filteredCursos.length} Cursos Activos
                    </span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-800" />
            </div>

            {/* Grid de Cursos Responsivo */}
            <div className={`grid gap-10 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredCursos.map((c, i) => (
                    <CourseCard 
                        key={c.docen_curso_id}
                        id={c.docen_curso_id.toString()}
                        courseCode={`COD-${c.curso_id}`}
                        title={c.curso?.nombre}
                        status="En progreso"
                        color={COURSE_COLORS[i % COURSE_COLORS.length]}
                        href={`/docente/cursos/${c.docen_curso_id}/contenido`}
                        role="teacher"
                        professor="Tú"
                        term={c.apertura?.nombre || '2024-I'}
                    />
                ))}
            </div>

            {/* Estado Vacío Premium */}
            {filteredCursos.length === 0 && (
                <div className="p-24 text-center bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-gray-100 dark:bg-gray-800/20 dark:border-gray-800">
                    <div className="size-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 dark:bg-gray-800">
                        <Search size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 dark:text-white">No encontramos resultados</h3>
                    <p className="text-gray-400 font-bold max-w-sm mx-auto">
                        Intenta ajustar tus términos de búsqueda para encontrar el curso que necesitas.
                    </p>
                    <Button 
                        variant="link" 
                        onClick={() => setSearch('')}
                        className="mt-4 text-indigo-600 font-black uppercase tracking-widest text-[10px]"
                    >
                        Limpiar búsqueda
                    </Button>
                </div>
            )}
        </div>
    );
}
