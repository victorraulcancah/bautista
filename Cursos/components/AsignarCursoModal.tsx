    import { Plus, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';

type Curso = {
    curso_id: number;
    nombre: string;
    descripcion: string | null;
};

type Props = {
    open: boolean;
    onClose: () => void;
    gradoId: number;
    nivelNombre: string;
    onSuccess: () => void;
};

export default function AsignarCursoModal({ open, onClose, gradoId, nivelNombre, onSuccess }: Props) {
    const [cursosDisponibles, setCursosDisponibles] = useState<Curso[]>([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open && gradoId) {
            setLoading(true);
            setError('');
            setCursoSeleccionado('');
            
            api.get(`/grados/${gradoId}/cursos-disponibles`)
                .then((res) => {
                    setCursosDisponibles(res.data ?? []);
                })
                .catch(() => {
                    setError('Error al cargar cursos disponibles');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [open, gradoId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!cursoSeleccionado) {
            setError('Debe seleccionar un curso');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            await api.post(`/grados/${gradoId}/cursos`, {
                curso_id: parseInt(cursoSeleccionado),
            });
            
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Error al asignar el curso');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-md w-[90vw] sm:w-full">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-base sm:text-xl font-bold flex items-center gap-2">
                        <Plus className="size-4 sm:size-5 text-emerald-600" />
                        Agregar Curso
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs sm:text-sm font-medium text-neutral-700 uppercase">
                                Nivel Académico
                            </label>
                            <div className="h-8 sm:h-10 w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 flex items-center text-xs sm:text-sm font-bold text-neutral-500 uppercase">
                                {nivelNombre}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs sm:text-sm font-medium text-neutral-700 uppercase">
                                Curso <span className="text-red-500">*</span>
                            </label>
                            {loading ? (
                                <div className="h-10 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 flex items-center text-sm text-neutral-400">
                                    Cargando cursos...
                                </div>
                            ) : cursosDisponibles.length === 0 ? (
                                <div className="h-10 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 flex items-center text-sm text-neutral-400">
                                    No hay cursos disponibles para asignar
                                </div>
                            ) : (
                                <select
                                    className="h-8 sm:h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    value={cursoSeleccionado}
                                    onChange={(e) => setCursoSeleccionado(e.target.value)}
                                    required
                                >
                                    <option value="">-- Seleccione un curso --</option>
                                    {cursosDisponibles.map((curso) => (
                                        <option key={curso.curso_id} value={curso.curso_id}>
                                            {curso.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {error && <p className="text-xs text-red-500">{error}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-2 sm:gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 sm:px-10 h-9 text-xs sm:text-sm"
                        >
                            Cerrar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || loading || cursosDisponibles.length === 0}
                            className="w-full sm:w-auto px-6 sm:px-10 bg-[#00a65a] hover:bg-[#008d4c] text-white h-9 text-xs sm:text-sm"
                        >
                            <Save className="size-3.5 sm:size-4 mr-2" />
                            {processing ? 'Asignando...' : 'Asignar Curso'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
