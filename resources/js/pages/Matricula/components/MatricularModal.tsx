import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { EstudianteDisponible, MatriculaFormData, SeccionOption } from '../hooks/useMatricula';
import { defaultMatriculaForm } from '../hooks/useMatricula';

type Props = {
    open:        boolean;
    onClose:     () => void;
    aperturaId:  number;
    anio:        number;
    estudiantes: EstudianteDisponible[];
    secciones:   SeccionOption[];
    onSave:      (data: MatriculaFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function MatricularModal({
    open, onClose, aperturaId, anio, estudiantes, secciones, onSave, apiErrors, clearErrors,
}: Props) {
    const [form, setForm]       = useState<MatriculaFormData>(defaultMatriculaForm);
    const [processing, setProc] = useState(false);

    useEffect(() => {
        clearErrors();
        setForm({
            ...defaultMatriculaForm,
            apertura_id: aperturaId.toString(),
            anio:        anio.toString(),
        });
    }, [open, aperturaId, anio]);

    const set = (key: keyof MatriculaFormData, value: string) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const err = (key: keyof MatriculaFormData) => apiErrors[key]?.[0];

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
                    <DialogTitle>Matricular Estudiante</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label>Estudiante *</Label>
                        <Select value={form.estudiante_id} onValueChange={(v) => set('estudiante_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar estudiante" /></SelectTrigger>
                            <SelectContent>
                                {estudiantes.map((e) => (
                                    <SelectItem key={e.estu_id} value={e.estu_id.toString()}>
                                        {e.nombre_completo} {e.doc_numero ? `— ${e.doc_numero}` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {err('estudiante_id') && <p className="text-xs text-red-500">{err('estudiante_id')}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label>Sección</Label>
                        <Select value={form.seccion_id} onValueChange={(v) => set('seccion_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Sin sección asignada" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Sin sección</SelectItem>
                                {secciones.map((s) => (
                                    <SelectItem key={s.seccion_id} value={s.seccion_id.toString()}>
                                        {s.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {err('seccion_id') && <p className="text-xs text-red-500">{err('seccion_id')}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing} className="bg-[#00a65a] hover:bg-[#008d4c] text-white">
                            {processing ? 'Matriculando...' : 'Matricular'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
