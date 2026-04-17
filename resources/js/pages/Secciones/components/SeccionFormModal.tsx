import { useMemo, useState, useEffect } from 'react';
import FormField from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Seccion, SeccionFormData, GradoOption, NivelOption } from '../hooks/useSecciones';
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

    // Niveles únicos extraídos de los grados
    const niveles = useMemo<NivelOption[]>(() => {
        const map = new Map<number, NivelOption>();
        grados.forEach(g => { if (g.nivel) map.set(g.nivel.nivel_id, g.nivel); });
        return Array.from(map.values());
    }, [grados]);

    // Nivel seleccionado para filtrar grados en cascada
    const [nivelId, setNivelId] = useState('');

    useEffect(() => {
        if (open && editing) {
            setNivelId(editing.grado?.nivel?.nivel_id?.toString() ?? '');
        } else if (!open) {
            setNivelId('');
        }
    }, [open, editing]);

    const gradosFiltrados = useMemo(() =>
        nivelId ? grados.filter(g => g.nivel?.nivel_id?.toString() === nivelId) : grados,
        [grados, nivelId]
    );

    const handleNivelChange = (v: string) => {
        setNivelId(v);
        if (!editing) set('id_grado', '');
    };

    const err = (key: keyof SeccionFormData) => apiErrors[key]?.[0];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Sección' : 'Nueva Sección'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nivel */}
                    <div className="space-y-1">
                        <Label>Nivel *</Label>
                        <Select value={nivelId} onValueChange={handleNivelChange}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar nivel" /></SelectTrigger>
                            <SelectContent>
                                {niveles.map(n => (
                                    <SelectItem key={n.nivel_id} value={n.nivel_id.toString()}>
                                        {n.nombre_nivel}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Grado (filtrado por nivel) */}
                    <div className="space-y-1">
                        <Label>Grado *</Label>
                        <Select
                            value={form.id_grado}
                            onValueChange={v => set('id_grado', v)}
                            disabled={!nivelId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={nivelId ? 'Seleccionar grado' : 'Primero selecciona un nivel'} />
                            </SelectTrigger>
                            <SelectContent>
                                {gradosFiltrados.map(g => (
                                    <SelectItem key={g.grado_id} value={g.grado_id.toString()}>
                                        {g.nombre_grado}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {err('id_grado') && <p className="text-xs text-red-500">{err('id_grado')}</p>}
                    </div>

                    {/* Sección */}
                    <FormField
                        label="Sección *"
                        value={form.nombre}
                        onChange={v => set('nombre', v.toUpperCase())}
                        error={err('nombre')}
                        placeholder="Ej: UNICA, A, B..."
                    />

                    {/* Cant. Alumnos */}
                    <FormField
                        label="Cant. Alumnos *"
                        value={form.cnt_alumnos}
                        onChange={v => set('cnt_alumnos', v)}
                        error={err('cnt_alumnos')}
                        type="number"
                        placeholder="0"
                    />

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
