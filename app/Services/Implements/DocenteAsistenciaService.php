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

    /**
     * Obtiene la matriz editable: alumnos × días del mes con sus estados actuales.
     * Incluye todas las fechas que ya tienen sesión registrada en ese mes.
     */
    public function obtenerMatrizEditable(int $docenteCursoId, string $mes): array
    {
        $dc = DocenteCurso::find($docenteCursoId);
        if (!$dc) throw new DocenteCursoNotFoundException();

        $alumnos = Matricula::where('seccion_id', $dc->seccion_id)
            ->where('apertura_id', $dc->apertura_id)
            ->where('estado', '1')
            ->with('estudiante.perfil')
            ->get();

        $clasesIds = Clase::whereHas('unidad', function ($q) use ($dc) {
            $q->where('curso_id', $dc->curso_id);
        })->pluck('clase_id');

        // Sesiones del mes
        [$year, $month] = explode('-', $mes);
        $desde = "{$year}-{$month}-01";
        $hasta = date('Y-m-t', strtotime($desde));

        $sesiones = AsistenciaActividad::whereIn('id_clase_curso', $clasesIds)
            ->whereBetween('fecha', [$desde, $hasta])
            ->orderBy('fecha')
            ->get();

        $registros = AsistenciaAlumno::whereIn('id_asistencia_clase', $sesiones->pluck('id'))
            ->get();

        $fechas = $sesiones->pluck('fecha')->unique()->sort()->values();

        $alumnosData = $alumnos->map(function ($m) use ($registros, $sesiones, $fechas) {
            $dias = [];
            foreach ($fechas as $fecha) {
                $sesion = $sesiones->firstWhere('fecha', $fecha);
                $reg = $sesion
                    ? $registros->where('id_asistencia_clase', $sesion->id)->where('id_estudiante', $m->estu_id)->first()
                    : null;
                $dias[$fecha] = $reg?->estado ?? null;
            }
            return [
                'estu_id'  => $m->estu_id,
                'nombre'   => $m->estudiante?->perfil?->nombre_ordenado ?? 'Sin nombre',
                'dias'     => $dias,
            ];
        })->values();

        return [
            'alumnos' => $alumnosData->toArray(),
            'fechas'  => $fechas->toArray(),
        ];
    }

    /**
     * Guarda/actualiza asistencia de todos los alumnos para una fecha dada.
     * Crea la sesión automáticamente usando la primera clase del curso.
     */
    public function guardarAsistenciaPorFecha(int $docenteCursoId, string $fecha, array $asistencias): void
    {
        $dc = DocenteCurso::find($docenteCursoId);
        if (!$dc) throw new DocenteCursoNotFoundException();

        // Obtener la primera clase del curso como "clase representativa"
        $claseId = Clase::whereHas('unidad', function ($q) use ($dc) {
            $q->where('curso_id', $dc->curso_id);
        })->orderBy('clase_id')->value('clase_id');

        if (!$claseId) return;

        $sesion = AsistenciaActividad::firstOrCreate(
            ['id_clase_curso' => $claseId, 'fecha' => $fecha]
        );

        foreach ($asistencias as $item) {
            AsistenciaAlumno::updateOrCreate(
                ['id_asistencia_clase' => $sesion->id, 'id_estudiante' => $item['id_estudiante']],
                ['estado' => $item['estado'], 'observacion' => $item['observacion'] ?? null]
            );
        }
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
