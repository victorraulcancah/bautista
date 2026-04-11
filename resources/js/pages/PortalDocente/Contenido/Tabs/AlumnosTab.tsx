import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Calendar, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/api';

interface Props {
    docenteCursoId: number;
}

export default function AlumnosTab({ docenteCursoId }: Props) {
    const [loading, setLoading] = useState(true);
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadAlumnos();
    }, [docenteCursoId]);

    const loadAlumnos = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/docente/curso/${docenteCursoId}/alumnos`);
            setAlumnos(res.data);
        } finally {
            setLoading(false);
        }
    };

    const filtered = alumnos.filter(a => 
        `${a.perfil?.primer_nombre} ${a.perfil?.apellido_paterno}`.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-20 text-center animate-pulse text-emerald-400 font-black uppercase text-[10px] tracking-widest">Analizando rendimiento...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Mis Estudiantes</h2>
                    <p className="text-gray-500 text-sm">Monitorea el desempeño y asistencia en tiempo real.</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
                    <Input 
                        placeholder="Buscar alumno..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-11 h-12 rounded-2xl border-none shadow-sm bg-white font-bold w-64 focus:ring-4 focus:ring-emerald-100 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(alumno => (
                    <Card key={alumno.estu_id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group p-8 space-y-6 bg-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] scale-150 rotate-12">
                            <Users size={80} />
                        </div>
                        
                        <div className="flex items-center gap-4 relative">
                            <div className="size-16 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center font-black text-2xl text-emerald-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                {alumno.perfil?.primer_nombre?.[0]}{alumno.perfil?.apellido_paterno?.[0]}
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">{alumno.perfil?.primer_nombre} {alumno.perfil?.apellido_paterno}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">DNI: {alumno.perfil?.doc_numero}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative">
                            <div className="p-4 rounded-3xl bg-gray-50/50 border border-gray-100/50">
                                <div className="flex items-center gap-1.5 mb-2 text-emerald-600">
                                    <TrendingUp size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Promedio</span>
                                </div>
                                <p className="text-xl font-black text-gray-900">{alumno.promedio_notas}</p>
                            </div>
                            <div className="p-4 rounded-3xl bg-gray-50/50 border border-gray-100/50">
                                <div className="flex items-center gap-1.5 mb-2 text-emerald-600">
                                    <Calendar size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Asistencia</span>
                                </div>
                                <p className="text-xl font-black text-gray-900">{alumno.asistencia_porcentaje}%</p>
                            </div>
                        </div>

                        <div className="space-y-1 relative">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                                <span>Progreso Curricular</span>
                                <span>{alumno.asistencia_porcentaje}%</span>
                            </div>
                            <Progress value={alumno.asistencia_porcentaje} className="h-2 bg-emerald-50 rounded-full" />
                        </div>

                        <Button variant="ghost" className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[9px] text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-transparent hover:border-emerald-100">
                            Ver Historial Detallado
                        </Button>
                    </Card>
                ))}
            </div>
            
            {filtered.length === 0 && (
                <div className="py-20 text-center opacity-30 flex flex-col items-center">
                    <Search size={64} className="mb-4 text-gray-400" />
                    <p className="font-black text-lg uppercase tracking-widest">No hay resultados para "{search}"</p>
                </div>
            )}
        </div>
    );
}
