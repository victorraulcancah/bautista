import { Head, Link } from '@inertiajs/react';
import { BookOpen, ChevronRight, FileText, PlayCircle, ClipboardList, CheckCircle2, Circle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function CursoDetalle({ cursoId }: { cursoId: number }) {
    const [unidades, setUnidades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/alumno/curso/${cursoId}`)
            .then(res => setUnidades(res.data))
            .finally(() => setLoading(false));
    }, [cursoId]);

    if (loading) return <div className="p-10 text-center font-black animate-pulse text-indigo-600">Cargando material del curso...</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FD] p-4 md:p-10 space-y-10 font-sans">
            <Head title="Detalle del Curso" />

            {/* Header / Breadcrumb */}
            <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <Link href="/alumno/cursos" className="hover:text-indigo-600 transition-colors">Mis Cursos</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900">Detalle del Curso</span>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Contenido Académico</h1>
                <p className="text-gray-500 font-medium">Explora las unidades y sesiones programadas para este periodo.</p>
            </div>

            {/* Units List */}
            <div className="space-y-12">
                {unidades.length === 0 ? (
                    <div className="p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 italic text-gray-400 font-bold">
                        Aún no se ha publicado contenido para este curso.
                    </div>
                ) : (
                    unidades.map((u, i) => (
                        <div key={u.unidad_id} className="space-y-6">
                            <div className="flex items-center space-x-4 px-2">
                                <div className="bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-indigo-100">
                                    {i + 1}
                                </div>
                                <h3 className="text-2xl font-black text-gray-800">{u.titulo}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {u.clases.map((clase: any) => (
                                    <div key={clase.clase_id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-indigo-100 transition-all group relative overflow-hidden flex flex-col justify-between">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
                                        
                                        <div className="relative z-10 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Clase {clase.orden}</span>
                                                {clase.completada ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-gray-200" />}
                                            </div>
                                            <h4 className="text-xl font-black text-gray-800 line-clamp-2">{clase.titulo}</h4>
                                            <p className="text-sm text-gray-400 line-clamp-2 font-medium">{clase.descripcion || 'Sin descripción adicional.'}</p>
                                        </div>

                                        <div className="mt-8 relative z-10">
                                            <Link href={`/alumno/clase/${clase.clase_id}`}>
                                                <Button className="w-full h-12 rounded-2xl bg-gray-900 group-hover:bg-indigo-600 font-black text-xs uppercase tracking-widest transition-colors shadow-xl shadow-gray-100">
                                                    Entrar a Clase <ChevronRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
