import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';

interface Anuncio {
    id: number;
    titulo: string;
    contenido: string;
    created_at: string;
}

interface Props {
    docenteCursoId: number;
}

export default function AnunciosTab({ docenteCursoId }: Props) {
    const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ titulo: '', contenido: '' });
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAnuncios();
    }, [docenteCursoId]);

    const loadAnuncios = () => {
        api.get(`/docente/curso/${docenteCursoId}/anuncios`)
            .then(res => setAnuncios(res.data));
    };

    const handlePublish = async () => {
        if (!form.titulo || !form.contenido) return;
        setLoading(true);
        try {
            await api.post('/docente/anuncios', { ...form, docente_curso_id: docenteCursoId });
            setForm({ titulo: '', contenido: '' });
            setShowForm(false);
            loadAnuncios();
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAnuncio = async () => {
        if (!isDeleting) return;
        try {
            await api.delete(`/docente/anuncios/${isDeleting}`);
            loadAnuncios();
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Anuncios del Curso</h2>
                    <p className="text-gray-500 text-sm">Comunícate con tus estudiantes durante el ciclo.</p>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)}
                    className={`rounded-2xl h-12 font-bold ${showForm ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-emerald-600'}`}
                >
                    {showForm ? 'Cancelar' : 'Publicar Anuncio'}
                </Button>
            </div>

            {showForm && (
                <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-emerald-100/50 p-8 space-y-4">
                    <Input 
                        placeholder="Título del anuncio..." 
                        value={form.titulo}
                        onChange={e => setForm({...form, titulo: e.target.value})}
                        className="h-14 rounded-2xl border-gray-100 font-black text-lg focus:ring-4 focus:ring-emerald-100"
                    />
                    <textarea 
                        placeholder="¿Qué quieres anunciar a tus alumnos?"
                        value={form.contenido}
                        onChange={e => setForm({...form, contenido: e.target.value})}
                        className="w-full min-h-[150px] p-6 rounded-[2rem] border border-gray-100 bg-gray-50 font-bold text-gray-700 outline-none focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
                    />
                    <div className="flex justify-end pt-2">
                        <Button 
                            onClick={handlePublish} 
                            disabled={loading || !form.titulo || !form.contenido}
                            className="rounded-2xl h-12 px-8 bg-emerald-600 font-black uppercase tracking-widest text-[10px]"
                        >
                            {loading ? 'Publicando...' : 'Publicar Ahora'}
                        </Button>
                    </div>
                </Card>
            )}

            <div className="space-y-6">
                {anuncios.map(anuncio => (
                    <Card key={anuncio.id} className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
                        <div className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xs">A</div>
                                        <div>
                                            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Publicado por ti</p>
                                            <p className="text-[10px] font-bold text-gray-400 capitalize">{new Date(anuncio.created_at).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setIsDeleting(anuncio.id)}
                                        className="text-gray-300 hover:text-red-500 rounded-full h-8 w-8"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">{anuncio.titulo}</h3>
                            <p className="text-gray-600 font-bold leading-relaxed">{anuncio.contenido}</p>
                        </div>
                    </Card>
                ))}

                {anuncios.length === 0 && (
                    <div className="py-20 text-center opacity-30 flex flex-col items-center">
                        <MessageSquare size={64} className="mb-4 text-gray-400" />
                        <p className="font-black text-lg uppercase tracking-widest">No hay anuncios aún</p>
                        <p className="text-sm font-bold">Mantén informados a tus estudiantes sobre novedades del curso.</p>
                    </div>
                )}
            </div>

            <ConfirmDeleteModal 
                open={!!isDeleting}
                onClose={() => setIsDeleting(null)}
                onConfirm={handleDeleteAnuncio}
                title="Eliminar Anuncio"
                message="¿Estás seguro de que deseas eliminar este anuncio? Todos los estudiantes dejarán de verlo inmediatamente."
            />
        </div>
    );
}
