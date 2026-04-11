<?php

namespace App\Services\Implements;

use App\Models\DocenteCurso;
use App\Models\Matricula;
use App\Models\AsistenciaAlumno;
use App\Models\AsistenciaActividad;
use App\Models\Clase;
use App\Exceptions\DocenteCursoNotFoundException;
use App\Services\Interfaces\DocenteAsistenciaServiceInterface;

class DocenteAsistenciaService implements DocenteAsistenciaServiceInterface
{
    public function obtenerMatrizAsistencia(int $docenteCursoId, ?string $desde = null, ?string $hasta = null): array
    {
        $dc = DocenteCurso::find($docenteCursoId);
        
        if (!$dc) {
            throw new DocenteCursoNotFoundException();
        }
        
        $alumnos = Matricula::where('seccion_id', $dc->seccion_id)
            ->where('apertura_id', $dc->apertura_id)
            ->where('estado', '1')
            ->with('estudiante.perfil')
            ->get();

        $clasesIds = Clase::whereHas('unidad', function($q) use ($dc) {
            $q->where('curso_id', $dc->curso_id);
        })->pluck('clase_id');

        $sesionesQuery = AsistenciaActividad::whereIn('id_clase_curso', $clasesIds);
        
        if ($desde) {
            $sesionesQuery->where('fecha', '>=', $desde);
        }
        if ($hasta) {
            $sesionesQuery->where('fecha', '<=', $hasta);
        }
        
        $sesiones = $sesionesQuery->orderBy('fecha', 'asc')->get();

        $registros = AsistenciaAlumno::whereIn('id_estudiante', $alumnos->pluck('estu_id'))
            ->whereIn('id_asistencia_clase', $sesiones->pluck('id'))
            ->get();

        $totalClases = $sesiones->count();
        $totalEstudiantes = $alumnos->count();
        $totalPresentes = $registros->where('estado', 'P')->count();
        $totalFaltas = $registros->where('estado', 'F')->count();
        $promedioAsistencia = $totalClases > 0 && $totalEstudiantes > 0 
            ? round(($totalPresentes / ($totalClases * $totalEstudiantes)) * 100, 2) 
            : 0;

        $records = $sesiones->map(function($sesion) use ($registros, $alumnos) {
            return [
                'fecha' => $sesion->fecha,
                'estudiantes' => $alumnos->map(function($m) use ($registros, $sesion) {
                    $registro = $registros->where('id_asistencia_clase', $sesion->id)
                        ->where('id_estudiante', $m->estu_id)
                        ->first();
                    
                    return [
                        'estu_id' => $m->estu_id,
                        'nombre' => $m->estudiante?->perfil?->nombre_ordenado,
                        'estado' => $registro?->estado ?? 'P',
                        'observacion' => $registro?->observacion,
                    ];
                })->values()
            ];
        })->values();

        return [
            'records' => $records->toArray(),
            'stats' => [
                'totalClases' => $totalClases,
                'totalEstudiantes' => $totalEstudiantes,
                'promedioAsistencia' => $promedioAsistencia,
                'totalFaltas' => $totalFaltas,
            ]
        ];
    }

    public function iniciarSesionAsistencia(array $data): object
    {
        return AsistenciaActividad::firstOrCreate([
            'id_clase_curso' => $data['id_clase_curso'],
            'fecha' => $data['fecha'],
        ]);
    }

    public function marcarAsistencia(int $sessionId, array $asistencias): void
    {
        foreach ($asistencias as $asistencia) {
            AsistenciaAlumno::updateOrCreate(
                [
                    'id_asistencia_clase' => $sessionId,
                    'id_estudiante' => $asistencia['id_estudiante']
                ],
                [
                    'estado' => $asistencia['estado'],
                    'observacion' => $asistencia['observacion'] ?? null,
                ]
            );
        }
    }
}
