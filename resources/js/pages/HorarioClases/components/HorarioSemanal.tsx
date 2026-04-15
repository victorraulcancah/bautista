import { Edit, MapPin, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Clase = {
    id: number;
    curso: string;
    curso_id: number;
    docente: string;
    docente_id: number;
    hora_inicio: string;
    hora_fin: string;
    aula: string | null;
    duracion: number;
    seccion?: string;
    seccion_id?: number;
    grado?: string;
};

type DiaHorario = {
    dia: string;
    clases: Clase[];
};

type Props = {
    horario: Record<number, DiaHorario>;
    editable?: boolean;
    onEdit?: (clase: Clase) => void;
    onDelete?: (claseId: number) => void;
    showDocente?: boolean;
    showSeccion?: boolean;
};

const DIAS_SEMANA = [
    { num: 1, nombre: 'Lunes' },
    { num: 2, nombre: 'Martes' },
    { num: 3, nombre: 'Miércoles' },
    { num: 4, nombre: 'Jueves' },
    { num: 5, nombre: 'Viernes' },
    { num: 6, nombre: 'Sábado' },
];

export default function HorarioSemanal({
    horario,
    editable = false,
    onEdit,
    onDelete,
    showDocente = true,
    showSeccion = false,
}: Props) {
    const hayClases = Object.keys(horario).length > 0;

    if (!hayClases) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
                <p className="text-sm text-gray-500">
                    No hay clases programadas para este horario
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 w-32">
                            Hora
                        </th>
                        {DIAS_SEMANA.map((dia) => (
                            <th
                                key={dia.num}
                                className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700"
                            >
                                {dia.nombre}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {generarFilasHorario(horario).map((fila, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 align-top">
                                {fila.hora}
                            </td>
                            {DIAS_SEMANA.map((dia) => {
                                const clase = fila.clases[dia.num];
                                return (
                                    <td
                                        key={dia.num}
                                        className="border border-gray-200 p-2 align-top"
                                    >
                                        {clase ? (
                                            <div className="rounded-lg bg-blue-50 p-3 hover:bg-blue-100 transition-colors">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h4 className="font-semibold text-sm text-blue-900 leading-tight">
                                                        {clase.curso}
                                                    </h4>
                                                    {editable && (
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 text-blue-600 hover:bg-blue-200"
                                                                onClick={() => onEdit?.(clase)}
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 text-red-600 hover:bg-red-200"
                                                                onClick={() => onDelete?.(clase.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                {showDocente && (
                                                    <div className="flex items-center gap-1 text-xs text-blue-700 mb-1">
                                                        <User className="h-3 w-3" />
                                                        <span>{clase.docente}</span>
                                                    </div>
                                                )}

                                                {showSeccion && clase.seccion && (
                                                    <div className="text-xs text-blue-700 mb-1">
                                                        <span className="font-medium">{clase.seccion}</span>
                                                        {clase.grado && <span className="text-blue-600"> • {clase.grado}</span>}
                                                    </div>
                                                )}

                                                {clase.aula && (
                                                    <div className="flex items-center gap-1 text-xs text-blue-600">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{clase.aula}</span>
                                                    </div>
                                                )}

                                                <div className="text-xs text-blue-600 mt-1">
                                                    {clase.hora_inicio} - {clase.hora_fin}
                                                </div>
                                            </div>
                                        ) : null}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Función auxiliar para generar las filas del horario
function generarFilasHorario(horario: Record<number, DiaHorario>) {
    const horasSet = new Set<string>();
    
    // Recopilar todas las horas únicas
    Object.values(horario).forEach((dia) => {
        dia.clases.forEach((clase) => {
            horasSet.add(`${clase.hora_inicio}-${clase.hora_fin}`);
        });
    });

    const horas = Array.from(horasSet).sort();

    return horas.map((hora) => {
        const [inicio, fin] = hora.split('-');
        const clases: Record<number, Clase> = {};

        // Buscar clases para cada día en esta franja horaria
        Object.entries(horario).forEach(([diaNum, diaData]) => {
            const clase = diaData.clases.find(
                (c) => c.hora_inicio === inicio && c.hora_fin === fin
            );
            if (clase) {
                clases[parseInt(diaNum)] = clase;
            }
        });

        return {
            hora,
            clases,
        };
    });
}
