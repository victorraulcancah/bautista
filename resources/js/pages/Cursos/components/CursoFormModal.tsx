import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormField from '@/components/shared/FormField';
import type { Curso, CursoFormData, NivelOption, GradoOption } from '../hooks/useCursos';
import { useCursoForm } from '../hooks/useCursoForm';

type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     Curso | null;
    niveles:     NivelOption[];
    grados:      GradoOption[];
    onSave:      (data: CursoFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function CursoFormModal({ open, onClose, editing, niveles, grados, onSave, apiErrors, clearErrors }: Props) {
    const { form, set, processing, handleSubmit } = useCursoForm({ editing, open, onSave, onClose, clearErrors });

    const err = (key: keyof CursoFormData) => apiErrors[key]?.[0];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Curso' : 'Nuevo Curso'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Nombre *" value={form.nombre} onChange={(v) => set('nombre', v)} error={err('nombre')} placeholder="Ej: Matemáticas" />

                    <div className="space-y-1">
                        <Label>Descripción</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={form.descripcion}
                            onChange={(e) => set('descripcion', e.target.value)}
                            placeholder="Descripción del curso..."
                        />
                        {err('descripcion') && <p className="text-xs text-red-500">{err('descripcion')}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Nivel Académico</Label>
                            <Select value={form.nivel_academico_id} onValueChange={(v) => set('nivel_academico_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar nivel" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Sin nivel</SelectItem>
                                    {niveles.map((n) => (
                                        <SelectItem key={n.nivel_id} value={n.nivel_id.toString()}>{n.nombre_nivel}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {err('nivel_academico_id') && <p className="text-xs text-red-500">{err('nivel_academico_id')}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Grado Académico</Label>
                            <Select value={form.grado_academico} onValueChange={(v) => set('grado_academico', v)}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar grado" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Sin grado</SelectItem>
                                    {grados.map((g) => (
                                        <SelectItem key={g.grado_id} value={g.grado_id.toString()}>{g.nombre_grado}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {err('grado_academico') && <p className="text-xs text-red-500">{err('grado_academico')}</p>}
                        </div>
                    </div>

                    {editing && (
                        <div className="space-y-1">
                            <Label>Estado</Label>
                            <Select value={form.estado} onValueChange={(v) => set('estado', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Activo</SelectItem>
                                    <SelectItem value="0">Inactivo</SelectItem>
                                </SelectContent>
                            </Select>
                            {err('estado') && <p className="text-xs text-red-500">{err('estado')}</p>}
                        </div>
                    )}

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
