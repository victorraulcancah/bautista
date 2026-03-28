import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TitleForm from '@/components/TitleForm';
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
                    <TitleForm>Datos del Grado</TitleForm>

                    {/* Nombre */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-rose-700 inline-block" />
                            Nombre del Grado
                        </label>
                        <input
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={form.nombre_grado}
                            onChange={(e) => set('nombre_grado', e.target.value)}
                            placeholder="Ej: Primer Grado"
                            required
                        />
                        {err('nombre_grado') && <p className="text-xs text-red-500">{err('nombre_grado')}</p>}
                    </div>

                    {/* Abreviatura */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-cyan-600 inline-block" />
                            Abreviatura
                        </label>
                        <input
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={form.abreviatura}
                            onChange={(e) => set('abreviatura', e.target.value)}
                            placeholder="Ej: 1°"
                        />
                        {err('abreviatura') && <p className="text-xs text-red-500">{err('abreviatura')}</p>}
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
