import { ChevronDown, ChevronUp, FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { Unidad, UnidadFormData, ClaseFormData } from '../hooks/useCursoContenido';
import ClaseFormModal from './ClaseFormModal';
import ClaseItem from './ClaseItem';
import { usePermission } from '@/hooks/usePermission';

type Props = {
    unidad:   Unidad;
    onEdit:   (u: Unidad) => void;
    onDelete: (id: number) => void;
    onReload: () => void;
};

export default function UnidadItem({ unidad, onEdit, onDelete, onReload }: Props) {
    const [expanded, setExpanded]       = useState(true);
    const [claseModal, setClaseModal]   = useState(false);
    const [apiErrors, setApiErrors]     = useState<Record<string, string[]>>({});
    const { can } = usePermission();

    const isEditor = can(['cursos.manage', 'cursos.edit']);

    const handleCreateClase = async (data: ClaseFormData) => {
        setApiErrors({});
        await api.post('/contenido/clases', data);
        onReload();
    };

    const handleUpdateClase = async (id: number, data: ClaseFormData) => {
        setApiErrors({});
        await api.put(`/contenido/clases/${id}`, { ...data, estado: '1' });
        onReload();
    };

    const handleDeleteClase = async (id: number) => {
        if (!confirm('¿Eliminar esta clase y sus archivos?')) {
return;
}

        await api.delete(`/contenido/clases/${id}`);
        onReload();
    };

    return (
        <>
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Header de unidad */}
                <div className="flex items-center gap-2 rounded-t-lg bg-gray-50 px-4 py-3">
                    <button
                        type="button"
                        className="flex flex-1 items-center gap-2 text-left"
                        onClick={() => setExpanded(v => !v)}
                    >
                        {expanded
                            ? <ChevronUp className="h-4 w-4 text-gray-400" />
                            : <ChevronDown className="h-4 w-4 text-gray-400" />
                        }
                        <FolderOpen className="h-4 w-4 text-amber-500" />
                        <span className="font-semibold text-gray-800">{unidad.titulo}</span>
                        <span className="ml-1 text-xs text-gray-400">
                            ({unidad.clases.length} clase{unidad.clases.length !== 1 ? 's' : ''})
                        </span>
                    </button>
                    {isEditor && (
                        <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-green-600 hover:text-green-800"
                                onClick={() => setClaseModal(true)}>
                                <Plus className="mr-1 h-3 w-3" /> Clase
                            </Button>
                            <Button size="icon" variant="ghost" className="size-7" onClick={() => onEdit(unidad)}>
                                <Pencil className="h-3.5 w-3.5 text-blue-500" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-7" onClick={() => onDelete(unidad.unidad_id)}>
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Clases */}
                {expanded && (
                    <div className="py-2">
                        {unidad.clases.length === 0
                            ? <p className="px-6 py-3 text-xs italic text-gray-400">Sin clases aún. Agrega una con el botón "+ Clase".</p>
                            : unidad.clases.map((clase) => (
                                <ClaseItem
                                    key={clase.clase_id}
                                    clase={clase}
                                    onUpdate={handleUpdateClase}
                                    onDelete={handleDeleteClase}
                                    onReload={onReload}
                                />
                            ))
                        }
                    </div>
                )}
            </div>

            <ClaseFormModal
                open={claseModal}
                onClose={() => setClaseModal(false)}
                unidadId={unidad.unidad_id}
                editing={null}
                onSave={handleCreateClase}
                apiErrors={apiErrors}
                clearErrors={() => setApiErrors({})}
            />
        </>
    );
}
