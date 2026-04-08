import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import FormField from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MatriculaApertura, AperturaFormData } from '../hooks/useMatricula';
import { defaultAperturaForm } from '../hooks/useMatricula';

type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     MatriculaApertura | null;
    onSave:      (data: AperturaFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function AperturaFormModal({ open, onClose, editing, onSave, apiErrors, clearErrors }: Props) {
    const [form, setForm]           = useState<AperturaFormData>(defaultAperturaForm);
    const [processing, setProc]     = useState(false);

    useEffect(() => {
        clearErrors();

        if (editing) {
            setForm({
                nombre:       editing.nombre,
                anio:         editing.anio.toString(),
                fecha_inicio: editing.fecha_inicio,
                fecha_fin:    editing.fecha_fin,
                estado:       editing.estado,
            });
        } else {
            setForm(defaultAperturaForm);
        }
    }, [editing, open]);

    const set = (key: keyof AperturaFormData, value: string) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const err = (key: keyof AperturaFormData) => apiErrors[key]?.[0];

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setProc(true);

        try {
            await onSave(form);
            onClose();
        } finally {
            setProc(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Apertura' : 'Nueva Apertura de Matrícula'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        label="Nombre *"
                        value={form.nombre}
                        onChange={(v) => set('nombre', v)}
                        error={err('nombre')}
                        placeholder="Ej: Matrícula 2026 - I"
                    />

                    <FormField
                        label="Año *"
                        type="number"
                        value={form.anio}
                        onChange={(v) => set('anio', v)}
                        error={err('anio')}
                        placeholder="2026"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Fecha inicio *"
                            type="date"
                            value={form.fecha_inicio}
                            onChange={(v) => set('fecha_inicio', v)}
                            error={err('fecha_inicio')}
                        />
                        <FormField
                            label="Fecha fin *"
                            type="date"
                            value={form.fecha_fin}
                            onChange={(v) => set('fecha_fin', v)}
                            error={err('fecha_fin')}
                        />
                    </div>

                    {editing && (
                        <div className="space-y-1">
                            <Label>Estado</Label>
                            <Select value={form.estado} onValueChange={(v) => set('estado', v)}>
                                <SelectTrigger className="bg-[#00a65a] text-white [&>svg]:text-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1" className="bg-[#00a65a] text-white focus:bg-[#008d4c] focus:text-white">Activo</SelectItem>
                                    <SelectItem value="0" className="bg-[#00a65a] text-white focus:bg-[#008d4c] focus:text-white">Cerrado</SelectItem>
                                </SelectContent>
                            </Select>
                            {err('estado') && <p className="text-xs text-red-500">{err('estado')}</p>}
                        </div>
                    )}

                    <DialogFooter className="flex-col gap-2 sm:flex-col">
                        <Button type="submit" disabled={processing} className="w-full bg-[#00a65a] hover:bg-[#008d4c] text-white">
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button type="button" variant="destructive" className="w-full" onClick={onClose}>
                            <X className="h-4 w-4 mr-2" />
                            Cerrar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
