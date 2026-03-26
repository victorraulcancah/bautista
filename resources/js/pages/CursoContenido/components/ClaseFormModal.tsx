import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormField from '@/components/shared/FormField';
import type { Clase, ClaseFormData } from '../hooks/useCursoContenido';

type Props = {
    open:        boolean;
    onClose:     () => void;
    unidadId:    number;
    editing:     Clase | null;
    onSave:      (data: ClaseFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function ClaseFormModal({ open, onClose, unidadId, editing, onSave, apiErrors, clearErrors }: Props) {
    const [form, setForm]       = useState<ClaseFormData>({ unidad_id: unidadId.toString(), titulo: '', descripcion: '' });
    const [processing, setProc] = useState(false);

    useEffect(() => {
        clearErrors();
        setForm(editing
            ? { unidad_id: unidadId.toString(), titulo: editing.titulo, descripcion: editing.descripcion ?? '' }
            : { unidad_id: unidadId.toString(), titulo: '', descripcion: '' }
        );
    }, [editing, open]);

    const err = (key: string) => apiErrors[key]?.[0];

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setProc(true);
        try { await onSave(form); onClose(); }
        finally { setProc(false); }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Clase' : 'Nueva Clase'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        label="Título *"
                        value={form.titulo}
                        onChange={(v) => setForm(p => ({ ...p, titulo: v }))}
                        error={err('titulo')}
                        placeholder="Ej: Clase 1 — Conceptos básicos"
                    />
                    <div className="space-y-1">
                        <Label>Descripción</Label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={form.descripcion}
                            onChange={(e) => setForm(p => ({ ...p, descripcion: e.target.value }))}
                            placeholder="Descripción del contenido de la clase..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing} className="bg-[#00a65a] hover:bg-[#008d4c] text-white">
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
