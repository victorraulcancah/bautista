import { ChevronDown, ChevronRight, FileText, Paperclip, Pencil, Plus, Trash2, Upload, X, Star, ClipboardList } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { Clase, ClaseFormData, ArchivoClase } from '../hooks/useCursoContenido';
import { formatTamanio } from '../hooks/useCursoContenido';
import ClaseFormModal from './ClaseFormModal';
import { usePermission } from '@/hooks/usePermission';

type Props = {
    clase:    Clase;
    onUpdate: (id: number, data: ClaseFormData) => Promise<void>;
    onDelete: (id: number) => void;
    onReload: () => void;
};

export default function ClaseItem({ clase, onUpdate, onDelete, onReload }: Props) {
    const [expanded, setExpanded]   = useState(false);
    const [editOpen, setEditOpen]   = useState(false);
    const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
    const [uploading, setUploading] = useState(false);
    const { can } = usePermission();

    const isEditor = can(['cursos.manage', 'cursos.edit']);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
return;
}

        setUploading(true);
        const fd = new FormData();
        fd.append('archivo', file);

        try {
            await api.post(`/contenido/clases/${clase.clase_id}/archivos`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onReload();
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDeleteArchivo = async (archivoId: number) => {
        if (!confirm('¿Eliminar este archivo?')) {
return;
}

        await api.delete(`/contenido/archivos/${archivoId}`);
        onReload();
    };

    return (
        <>
            <div className="ml-6 border-l-2 border-gray-100 pl-4">
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 group">
                    <button
                        type="button"
                        className="flex flex-1 items-center gap-2 text-left text-sm"
                        onClick={() => setExpanded(v => !v)}
                    >
                        {expanded
                            ? <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            : <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        }
                        <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        <span className="font-medium text-gray-700">{clase.titulo}</span>
                        {clase.archivos.length > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-400">
                                <Paperclip className="h-3 w-3" />{clase.archivos.length}
                            </span>
                        )}
                    </button>
                    {isEditor && (
                        <div className="hidden group-hover:flex items-center gap-1">
                            <label className="cursor-pointer" title="Subir archivo">
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                <Upload className="h-3.5 w-3.5 text-green-500 hover:text-green-700" />
                            </label>
                            <Button size="icon" variant="ghost" className="size-6" onClick={() => setEditOpen(true)}>
                                <Pencil className="h-3 w-3 text-blue-500" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-6" onClick={() => onDelete(clase.clase_id)}>
                                <Trash2 className="h-3 w-3 text-red-400" />
                            </Button>
                        </div>
                    )}
                </div>

                {expanded && (
                    <div className="ml-6 py-1">
                        {clase.descripcion && (
                            <p className="mb-2 text-xs text-gray-500">{clase.descripcion}</p>
                        )}
                        {clase.archivos.length === 0
                            ? <p className="text-xs italic text-gray-400">Sin archivos adjuntos.</p>
                            : clase.archivos.map((a: ArchivoClase) => (
                                <div key={a.archivo_id} className="flex items-center justify-between rounded px-2 py-1 hover:bg-gray-50">
                                    <a href={a.url} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline truncate max-w-xs">
                                        <Paperclip className="h-3 w-3 shrink-0" />
                                        {a.nombre}
                                        {a.tamanio && <span className="text-gray-400">({formatTamanio(a.tamanio)})</span>}
                                    </a>
                                    {isEditor && (
                                        <Button size="icon" variant="ghost" className="size-5 shrink-0"
                                            onClick={() => handleDeleteArchivo(a.archivo_id)}>
                                            <X className="h-3 w-3 text-red-400" />
                                        </Button>
                                    )}
                                </div>
                            ))
                        }
                        {clase.actividades && clase.actividades.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {clase.actividades.map((act: any) => (
                                    <div key={act.actividad_id} className="group flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:bg-amber-50/30 hover:border-amber-200 transition-all border-l-4 border-l-amber-500">
                                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                            {act.id_tipo_actividad === 2 || act.id_tipo_actividad === 3 ? <Star className="size-4" /> : <ClipboardList className="size-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                                                    {act.tipo_actividad?.nombre || 'Actividad'}
                                                </span>
                                                <span className="text-[8px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full uppercase">
                                                    Vence: {act.fecha_cierre ? new Date(act.fecha_cierre).toLocaleDateString() : '-'}
                                                </span>
                                            </div>
                                            <h5 className="text-xs font-bold text-gray-800 truncate">{act.nombre_actividad}</h5>
                                            <Link 
                                                href={act.id_tipo_actividad === 2 || act.id_tipo_actividad === 3 ? `/examenes/${act.actividad_id}/resolver` : `/alumno/clase/${clase.clase_id}`}
                                                className="mt-2 inline-flex items-center gap-1 text-[9px] font-black text-amber-600 hover:text-amber-800 transition-colors uppercase"
                                            >
                                                {act.id_tipo_actividad === 2 || act.id_tipo_actividad === 3 ? 'Comenzar Evaluación' : 'Entregar Tarea'}
                                                <ChevronRight className="size-2.5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {uploading && <p className="mt-1 text-xs text-gray-400">Subiendo...</p>}
                    </div>
                )}
            </div>

            <ClaseFormModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                unidadId={clase.unidad_id}
                editing={clase}
                onSave={(data) => onUpdate(clase.clase_id, data)}
                apiErrors={apiErrors}
                clearErrors={() => setApiErrors({})}
            />
        </>
    );
}
