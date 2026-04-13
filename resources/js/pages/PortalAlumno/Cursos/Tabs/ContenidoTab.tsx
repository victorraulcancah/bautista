import { Link } from '@inertiajs/react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ContenidoTabProps {
    unidades: any[];
}

export default function ContenidoTab({ unidades }: ContenidoTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Material de Estudio</h2>
                    <p className="text-gray-500 text-sm font-bold">Revisa las sesiones y actividades publicadas por tu docente.</p>
                </div>
            </div>

            <div className="grid gap-4">
                {unidades.map((u: any, i: number) => (
                    <Card key={u.unidad_id} className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                        <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center gap-4">
                            <div className="size-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-blue-100 italic">
                                U{i + 1}
                            </div>
                            <h3 className="font-black text-xl text-gray-900">{u.titulo}</h3>
                        </div>
                        <div className="p-6 space-y-2">
                            {u.clases?.map((clase: any) => (
                                <Link 
                                    key={clase.clase_id} 
                                    href={`/alumno/clase/${clase.clase_id}`}
                                    className="flex items-center justify-between p-4 rounded-3xl border border-transparent hover:bg-blue-50/50 hover:border-blue-100 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                                            <BookOpen size={18} />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800 group-hover:text-blue-600 transition-colors">{clase.titulo}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Sesión {clase.orden}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-200 group-hover:text-blue-600 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </Card>
                ))}
                {unidades.length === 0 && (
                    <div className="py-20 text-center opacity-30">
                        <BookOpen size={64} className="mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">No hay contenido publicado aún</p>
                    </div>
                )}
            </div>
        </div>
    );
}
