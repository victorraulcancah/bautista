import { BarChart3, Download, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import HorarioSemanal from './HorarioSemanal';

type Props = {
    docenteId: number;
};

type CargaHoraria = {
    total_clases: number;
    total_horas_semana: number;
    total_minutos_semana: number;
    promedio_horas_dia: number;
};

export default function DocenteHorarioView({ docenteId }: Props) {
    const [horario, setHorario] = useState<any>({});
    const [carga, setCarga] = useState<CargaHoraria | null>(null);
    const [loading, setLoading] = useState(true);
    const [anio, setAnio] = useState(new Date().getFullYear());

    useEffect(() => {
        cargarDatos();
    }, [docenteId, anio]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [horarioRes, cargaRes] = await Promise.all([
                api.get(`/docentes/${docenteId}/horario-clases`, { params: { anio } }),
                api.get(`/docentes/${docenteId}/carga-horaria`, { params: { anio } }),
            ]);
            setHorario(horarioRes.data);
            setCarga(cargaRes.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
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
            {/* Estadísticas de carga horaria */}
            {carga && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Clases
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {carga.total_clases}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">por semana</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Horas Semanales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {carga.total_horas_semana}h
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {carga.total_minutos_semana} minutos
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Promedio Diario
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {carga.promedio_horas_dia}h
                            </div>
                            <p className="text-xs text-gray-500 mt-1">por día</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Estado
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-green-600">
                                    {carga.total_horas_semana < 20 ? 'Normal' : 'Alta carga'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Controles */}
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

            {/* Horario semanal */}
            <HorarioSemanal
                horario={horario}
                editable={false}
                showDocente={false}
                showSeccion={true}
            />
        </div>
    );
}
