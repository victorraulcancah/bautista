import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';
import type { Curso, CursoFormData, NivelOption } from '../hooks/useCursos';
import { useCursoForm } from '../hooks/useCursoForm';

type CursoOption = { curso_id: number; nombre: string };

type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     Curso | null;
    niveles:     NivelOption[];
    defaults?:   Partial<CursoFormData>;
    onSave:      (data: CursoFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function CursoFormModal({ open, onClose, editing, niveles, defaults, onSave, apiErrors, clearErrors }: Props) {
    const { form, set, processing, handleSubmit } = useCursoForm({ editing, open, defaults, onSave, onClose, clearErrors });
    const [cursoOpts, setCursoOpts] = useState<CursoOption[]>([]);

    const nivelNombre = niveles.find(n => n.nivel_id.toString() === form.nivel_academico_id)?.nombre_nivel || '';

    useEffect(() => {
        if (!open || !form.nivel_academico_id) { setCursoOpts([]); return; }
        api.get('/cursos', { params: { nivel_academico_id: form.nivel_academico_id, per_page: 500 } })
            .then((r) => setCursoOpts(r.data.data ?? []))
            .catch(() => setCursoOpts([]));
    }, [open, form.nivel_academico_id]);

    const err = (key: keyof CursoFormData) => apiErrors[key]?.[0];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Curso' : 'Agregar Curso'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium uppercase">Nivel Académico:</label>
                        <input
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-gray-100 px-3 py-1 text-sm uppercase"
                            value={nivelNombre}
                            disabled
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium uppercase">Curso:</label>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={form.nombre}
                            onChange={(e) => set('nombre', e.target.value)}
                            required
                        >
                            <option value="">-- Seleccionar --</option>
                            {cursoOpts.map((c) => (
                                <option key={c.curso_id} value={c.nombre}>{c.nombre}</option>
                            ))}
                        </select>
                        {err('nombre') && <p className="text-xs text-red-500">{err('nombre')}</p>}
                    </div>

                    <DialogFooter className="flex-col gap-2 sm:flex-col">
                        <Button type="submit" disabled={processing} className="w-full bg-[#00a65a] hover:bg-[#008d4c] text-white">
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button type="button" variant="destructive" onClick={onClose} className="w-full">
                            <X className="h-4 w-4 mr-2" />
                            Cerrar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
