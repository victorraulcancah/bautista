/**
 * StatsBar — barra de estadísticas del tab General.
 * Responsabilidad: mostrar promedio, estudiantes perfectos y estudiantes con faltas.
 */
interface Props {
    promedioAsistencia: number;
    totalEstudiantes: number;
    estudiantesConAsistenciaPerfecta: number;
    estudiantesConFaltas: number;
}

export function StatsBar({ promedioAsistencia, totalEstudiantes, estudiantesConAsistenciaPerfecta, estudiantesConFaltas }: Props) {
    const pctPerfecta = totalEstudiantes > 0
        ? Math.round((estudiantesConAsistenciaPerfecta / totalEstudiantes) * 100)
        : 0;
    const pctFaltas = totalEstudiantes > 0
        ? Math.round((estudiantesConFaltas / totalEstudiantes) * 100)
        : 0;

    return (
        <div className="flex items-center gap-0 border-b border-gray-200 bg-white">
            {/* Promedio */}
            <div className="flex items-center gap-3 px-6 py-4 border-r border-gray-200">
                <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-black">
                    {promedioAsistencia.toFixed(2).replace('.', ',')} %
                </span>
                <span className="text-sm text-gray-500 font-medium">Promedio de asistencia</span>
            </div>

            {/* Asistencia perfecta */}
            <div className="flex items-center gap-3 px-6 py-4 border-r border-gray-200">
                <span className="text-2xl font-black text-gray-900">{estudiantesConAsistenciaPerfecta}</span>
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-700">Estudiantes con asistencia perfecta</span>
                    <span className="text-xs text-gray-400">{pctPerfecta} % de la clase</span>
                </div>
            </div>

            {/* Con faltas */}
            <div className="flex items-center gap-3 px-6 py-4">
                <span className="text-2xl font-black text-gray-900">{estudiantesConFaltas}</span>
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-700">Estudiantes con asistencia imperfecta</span>
                    <span className="text-xs text-gray-400">{pctFaltas} % de la clase</span>
                </div>
            </div>
        </div>
    );
}
