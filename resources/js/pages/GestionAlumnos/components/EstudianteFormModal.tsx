import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormField from '@/components/shared/FormField';
import FormSection from '@/components/shared/FormSection';
import { FormLegend, ReqLabel, OptLabel } from '@/components/shared/FormLabels';
import type { Estudiante, EstudianteFormData } from '../hooks/useEstudiantes';
import { useEstudianteForm } from '../hooks/useEstudianteForm';

type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     Estudiante | null;
    onSave:      (data: EstudianteFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function EstudianteFormModal({ open, onClose, editing, onSave, apiErrors, clearErrors }: Props) {
    const { form, set, processing, handleSubmit } = useEstudianteForm({ editing, open, onSave, onClose, clearErrors });

    const err = (key: keyof EstudianteFormData) => apiErrors[key]?.[0];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Estudiante' : 'Nuevo Estudiante'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 px-1">
                    <FormLegend />

                    <FormSection title="Datos de Acceso">
                        <FormField label="DNI / Usuario"    required={true} value={form.username} onChange={(v) => set('username', v)} error={err('username')} placeholder="Ej: 78901234" />
                        <FormField label="Correo electrónico" value={form.email}    onChange={(v) => set('email', v)}    error={err('email')}    type="email" />
                    </FormSection>

                    <FormSection title="Datos Personales">
                        <FormField label="Primer Nombre"    required={true} value={form.primer_nombre}    onChange={(v) => set('primer_nombre', v)}    error={err('primer_nombre')} />
                        <FormField label="Segundo Nombre"   value={form.segundo_nombre}   onChange={(v) => set('segundo_nombre', v)}   error={err('segundo_nombre')} />
                        <FormField label="Apellido Paterno" required={true} value={form.apellido_paterno} onChange={(v) => set('apellido_paterno', v)} error={err('apellido_paterno')} />
                        <FormField label="Apellido Materno" value={form.apellido_materno} onChange={(v) => set('apellido_materno', v)} error={err('apellido_materno')} />
                        <div className="space-y-1">
                            <ReqLabel>Género</ReqLabel>
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
                        <FormField label="Dirección" value={form.direccion} onChange={(v) => set('direccion', v)} error={err('direccion')} />
                    </FormSection>

                    <FormSection title="Datos Académicos">
                        <FormField label="Colegio de procedencia" value={form.colegio}       onChange={(v) => set('colegio', v)}       error={err('colegio')} />
                        <FormField label="Fecha de Ingreso"       value={form.fecha_ingreso} onChange={(v) => set('fecha_ingreso', v)} type="date" />
                        <FormField label="Mensualidad (S/.)"      value={form.mensualidad}   onChange={(v) => set('mensualidad', v)}   error={err('mensualidad')} type="number" />
                        <FormField label="Seguro"                 value={form.seguro}        onChange={(v) => set('seguro', v)}        error={err('seguro')} />
                    </FormSection>

                    <FormSection title="Salud" cols={3}>
                        <FormField label="Edad"      value={form.edad}  onChange={(v) => set('edad', v)}  error={err('edad')}  type="number" />
                        <FormField label="Talla (cm)" value={form.talla} onChange={(v) => set('talla', v)} error={err('talla')} />
                        <FormField label="Peso (kg)"  value={form.peso}  onChange={(v) => set('peso', v)}  error={err('peso')}  type="number" />
                    </FormSection>

                    <FormSection title="Salud Adicional">
                        <FormField label="Neurodivergencia"    value={form.neurodivergencia}    onChange={(v) => set('neurodivergencia', v)}    error={err('neurodivergencia')} />
                        <FormField label="Terapia Ocupacional" value={form.terapia_ocupacional} onChange={(v) => set('terapia_ocupacional', v)} error={err('terapia_ocupacional')} />
                    </FormSection>

                    {editing && (
                        <div className="space-y-1">
                            <OptLabel>Estado</OptLabel>
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
