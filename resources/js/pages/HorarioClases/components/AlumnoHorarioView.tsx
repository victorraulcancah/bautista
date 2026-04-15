import { Download, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import HorarioSemanal from './HorarioSemanal';

type Props = {
    seccionId: number;
};

export default function AlumnoHorarioView({ seccionId }: Props) {
    const [horario, setHorario] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [anio, setAnio] = useState(new Date().getFullYear());

    useEffect(() => {
        cargarHorario();
    }, [seccionId, anio]);

    const cargarHorario = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/secciones/${seccionId}/horario`, {
                params: { anio },
            });
            setHorario(response.data);
        } catch (error) {
            console.error('Error al cargar horario:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">
                        Año Escolar:
                    </label>
                    <select
                        value={anio}
                        onChange={(e) => setAnio(parseInt(e.target.value))}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {[2024, 2025, 2026, 2027].map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => window.print()}
                >
                    <Download className="h-4 w-4" />
                    Descargar PDF
                </Button>
            </div>

            <HorarioSemanal
                horario={horario}
                editable={false}
                showDocente={true}
                showSeccion={false}
            />
        </div>
    );
}
