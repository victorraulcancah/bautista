import { useEffect, useState } from 'react';
import FormField from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import type { TipoActividad } from '../types';

// ─── Form shape ─────────────────────────────────────────────────────────────
export type ActividadFormData = {
    id_curso:          string;
    id_tipo_actividad:  string;
    nombre_actividad:    string;
    descripcion_corta: string;
    fecha_inicio:      string;
    fecha_cierre:      string;
    estado:            string;
    es_calificado:     string;
};

type EditableActividad = {
    actividad_id:      number;
    id_curso:          number;
    id_tipo_actividad:  number;
    nombre_actividad:    string;
    descripcion_corta: string | null;
    fecha_inicio:      string | null;
    fecha_cierre:      string | null;
    estado:            string;
    es_calificado:     string;
};

type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     EditableActividad | null;
    onSave:      (data: ActividadFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

const blank = (): ActividadFormData => ({
    id_curso:          '0',
    id_tipo_actividad:  '',
    nombre_actividad:    '',
    descripcion_corta: '',
    fecha_inicio:      '',
    fecha_cierre:      '',
    estado:            '1',
    es_calificado:     '0',
});

const fromActividad = (a: EditableActividad): ActividadFormData => ({
    id_curso:          a.id_curso.toString(),
    id_tipo_actividad:  a.id_tipo_actividad.toString(),
    nombre_actividad:    a.nombre_actividad,
    descripcion_corta: a.descripcion_corta ?? '',
    fecha_inicio:      a.fecha_inicio?.slice(0, 10) ?? '',
    fecha_cierre:      a.fecha_cierre?.slice(0, 10) ?? '',
    estado:            a.estado ?? '1',
    es_calificado:     a.es_calificado ?? '0',
});

export default function ActividadFormModal({
    open, onClose, editing, onSave, apiErrors, clearErrors,
}: Props) {
    const [form, setForm]           = useState<ActividadFormData>(blank());
    const [processing, setProc]     = useState(false);
    const [tipos, setTipos]         = useState<TipoActividad[]>([]);

    // Load tipos once
    useEffect(() => {
        api.get('/actividades/tipos').then(({ data }) => setTipos(data)).catch(() => {});
    }, []);

    useEffect(() => {
        clearErrors();
        setForm(editing ? fromActividad(editing) : blank());
    }, [open, editing]);

    const set = (key: keyof ActividadFormData, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const err = (key: string) => apiErrors[key]?.[0];

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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {editing ? 'Editar Actividad' : 'Nueva Actividad'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tipo de actividad */}
                    <div className="space-y-1">
                        <Label>Tipo de actividad *</Label>
                        <Select
                            value={form.id_tipo_actividad}
                            onValueChange={(v) => set('id_tipo_actividad', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {tipos.map((t) => (
                                    <SelectItem key={t.tipo_id} value={t.tipo_id.toString()}>
                                        {t.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {err('id_tipo_actividad') && (
                            <p className="text-xs text-red-500">{err('id_tipo_actividad')}</p>
                        )}
                    </div>

                    {/* Nombre */}
                    <FormField
                        label="Nombre de la actividad *"
                        value={form.nombre_actividad}
                        onChange={(v) => set('nombre_actividad', v)}
                        error={err('nombre_actividad')}
                        placeholder="ej. Examen Parcial Unidad 1"
                    />

                    {/* Descripción corta */}
                    <FormField
                        label="Descripción corta"
                        value={form.descripcion_corta}
                        onChange={(v) => set('descripcion_corta', v)}
                        error={err('descripcion_corta')}
                        placeholder="Descripción breve..."
                    />

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Fecha inicio"
                            type="date"
                            value={form.fecha_inicio}
                            onChange={(v) => set('fecha_inicio', v)}
                            error={err('fecha_inicio')}
                        />
                        <FormField
                            label="Fecha cierre"
                            type="date"
                            value={form.fecha_cierre}
                            onChange={(v) => set('fecha_cierre', v)}
                            error={err('fecha_cierre')}
                        />
                    </div>

                    {/* Estado y Calificado */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Estado</Label>
                            <Select value={form.estado} onValueChange={(v) => set('estado', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Activo</SelectItem>
                                    <SelectItem value="0">Inactivo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>¿Calificado?</Label>
                            <Select value={form.es_calificado} onValueChange={(v) => set('es_calificado', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Sí</SelectItem>
                                    <SelectItem value="0">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {processing ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
