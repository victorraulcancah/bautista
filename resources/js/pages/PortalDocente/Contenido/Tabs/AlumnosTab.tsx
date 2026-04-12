import { useState, useEffect } from 'react';
import { Users, Download, Search, TrendingUp, Award, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface Props {
    docenteCursoId: number;
}

interface Student {
    estu_id: number;
    nombre: string;
    foto?: string;
    promedio: number;
    asistencia: number;
    progreso: number;
    actividadesCompletadas: number;
    actividadesTotales: number;
}

export default function AlumnosTab({ docenteCursoId }: Props) {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'nombre' | 'promedio' | 'asistencia'>('nombre');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    useEffect(() => {
        loadStudents();
    }, [docenteCursoId]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/docente/curso/${docenteCursoId}/alumnos`);
            setStudents(res.data.data || []);
        } catch (error) {
            console.error('Error loading students:', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const exportStudents = () => {
        window.open(`/api/docente/curso/${docenteCursoId}/exportar-alumnos`, '_blank');
    };

    const filteredStudents = students
        .filter(s => !search || s.nombre.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'nombre') return a.nombre.localeCompare(b.nombre);
            if (sortBy === 'promedio') return b.promedio - a.promedio;
            if (sortBy === 'asistencia') return b.asistencia - a.asistencia;
            return 0;
        });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Estudiantes del Curso</h2>
                    <p className="text-gray-500 text-sm">Gestiona y revisa el progreso de tus estudiantes.</p>
                </div>
                <Button 
                    onClick={exportStudents}
                    disabled={loading || students.length === 0}
                    className="rounded-2xl h-12 px-6 bg-emerald-600 hover:bg-emerald-700 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-emerald-100"
                >
                    <Download size={16} /> Exportar Lista
                </Button>
            </div>

            {/* Search and Sort */}
            <Card className="rounded-[2.5rem] border-none shadow-sm p-6 bg-white">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <Input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar estudiante por nombre..."
                            className="rounded-xl h-12 pl-11 border-gray-200 font-medium"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant={sortBy === 'nombre' ? 'default' : 'outline'}
                            onClick={() => setSortBy('nombre')}
                            className="rounded-xl h-12 px-4 font-bold text-[10px] uppercase tracking-widest"
                        >
                            Nombre
                        </Button>
                        <Button 
                            variant={sortBy === 'promedio' ? 'default' : 'outline'}
                            onClick={() => setSortBy('promedio')}
                            className="rounded-xl h-12 px-4 font-bold text-[10px] uppercase tracking-widest"
                        >
                            Promedio
                        </Button>
                        <Button 
                            variant={sortBy === 'asistencia' ? 'default' : 'outline'}
                            onClick={() => setSortBy('asistencia')}
                            className="rounded-xl h-12 px-4 font-bold text-[10px] uppercase tracking-widest"
                        >
                            Asistencia
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Students Grid */}
            {loading ? (
                <div className="p-20 text-center animate-pulse font-black text-emerald-400 uppercase tracking-[0.2em] text-xs">
                    Cargando Estudiantes...
                </div>
            ) : filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => (
                        <Card 
                            key={student.estu_id}
                            className="rounded-[2rem] border-none shadow-sm hover:shadow-md transition-all p-6 bg-white cursor-pointer group"
                            onClick={() => setSelectedStudent(student)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="size-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xl shrink-0">
                                    {student.foto ? (
                                        <img src={student.foto} alt={student.nombre} className="size-full rounded-2xl object-cover" />
                                    ) : (
                                        student.nombre.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-gray-900 text-sm leading-tight truncate group-hover:text-emerald-600 transition-colors">
                                        {student.nombre}
                                    </h3>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                        ID: {student.estu_id}
                                    </p>
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-600 transition-colors shrink-0" />
                            </div>

                            <div className="mt-6 space-y-3">
                                {/* Promedio */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <Award size={14} className="text-blue-600" />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Promedio</span>
                                    </div>
                                    <span className={`text-lg font-black ${student.promedio >= 14 ? 'text-emerald-600' : student.promedio >= 11 ? 'text-amber-600' : 'text-rose-600'}`}>
                                        {student.promedio.toFixed(1)}
                                    </span>
                                </div>

                                {/* Asistencia */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-xl bg-purple-50 flex items-center justify-center">
                                            <Calendar size={14} className="text-purple-600" />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asistencia</span>
                                    </div>
                                    <span className={`text-lg font-black ${student.asistencia >= 85 ? 'text-emerald-600' : student.asistencia >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                                        {student.asistencia}%
                                    </span>
                                </div>

                                {/* Progreso */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                <TrendingUp size={14} className="text-emerald-600" />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progreso</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500">
                                            {student.actividadesCompletadas}/{student.actividadesTotales}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                                            style={{ width: `${student.progreso}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="size-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300">
                        <Users size={40} />
                    </div>
                    <div className="max-w-xs space-y-2">
                        <p className="font-black uppercase tracking-widest text-sm text-gray-900">Sin Estudiantes</p>
                        <p className="text-xs font-bold text-gray-400 leading-relaxed">
                            {search ? 'No se encontraron estudiantes con ese nombre.' : 'No hay estudiantes matriculados en este curso.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedStudent(null)}>
                    <Card 
                        className="w-full max-w-2xl rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-8 space-y-6 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start gap-6">
                            <div className="size-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-600 font-black text-3xl shrink-0">
                                {selectedStudent.foto ? (
                                    <img src={selectedStudent.foto} alt={selectedStudent.nombre} className="size-full rounded-3xl object-cover" />
                                ) : (
                                    selectedStudent.nombre.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-black text-gray-900 leading-tight">{selectedStudent.nombre}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {selectedStudent.estu_id}</p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="size-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                                        <Award size={18} className="text-blue-600" />
                                    </div>
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Promedio</span>
                                </div>
                                <p className={`text-4xl font-black ${selectedStudent.promedio >= 14 ? 'text-emerald-600' : selectedStudent.promedio >= 11 ? 'text-amber-600' : 'text-rose-600'}`}>
                                    {selectedStudent.promedio.toFixed(1)}
                                </p>
                            </div>

                            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 to-white border border-purple-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="size-10 rounded-2xl bg-purple-100 flex items-center justify-center">
                                        <Calendar size={18} className="text-purple-600" />
                                    </div>
                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Asistencia</span>
                                </div>
                                <p className={`text-4xl font-black ${selectedStudent.asistencia >= 85 ? 'text-emerald-600' : selectedStudent.asistencia >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                                    {selectedStudent.asistencia}%
                                </p>
                            </div>

                            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="size-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                        <TrendingUp size={18} className="text-emerald-600" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Progreso</span>
                                </div>
                                <p className="text-4xl font-black text-emerald-600">{selectedStudent.progreso}%</p>
                                <p className="text-xs font-bold text-gray-500 mt-2">
                                    {selectedStudent.actividadesCompletadas} de {selectedStudent.actividadesTotales} actividades
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="p-6 rounded-3xl bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progreso del Curso</span>
                                <span className="text-sm font-black text-emerald-600">{selectedStudent.progreso}%</span>
                            </div>
                            <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                                    style={{ width: `${selectedStudent.progreso}%` }}
                                />
                            </div>
                        </div>

                        {/* Close Button */}
                        <Button 
                            onClick={() => setSelectedStudent(null)}
                            className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                            Cerrar
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}
