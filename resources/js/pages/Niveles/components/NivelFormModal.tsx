import FormField from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Nivel, NivelFormData } from '../hooks/useNiveles';
import { useNivelForm } from '../hooks/useNivelForm';

type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     Nivel | null;
    onSave:      (data: NivelFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function NivelFormModal({ open, onClose, editing, onSave, apiErrors, clearErrors }: Props) {
    const { form, set, processing, handleSubmit } = useNivelForm({ editing, open, onSave, onClose, clearErrors });

    const err = (key: keyof NivelFormData) => apiErrors[key]?.[0];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Nivel' : 'Nuevo Nivel'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Nombre del Nivel *" value={form.nombre_nivel} onChange={(v) => set('nombre_nivel', v)} error={err('nombre_nivel')} placeholder="Ej: Primaria" />

                    <div className="space-y-1">
                        <Label>Estado</Label>
                        <Select value={form.nivel_estatus} onValueChange={(v) => set('nivel_estatus', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Activo</SelectItem>
                                <SelectItem value="0">Inactivo</SelectItem>
                            </SelectContent>
                        </Select>
                        {err('nivel_estatus') && <p className="text-xs text-red-500">{err('nivel_estatus')}</p>}
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
