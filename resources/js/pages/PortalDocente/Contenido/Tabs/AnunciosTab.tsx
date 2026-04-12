import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Edit3, X } from 'lucide-react';
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
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAnuncios();
    }, [docenteCursoId]);

    const loadAnuncios = () => {
        api.get(`/docente/curso/${docenteCursoId}/anuncios`)
            .then(res => setAnuncios(res.data.data || res.data))
            .catch(err => console.error('Error cargando anuncios:', err));
    };

    const handlePublish = async () => {
        if (!form.titulo || !form.contenido) return;
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/docente/anuncios/${editingId}`, form);
            } else {
                await api.post('/docente/anuncios', { ...form, docente_curso_id: docenteCursoId });
            }
            setForm({ titulo: '', contenido: '' });
            setShowForm(false);
            setEditingId(null);
            loadAnuncios();
        } catch (err) {
            console.error('Error guardando anuncio:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (anuncio: Anuncio) => {
        setForm({ titulo: anuncio.titulo, contenido: anuncio.contenido });
        setEditingId(anuncio.id);
        setShowForm(true);
    };

    const handleCancelEdit = () => {
        setForm({ titulo: '', contenido: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleDeleteAnuncio = async () => {
        if (!isDeleting) return;
        try {
            await api.delete(`/docente/anuncios/${isDeleting}`);
            loadAnuncios();
        } catch (err) {
            console.error('Error eliminando anuncio:', err);
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Anuncios del Curso</h2>
                    <p className="text-gray-500 text-sm font-bold">Comunícate con tus estudiantes durante el ciclo.</p>
                </div>
                <Button 
                    onClick={() => showForm ? handleCancelEdit() : setShowForm(true)}
                    className={`rounded-[1.25rem] h-12 px-6 font-bold gap-2 shadow-lg ${showForm ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-gray-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
                >
                    {showForm ? <><X size={18} /> Cancelar</> : <><Plus size={18} /> Nuevo Anuncio</>}
                </Button>
            </div>

            {showForm && (
                <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-emerald-100/50 p-8 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {editingId && (
                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                            <Edit3 size={14} />
                            Editando anuncio
                        </div>
                    )}
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
                    <div className="flex justify-end gap-2 pt-2">
                        <Button 
                            onClick={handleCancelEdit}
                            variant="outline"
                            className="rounded-2xl h-12 px-6 font-bold"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handlePublish} 
                            disabled={loading || !form.titulo || !form.contenido}
                            className="rounded-2xl h-12 px-8 bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest text-[10px]"
                        >
                            {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Publicar Ahora')}
                        </Button>
                    </div>
                </Card>
            )}

            <div className="space-y-4">
                {anuncios.map(anuncio => (
                    <Card key={anuncio.id} className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white hover:shadow-md transition-all group">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xs shadow-sm">
                                        <MessageSquare size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Publicado por ti</p>
                                        <p className="text-[10px] font-bold text-gray-400 capitalize">{new Date(anuncio.created_at).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleEdit(anuncio)}
                                        className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl size-8"
                                        title="Editar anuncio"
                                    >
                                        <Edit3 size={14} />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setIsDeleting(anuncio.id)}
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl size-8"
                                        title="Eliminar anuncio"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">{anuncio.titulo}</h3>
                            <p className="text-gray-600 font-bold leading-relaxed whitespace-pre-wrap">{anuncio.contenido}</p>
                        </div>
                    </Card>
                ))}

                {anuncios.length === 0 && !showForm && (
                    <div className="py-20 text-center flex flex-col items-center animate-in fade-in duration-500">
                        <div className="size-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-6">
                            <MessageSquare size={32} className="text-gray-300" />
                        </div>
                        <p className="font-black text-lg text-gray-400 uppercase tracking-widest mb-2">No hay anuncios aún</p>
                        <p className="text-sm font-bold text-gray-400 max-w-md">Mantén informados a tus estudiantes sobre novedades, cambios de horario o recordatorios importantes.</p>
                        <Button 
                            onClick={() => setShowForm(true)}
                            className="mt-6 rounded-2xl h-12 px-6 bg-emerald-600 hover:bg-emerald-700 font-bold gap-2"
                        >
                            <Plus size={18} /> Crear Primer Anuncio
                        </Button>
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
