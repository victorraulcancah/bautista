import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormField from '@/components/shared/FormField';
import type { Seccion, SeccionFormData, GradoOption } from '../hooks/useSecciones';
import { useSeccionForm } from '../hooks/useSeccionForm';

type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     Seccion | null;
    grados:      GradoOption[];
    onSave:      (data: SeccionFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function SeccionFormModal({ open, onClose, editing, grados, onSave, apiErrors, clearErrors }: Props) {
    const { form, set, processing, handleSubmit } = useSeccionForm({ editing, open, onSave, onClose, clearErrors });

    const err = (key: keyof SeccionFormData) => apiErrors[key]?.[0];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Sección' : 'Nueva Sección'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label>Grado *</Label>
                        <Select value={form.id_grado} onValueChange={(v) => set('id_grado', v)}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar grado" /></SelectTrigger>
                            <SelectContent>
                                {grados.map((g) => (
                                    <SelectItem key={g.grado_id} value={g.grado_id.toString()}>
                                        {g.nombre_grado}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {err('id_grado') && <p className="text-xs text-red-500">{err('id_grado')}</p>}
                    </div>

                    <FormField label="Nombre *"    value={form.nombre}      onChange={(v) => set('nombre', v)}      error={err('nombre')}      placeholder="Ej: Sección A" />
                    <FormField label="Abreviatura" value={form.abreviatura} onChange={(v) => set('abreviatura', v)} error={err('abreviatura')} placeholder="Ej: A" />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="N° de Alumnos" value={form.cnt_alumnos} onChange={(v) => set('cnt_alumnos', v)} error={err('cnt_alumnos')} type="number" placeholder="0" />
                        <FormField label="Horario"       value={form.horario}     onChange={(v) => set('horario', v)}     error={err('horario')}     placeholder="Ej: Mañana" />
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
