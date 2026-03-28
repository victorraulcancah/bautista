import { Head, Link } from '@inertiajs/react';
import { Book, GraduationCap, ChevronRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AlumnoCursosPage() {
    const [cursos, setCursos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/alumno/cursos')
            .then(res => setCursos(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-center font-black animate-pulse text-blue-600">Cargando tus cursos...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8 space-y-10">
            <Head title="Mis Cursos" />

            <div className="space-y-2">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Mis Materias</h1>
                <p className="text-gray-500 font-medium">Explora tus cursos activos y revisa tu avance por unidad.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cursos.map((c: any) => (
                    <div key={c.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col hover:scale-[1.03] transition-all duration-300 group">
                        <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 relative overflow-hidden flex items-center justify-center">
                            <Book className="w-16 h-16 text-white/30 absolute -right-4 -bottom-4 rotate-12" />
                            <h3 className="text-white text-2xl font-black text-center px-4 z-10">{c.curso?.nombre}</h3>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 border border-gray-200">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Docente</p>
                                    <p className="font-bold text-gray-700">{c.docente?.perfil?.primer_nombre} {c.docente?.perfil?.apellido_paterno}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-gray-500">
                                    <span>Nivel de Avance</span>
                                    <span className="text-blue-600">65%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                </div>
                            </div>
                        </div>

                                <div className="mt-8 flex gap-3">
                                    <Link 
                                        href={`/alumno/cursos/${c.docen_curso_id}`} 
                                        className="flex-1 bg-gray-900 text-white font-bold py-4 rounded-2xl text-center text-sm hover:bg-black transition-colors"
                                    >
                                Ver Contenido
                            </Link>
                            <Link 
                                href="/alumno/notas" 
                                className="w-14 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl flex items-center justify-center hover:bg-blue-100 transition-colors"
                            >
                                <GraduationCap className="w-6 h-6" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
