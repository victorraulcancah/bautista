import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormField from '@/components/shared/FormField';
import type { Grado, GradoFormData, Nivel } from '../hooks/useGrados';
import { useGradoForm } from '../hooks/useGradoForm';

type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     Grado | null;
    niveles:     Nivel[];
    onSave:      (data: GradoFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function GradoFormModal({ open, onClose, editing, niveles, onSave, apiErrors, clearErrors }: Props) {
    const { form, set, processing, handleSubmit } = useGradoForm({ editing, open, onSave, onClose, clearErrors });

    const err = (key: keyof GradoFormData) => apiErrors[key]?.[0];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Grado' : 'Nuevo Grado'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label>Nivel *</Label>
                        <Select value={form.nivel_id} onValueChange={(v) => set('nivel_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar nivel" /></SelectTrigger>
                            <SelectContent>
                                {niveles.map((n) => (
                                    <SelectItem key={n.nivel_id} value={n.nivel_id.toString()}>
                                        {n.nombre_nivel}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {err('nivel_id') && <p className="text-xs text-red-500">{err('nivel_id')}</p>}
                    </div>

                    <FormField label="Nombre del Grado *" value={form.nombre_grado} onChange={(v) => set('nombre_grado', v)} error={err('nombre_grado')} placeholder="Ej: Primer Grado" />
                    <FormField label="Abreviatura"        value={form.abreviatura}  onChange={(v) => set('abreviatura', v)}  error={err('abreviatura')}  placeholder="Ej: 1°" />

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
