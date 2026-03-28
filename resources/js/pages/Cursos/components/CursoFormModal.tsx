import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TitleForm from '@/components/TitleForm';
import type { Curso, CursoFormData, NivelOption, GradoOption } from '../hooks/useCursos';
import { useCursoForm } from '../hooks/useCursoForm';

type Props = {
    open:        boolean;
    onClose:     () => void;
    editing:     Curso | null;
    niveles:     NivelOption[];
    grados:      GradoOption[];
    defaults?:   Partial<CursoFormData>;
    onSave:      (data: CursoFormData) => Promise<void>;
    apiErrors:   Record<string, string[]>;
    clearErrors: () => void;
};

export default function CursoFormModal({ open, onClose, editing, niveles, grados, defaults, onSave, apiErrors, clearErrors }: Props) {
    const { form, set, processing, handleSubmit } = useCursoForm({ editing, open, defaults, onSave, onClose, clearErrors });

    const err = (key: keyof CursoFormData) => apiErrors[key]?.[0];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar Curso' : 'Nuevo Curso'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <TitleForm>Datos del Curso</TitleForm>

                    {/* Nombre */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-rose-700 inline-block" />
                            Nombre
                        </label>
                        <input
                            type="text"
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={form.nombre}
                            onChange={(e) => set('nombre', e.target.value)}
                            placeholder="Ej: Matemáticas"
                            required
                        />
                        {err('nombre') && <p className="text-xs text-red-500">{err('nombre')}</p>}
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-cyan-600 inline-block" />
                            Descripción
                        </label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={form.descripcion}
                            onChange={(e) => set('descripcion', e.target.value)}
                            placeholder="Descripción del curso..."
                        />
                        {err('descripcion') && <p className="text-xs text-red-500">{err('descripcion')}</p>}
                    </div>

                    {/* Nivel / Grado */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-cyan-600 inline-block" />
                                Nivel Académico
                            </label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={form.nivel_academico_id}
                                onChange={(e) => set('nivel_academico_id', e.target.value)}
                            >
                                <option value="">Sin nivel</option>
                                {niveles.map((n) => (
                                    <option key={n.nivel_id} value={n.nivel_id.toString()}>{n.nombre_nivel}</option>
                                ))}
                            </select>
                            {err('nivel_academico_id') && <p className="text-xs text-red-500">{err('nivel_academico_id')}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-cyan-600 inline-block" />
                                Grado Académico
                            </label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={form.grado_academico}
                                onChange={(e) => set('grado_academico', e.target.value)}
                            >
                                <option value="">Sin grado</option>
                                {grados.map((g) => (
                                    <option key={g.grado_id} value={g.grado_id.toString()}>{g.nombre_grado}</option>
                                ))}
                            </select>
                            {err('grado_academico') && <p className="text-xs text-red-500">{err('grado_academico')}</p>}
                        </div>
                    </div>

                    {/* Estado (solo edición) */}
                    {editing && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-cyan-600 inline-block" />
                                Estado
                            </label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={form.estado}
                                onChange={(e) => set('estado', e.target.value)}
                            >
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
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
