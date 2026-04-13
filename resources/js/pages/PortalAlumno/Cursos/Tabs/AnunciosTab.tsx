import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';

interface AnunciosTabProps {
    cursoId: number;
}

export default function AnunciosTab({ cursoId }: AnunciosTabProps) {
    const [anuncios, setAnuncios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/alumno/curso/${cursoId}`).then(res => {
            setAnuncios(res.data.anuncios || []);
            setLoading(false);
        });
    }, [cursoId]);

    if (loading) {
        return <div className="p-20 text-center animate-pulse font-black text-blue-400 uppercase text-xs">Cargando anuncios...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Anuncios y Comunicados</h2>
            {anuncios.map((anuncio: any) => (
                <Card key={anuncio.id} className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">D</div>
                            <div>
                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Publicado por tu docente</p>
                                <p className="text-[10px] font-bold text-gray-400 capitalize">{new Date(anuncio.created_at).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">{anuncio.titulo}</h3>
                        <p className="text-gray-600 font-bold leading-relaxed">{anuncio.contenido}</p>
                    </div>
                </Card>
            ))}
            {anuncios.length === 0 && (
                <div className="py-20 text-center opacity-30">
                    <Bell size={64} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">No hay novedades por ahora</p>
                </div>
            )}
        </div>
    );
}
