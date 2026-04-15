import { Copy, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';

type Props = {
    open: boolean;
    onClose: () => void;
    onCloned: () => void;
    seccionId: number | null;
    anioActual: number;
};

export default function ClonarHorarioModal({ open, onClose, onCloned, seccionId, anioActual }: Props) {
    const [anioOrigen, setAnioOrigen] = useState(anioActual - 1);
    const [anioDestino, setAnioDestino] = useState(anioActual);
    const [loading, setLoading] = useState(false);

    const handleClonar = async () => {
        if (!seccionId) return;

        setLoading(true);
        try {
            const response = await api.post(`/secciones/${seccionId}/clonar-horario`, {
                anio_origen: anioOrigen,
                anio_destino: anioDestino,
            });

            alert(response.data.message || 'Horario clonado exitosamente');
            onCloned();
            onClose();
        } catch (error: any) {
            console.error('Error al clonar horario:', error);
            alert(error.response?.data?.message || 'Error al clonar el horario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Copy className="h-5 w-5 text-blue-600" />
                        Clonar Horario
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-600">
                        Copia todas las clases de un año escolar a otro. Útil para reutilizar horarios de años anteriores.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Año origen (copiar desde) *
                        </label>
                        <input
                            type="number"
                            value={anioOrigen}
                            onChange={(e) => setAnioOrigen(parseInt(e.target.value))}
                            min={2020}
                            max={2030}
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Año destino (copiar hacia) *
                        </label>
                        <input
                            type="number"
                            value={anioDestino}
                            onChange={(e) => setAnioDestino(parseInt(e.target.value))}
                            min={2020}
                            max={2030}
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {anioOrigen === anioDestino && (
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                            <p className="text-sm text-amber-800">
                                El año origen y destino deben ser diferentes
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleClonar}
                        disabled={loading || anioOrigen === anioDestino}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Clonando...
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Clonar Horario
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
