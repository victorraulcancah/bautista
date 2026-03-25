import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import FormField from '@/components/shared/FormField';
import FormSection from '@/components/shared/FormSection';
import type { Docente, DocenteFormData } from '../hooks/useDocentes';
import { useDocenteForm } from '../hooks/useDocenteForm';

type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     Docente | null;
    onSave:      (data: DocenteFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function DocenteFormModal({ open, onClose, editing, onSave, apiErrors, clearErrors }: Props) {
    const { form, set, processing, handleSubmit } = useDocenteForm({ editing, open, onSave, onClose, clearErrors });

    const err = (key: keyof DocenteFormData) => apiErrors[key]?.[0];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Docente' : 'Nuevo Docente'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormSection title="Datos de Acceso">
                        <FormField label="DNI / Usuario *"      value={form.username}  onChange={(v) => set('username', v)}  error={err('username')}  placeholder="Ej: 78901234" />
                        <FormField label="Correo Electrónico"   value={form.email}     onChange={(v) => set('email', v)}     error={err('email')}     type="email" placeholder="Ej: docente@correo.com" />
                    </FormSection>

                    <FormSection title="Datos Personales">
                        <FormField label="Primer Nombre *"   value={form.primer_nombre}    onChange={(v) => set('primer_nombre', v)}    error={err('primer_nombre')}    placeholder="Ej: Juan" />
                        <FormField label="Segundo Nombre"    value={form.segundo_nombre}   onChange={(v) => set('segundo_nombre', v)}   error={err('segundo_nombre')}   placeholder="Ej: Carlos" />
                        <FormField label="Apellido Paterno *" value={form.apellido_paterno} onChange={(v) => set('apellido_paterno', v)} error={err('apellido_paterno')} placeholder="Ej: García" />
                        <FormField label="Apellido Materno"  value={form.apellido_materno} onChange={(v) => set('apellido_materno', v)} error={err('apellido_materno')} placeholder="Ej: López" />
                        <div className="space-y-1">
                            <Label>Género</Label>
                            <Select value={form.genero} onValueChange={(v) => set('genero', v)}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Masculino</SelectItem>
                                    <SelectItem value="F">Femenino</SelectItem>
                                </SelectContent>
                            </Select>
                            {err('genero') && <p className="text-xs text-red-500">{err('genero')}</p>}
                        </div>
                        <FormField label="Fecha de Nacimiento" value={form.fecha_nacimiento} onChange={(v) => set('fecha_nacimiento', v)} type="date" />
                        <FormField label="Teléfono"  value={form.telefono}  onChange={(v) => set('telefono', v)}  error={err('telefono')}  placeholder="Ej: 987654321" />
                        <FormField label="Dirección" value={form.direccion} onChange={(v) => set('direccion', v)} error={err('direccion')} placeholder="Ej: Av. Los Pinos 123" />
                    </FormSection>

                    <FormSection title="Datos Profesionales">
                        <FormField label="Especialidad" value={form.especialidad} onChange={(v) => set('especialidad', v)} error={err('especialidad')} placeholder="Ej: Matemáticas" />
                        <div className="space-y-1">
                            <Label>Planilla</Label>
                            <Select value={form.planilla} onValueChange={(v) => set('planilla', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">En planilla</SelectItem>
                                    <SelectItem value="0">Fuera de planilla</SelectItem>
                                </SelectContent>
                            </Select>
                            {err('planilla') && <p className="text-xs text-red-500">{err('planilla')}</p>}
                        </div>
                    </FormSection>

                    {editing && (
                        <div className="space-y-1">
                            <Label>Estado</Label>
                            <Select value={form.estado} onValueChange={(v) => set('estado', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Activo</SelectItem>
                                    <SelectItem value="0">Inactivo</SelectItem>
                                    <SelectItem value="5">Bloqueado</SelectItem>
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
