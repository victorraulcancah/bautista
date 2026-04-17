<?php

namespace App\Services\Implements;

use App\Models\HorarioBloque;
use App\Models\HorarioClase;
use App\Services\Interfaces\HorarioServiceInterface;

class HorarioService implements HorarioServiceInterface
{
    /**
     * Obtener horario semanal de una sección
     */
    public function obtenerHorarioSeccion(int $seccionId, ?int $anio = null): array
    {
        $anio = $anio ?? date('Y');
        
        $clases = HorarioClase::with(['curso', 'docente'])
            ->where('seccion_id', $seccionId)
            ->where('anio_escolar', $anio)
            ->activo()
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();

        return $this->formatearHorarioSemanal($clases);
    }

    /**
     * Obtener horario de un docente
     */
    public function obtenerHorarioDocente(int $docenteId, ?int $anio = null): array
    {
        $anio = $anio ?? date('Y');
        
        $clases = HorarioClase::with(['curso', 'seccion.grado'])
            ->where('docente_id', $docenteId)
            ->where('anio_escolar', $anio)
            ->activo()
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();

        return $this->formatearHorarioSemanal($clases, true);
    }

    /**
     * Detectar conflictos de horario
     */
    public function detectarConflictos(array $datos): array
    {
        $conflictos = [];

        // Conflicto 1: Docente en dos lugares al mismo tiempo
        $conflictoDocente = HorarioClase::where('docente_id', $datos['docente_id'])
            ->where('dia_semana', $datos['dia_semana'])
            ->where('anio_escolar', $datos['anio_escolar'])
            ->where('activo', true)
            ->when(isset($datos['horario_clase_id']), function ($q) use ($datos) {
                $q->where('horario_clase_id', '!=', $datos['horario_clase_id']);
            })
            ->where(function($q) use ($datos) {
                $q->where('hora_inicio', '<', $datos['hora_fin'])
                  ->where('hora_fin', '>', $datos['hora_inicio']);
            })
            ->with(['seccion', 'curso'])
            ->first();

        if ($conflictoDocente) {
            $conflictos[] = [
                'tipo' => 'docente',
                'mensaje' => "El docente ya tiene clase de {$conflictoDocente->curso->nombre} en {$conflictoDocente->seccion->nombre} a esta hora",
                'clase' => $conflictoDocente
            ];
        }

        // Conflicto 2: Sección con dos clases al mismo tiempo
        $conflictoSeccion = HorarioClase::where('seccion_id', $datos['seccion_id'])
            ->where('dia_semana', $datos['dia_semana'])
            ->where('anio_escolar', $datos['anio_escolar'])
            ->where('activo', true)
            ->when(isset($datos['horario_clase_id']), function ($q) use ($datos) {
                $q->where('horario_clase_id', '!=', $datos['horario_clase_id']);
            })
            ->where(function($q) use ($datos) {
                $q->where('hora_inicio', '<', $datos['hora_fin'])
                  ->where('hora_fin', '>', $datos['hora_inicio']);
            })
            ->with(['curso', 'docente'])
            ->first();

        if ($conflictoSeccion) {
            $conflictos[] = [
                'tipo' => 'seccion',
                'mensaje' => "La sección ya tiene clase de {$conflictoSeccion->curso->nombre} a esta hora",
                'clase' => $conflictoSeccion
            ];
        }

        // Conflicto 3: Aula ocupada (si se especifica)
        if (!empty($datos['aula'])) {
            $conflictoAula = HorarioClase::where('aula', $datos['aula'])
                ->where('dia_semana', $datos['dia_semana'])
                ->where('anio_escolar', $datos['anio_escolar'])
                ->where('activo', true)
                ->when(isset($datos['horario_clase_id']), function ($q) use ($datos) {
                    $q->where('horario_clase_id', '!=', $datos['horario_clase_id']);
                })
                ->where(function($q) use ($datos) {
                    $q->where('hora_inicio', '<', $datos['hora_fin'])
                      ->where('hora_fin', '>', $datos['hora_inicio']);
                })
                ->with(['seccion', 'curso'])
                ->first();

            if ($conflictoAula) {
                $conflictos[] = [
                    'tipo' => 'aula',
                    'mensaje' => "El aula ya está ocupada por {$conflictoAula->seccion->nombre} - {$conflictoAula->curso->nombre}",
                    'clase' => $conflictoAula
                ];
            }
        }

        return $conflictos;
    }

    /**
     * Calcular carga horaria de un docente
     */
    public function calcularCargaHoraria(int $docenteId, ?int $anio = null): array
    {
        $anio = $anio ?? date('Y');
        
        $clases = HorarioClase::where('docente_id', $docenteId)
            ->where('anio_escolar', $anio)
            ->activo()
            ->get();

        $totalMinutos = 0;
        foreach ($clases as $clase) {
            $totalMinutos += $clase->duracion_minutos;
        }

        $totalHoras = round($totalMinutos / 60, 2);

        return [
            'total_clases' => $clases->count(),
            'total_horas_semana' => $totalHoras,
            'total_minutos_semana' => $totalMinutos,
            'promedio_horas_dia' => round($totalHoras / 5, 2),
        ];
    }

    /**
     * Clonar horario de un año a otro
     */
    public function clonarHorario(int $seccionId, int $anioOrigen, int $anioDestino): int
    {
        $clasesOrigen = HorarioClase::where('seccion_id', $seccionId)
            ->where('anio_escolar', $anioOrigen)
            ->get();

        $contador = 0;
        foreach ($clasesOrigen as $clase) {
            HorarioClase::create([
                'seccion_id' => $clase->seccion_id,
                'curso_id' => $clase->curso_id,
                'docente_id' => $clase->docente_id,
                'dia_semana' => $clase->dia_semana,
                'hora_inicio' => $clase->hora_inicio,
                'hora_fin' => $clase->hora_fin,
                'aula' => $clase->aula,
                'anio_escolar' => $anioDestino,
                'periodo' => $clase->periodo,
                'activo' => true,
            ]);
            $contador++;
        }

        return $contador;
    }

    /**
     * Obtener bloques horarios configurados
     */
    public function obtenerBloquesHorarios(int $instiId): array
    {
        return HorarioBloque::where('insti_id', $instiId)
            ->ordenado()
            ->get()
            ->map(fn($b) => [
                'bloque_id' => $b->bloque_id,
                'nombre' => $b->nombre,
                'hora_inicio' => substr($b->hora_inicio, 0, 5),
                'hora_fin' => substr($b->hora_fin, 0, 5),
                'orden' => $b->orden,
                'es_recreo' => $b->es_recreo,
            ])
            ->toArray();
    }

    /**
     * Formatear horario en estructura semanal
     */
    private function formatearHorarioSemanal($clases, bool $incluirSeccion = false): array
    {
        $horario = [];
        
        foreach ($clases as $clase) {
            $dia = $clase->dia_semana;
            
            if (!isset($horario[$dia])) {
                $horario[$dia] = [
                    'dia' => $clase->nombre_dia,
                    'clases' => []
                ];
            }
            
            $claseData = [
                'id' => $clase->horario_clase_id,
                'curso' => $clase->curso->nombre,
                'curso_id' => $clase->curso_id,
                'docente' => $clase->docente->nombres . ' ' . $clase->docente->apellidos,
                'docente_id' => $clase->docente_id,
                'hora_inicio' => $clase->hora_inicio_formateada,
                'hora_fin' => $clase->hora_fin_formateada,
                'aula' => $clase->aula,
                'duracion' => $clase->duracion_minutos,
            ];

            if ($incluirSeccion) {
                $claseData['seccion'] = $clase->seccion->nombre;
                $claseData['seccion_id'] = $clase->seccion_id;
                if ($clase->seccion->grado) {
                    $claseData['grado'] = $clase->seccion->grado->nombre_grado;
                }
            }
            
            $horario[$dia]['clases'][] = $claseData;
        }
        
        return $horario;
    }
}
