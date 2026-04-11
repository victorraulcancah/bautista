import React, { useState } from 'react';
import { Plus, BookOpen, Edit3, Trash2, ChevronDown, FileText, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import PromptModal from '@/components/shared/PromptModal';

interface Props {
    unidades: any[];
    expanded: Record<string, boolean>;
    setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    docenteCursoId: number;
    courseData: any;
    onRefresh: () => void;
}

export default function ContenidoTab({ unidades, expanded, setExpanded, docenteCursoId, courseData, onRefresh }: Props) {
    const [deletingId, setDeletingId] = useState<{ id: number; type: 'unidad' | 'clase' | 'archivo' } | null>(null);
    const [promptConfig, setPromptConfig] = useState<{
        open: boolean;
        title: string;
        message?: string;
        defaultValue?: string;
        action: (value: string) => Promise<void> | void;
    }>({ open: false, title: '', action: () => {} });

    const toggleSection = (id: number) => {
        setExpanded((s: any) => ({ ...s, [id]: !s[id] }));
    };

    const addUnidad = () => {
        if (!courseData?.curso_id) return;
        setPromptConfig({
            open: true,
            title: 'Nueva Unidad',
            message: 'Nombre de la nueva unidad académica:',
            defaultValue: '',
            action: async (titulo) => {
                await api.post('/contenido/unidades', { curso_id: courseData.curso_id, titulo });
                setPromptConfig(prev => ({ ...prev, open: false }));
                onRefresh();
            }
        });
    };

    const addClase = (unidadId: number) => {
        setPromptConfig({
            open: true,
            title: 'Nueva Sesión',
            message: 'Ingresa el título de la nueva sesión:',
            defaultValue: '',
            action: async (titulo) => {
                await api.post('/contenido/clases', { unidad_id: unidadId, titulo });
                setPromptConfig(prev => ({ ...prev, open: false }));
                onRefresh();
            }
        });
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            if (deletingId.type === 'unidad') {
                await api.delete(`/contenido/unidades/${deletingId.id}`);
            } else if (deletingId.type === 'clase') {
                await api.delete(`/contenido/clases/${deletingId.id}`);
            } else if (deletingId.type === 'archivo') {
                await api.delete(`/contenido/archivos/${deletingId.id}`);
            }
            onRefresh();
        } finally {
            setDeletingId(null);
        }
    };

    const renameUnidad = async (id: number, current: string) => {
        setPromptConfig({
            open: true,
            title: 'Renombrar Unidad',
            message: 'Ingresa el nuevo título para la unidad:',
            defaultValue: current,
            action: async (nuevo) => {
                if (nuevo !== current) {
                    await api.put(`/contenido/unidades/${id}`, { titulo: nuevo });
                }
                setPromptConfig(prev => ({ ...prev, open: false }));
                onRefresh();
            }
        });
    };

    const renameClase = async (id: number, current: string) => {
        setPromptConfig({
            open: true,
            title: 'Renombrar Sesión',
            message: 'Ingresa el nuevo título para la sesión:',
            defaultValue: current,
            action: async (nuevo) => {
                if (nuevo !== current) {
                    await api.put(`/contenido/clases/${id}`, { titulo: nuevo });
                }
                setPromptConfig(prev => ({ ...prev, open: false }));
                onRefresh();
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Material de Curso</h2>
                    <p className="text-gray-500 text-sm">Gestiona fichas, guías y documentos de estudio.</p>
                </div>
                <Button 
                    onClick={addUnidad}
                    className="rounded-[1.25rem] h-12 px-6 bg-emerald-600 hover:bg-emerald-700 font-bold gap-2 shadow-lg shadow-emerald-100"
                >
                    <Plus size={18} /> Nueva Unidad
                </Button>
            </div>

            <div className="grid gap-4">
                {unidades.map((unidad: any) => (
                    <Card key={unidad.unidad_id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group bg-white">
                        <div 
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 cursor-pointer"
                            onClick={() => toggleSection(unidad.unidad_id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${expanded[unidad.unidad_id] ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-gray-50 text-gray-400 group-hover:bg-emerald-50'}`}>
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors uppercase text-[15px]">{unidad.titulo}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{unidad.clases?.length || 0} Sesiones Publicadas</p>
                                </div>
                            </div>
                            <div className="flex items-center flex-wrap gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={(e) => { e.stopPropagation(); addClase(unidad.unidad_id); }}
                                    className="rounded-xl border-gray-100 font-bold text-[10px] uppercase h-9 hover:bg-emerald-50 hover:text-emerald-600"
                                >
                                    + Sesión
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => { e.stopPropagation(); renameUnidad(unidad.unidad_id, unidad.titulo); }}
                                    className="size-9 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                                >
                                    <Edit3 size={14} />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => { e.stopPropagation(); setDeletingId({ id: unidad.unidad_id, type: 'unidad' }); }}
                                    className="size-9 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 size={14} />
                                </Button>
                                <div className={`p-2 rounded-xl transition-all ${expanded[unidad.unidad_id] ? 'rotate-180 bg-gray-100' : 'bg-gray-50'}`}>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {expanded[unidad.unidad_id] && (
                            <div className="px-6 pb-6 bg-white animate-in slide-in-from-top-2 duration-300">
                                <div className="border-t border-gray-100 pt-4 space-y-2">
                                    {unidad.clases?.map((clase: any) => (
                                        <div key={clase.clase_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-3xl border border-gray-50 hover:bg-gray-50/50 transition-colors gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                    <FileText size={14} className="text-emerald-600" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">{clase.titulo}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className="flex -space-x-1 flex-wrap">
                                                    {clase.archivos?.map((f: any) => (
                                                        <div key={f.archivo_id} className="group/file relative flex items-center gap-1 bg-white border border-gray-100 px-2 py-1 rounded-lg text-[9px] font-bold shadow-sm">
                                                            <a href={`/storage/${f.path}`} target="_blank" className="text-emerald-600 hover:underline">{f.nombre}</a>
                                                            <button 
                                                                onClick={() => setDeletingId({ id: f.archivo_id, type: 'archivo' })}
                                                                className="size-4 rounded-full bg-rose-50 text-rose-500 opacity-0 group-hover/file:opacity-100 transition-opacity"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => renameClase(clase.clase_id, clase.titulo)}
                                                    className="size-8 rounded-full text-gray-400 hover:text-emerald-600"
                                                >
                                                    <Edit3 size={14} />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => setDeletingId({ id: clase.clase_id, type: 'clase' })}
                                                    className="size-8 rounded-full text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!unidad.clases || unidad.clases.length === 0) && (
                                        <p className="text-center py-6 text-xs font-bold text-gray-400 italic">No hay sesiones creadas en esta unidad.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            <ConfirmDeleteModal 
                open={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={confirmDelete}
                title={deletingId?.type === 'unidad' ? 'Eliminar Unidad' : (deletingId?.type === 'clase' ? 'Eliminar Sesión' : 'Eliminar Archivo')}
                message={`¿Estás seguro de que deseas eliminar este ${deletingId?.type === 'unidad' ? 'unidad y todo su contenido' : (deletingId?.type === 'clase' ? 'sesión' : 'archivo')}? Esta acción no se puede deshacer.`}
            />

            <PromptModal 
                open={promptConfig.open}
                onClose={() => setPromptConfig(prev => ({ ...prev, open: false }))}
                onConfirm={promptConfig.action}
                title={promptConfig.title}
                message={promptConfig.message}
                defaultValue={promptConfig.defaultValue}
            />
        </div>
    );
}
