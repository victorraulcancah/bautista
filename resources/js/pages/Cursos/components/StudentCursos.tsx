import { Search, Filter, Grid, List as ListIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import CourseCard from './CourseCard';

const COURSE_COLORS = [
    '#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#0891b2', '#4f46e5'
];

export default function StudentCursos() {
    const [cursos, setCursos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        api.get('/alumno/cursos')
            .then(res => setCursos(res.data))
            .finally(() => setLoading(false));
    }, []);

    const filteredCursos = cursos.filter(c => 
        c.curso?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        c.docente?.perfil?.primer_nombre?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Cargando tus cursos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Cabecera de Control - Estilo Blackboard (Igual que docente) */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-none flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button 
                        variant={viewMode === 'grid' ? 'default' : 'outline'} 
                        size="icon" 
                        onClick={() => setViewMode('grid')}
                        className="rounded-xl h-11 w-11"
                    >
                        <Grid size={18} />
                    </Button>
                    <Button 
                        variant={viewMode === 'list' ? 'default' : 'outline'} 
                        size="icon" 
                        onClick={() => setViewMode('list')}
                        className="rounded-xl h-11 w-11"
                    >
                        <ListIcon size={18} />
                    </Button>
                </div>

                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                        placeholder="Buscar en mis cursos..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-12 pl-12 rounded-2xl bg-gray-50 border-none font-bold focus-visible:ring-2 focus-visible:ring-blue-600/20"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <select className="h-11 px-4 rounded-xl bg-gray-50 border-none font-bold text-xs text-gray-600 focus:ring-2 focus:ring-blue-600/20 outline-none cursor-pointer">
                        <option>Mis Cursos 2024</option>
                        <option>Todos los periodos</option>
                    </select>
                    <Button variant="outline" className="h-11 rounded-xl border-gray-100 gap-2 font-bold text-xs uppercase tracking-widest">
                        <Filter size={16} /> Filtros
                    </Button>
                </div>
            </div>

            {/* Contador de resultados */}
            <div className="flex items-center gap-3 px-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{filteredCursos.length} Materias activas</span>
                <div className="h-px flex-1 bg-gray-50" />
            </div>

            {/* Grid de Cursos para Alumnos */}
            <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredCursos.map((c, i) => (
                    <CourseCard 
                        key={c.id || c.docen_curso_id}
                        id={c.docen_curso_id?.toString() || c.id?.toString()}
                        courseCode={`COD-${c.curso_id}`}
                        title={c.curso?.nombre}
                        status="Activo"
                        color={COURSE_COLORS[i % COURSE_COLORS.length]}
                        href={`/alumno/cursos/${c.docen_curso_id}`}
                        role="student"
                        professor={`${c.docente?.perfil?.primer_nombre} ${c.docente?.perfil?.apellido_paterno}`}
                        progress={65} // Hardcoded por ahora, luego integrar progreso real
                        term="2024-I"
                    />
                ))}
            </div>

            {filteredCursos.length === 0 && (
                <div className="p-20 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold">No tienes cursos que coincidan con la búsqueda.</p>
                </div>
            )}
        </div>
    );
}
