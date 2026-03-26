<?php

namespace App\Services\Implements;

use App\Repositories\Interfaces\AsistenciaRepositoryInterface;
use App\Services\Interfaces\AsistenciaServiceInterface;

class AsistenciaService implements AsistenciaServiceInterface
{
    public function __construct(
        private readonly AsistenciaRepositoryInterface $repository,
    ) {}

    public function calendarioPersona(int $instiId, int $personaId, string $tipo, int $anio, int $mes): array
    {
        $registros = $this->repository->getPorPersonaMes($instiId, $personaId, $tipo, $anio, $mes);

        // Convertir a formato de calendario: { "2026-03-10": { estado, turno, hora_entrada, hora_salida } }
        $calendario = [];
        foreach ($registros as $r) {
            $key = $r->fecha->format('Y-m-d');
            $calendario[$key][] = [
                'asistencia_id' => $r->asistencia_id,
                'estado'        => $r->estado,
                'turno'         => $r->turno,
                'hora_entrada'  => $r->hora_entrada,
                'hora_salida'   => $r->hora_salida,
                'observacion'   => $r->observacion,
            ];
        }

        return $calendario;
    }

    public function reporteMes(int $instiId, string $tipo, int $anio, int $mes): array
    {
        $registros = $this->repository->getReporteMes($instiId, $tipo, $anio, $mes);

        // Agrupar por persona
        $reporte = [];
        foreach ($registros as $r) {
            $id     = $r->id_persona;
            $perfil = $tipo === 'E'
                ? $r->estudiante?->perfil
                : $r->docente?->perfil;

            if (!isset($reporte[$id])) {
                $reporte[$id] = [
                    'id_persona'     => $id,
                    'nombre_completo' => $perfil
                        ? trim("{$perfil->primer_nombre} {$perfil->segundo_nombre} {$perfil->apellido_paterno} {$perfil->apellido_materno}")
                        : "ID {$id}",
                    'asistencias'    => [],
                    'total_asistio'  => 0,
                    'total_falto'    => 0,
                    'total_tardanza' => 0,
                ];
            }

            $fecha = $r->fecha->format('Y-m-d');
            $reporte[$id]['asistencias'][$fecha] = $r->estado;

            match ($r->estado) {
                '1'     => $reporte[$id]['total_asistio']++,
                '0'     => $reporte[$id]['total_falto']++,
                'T'     => $reporte[$id]['total_tardanza']++,
                default => null,
            };
        }

        return array_values($reporte);
    }

    public function marcar(array $data): array
    {
        $asistencia = $this->repository->marcar($data);
        return [
            'asistencia_id' => $asistencia->asistencia_id,
            'estado'        => $asistencia->estado,
            'fecha'         => $asistencia->fecha->format('Y-m-d'),
            'turno'         => $asistencia->turno,
            'hora_entrada'  => $asistencia->hora_entrada,
            'hora_salida'   => $asistencia->hora_salida,
        ];
    }

    public function marcarBatch(int $instiId, array $registros): void
    {
        $this->repository->marcarBatch($instiId, $registros);
    }

    public function eliminar(int $id): void
    {
        $this->repository->eliminar($id);
    }
}
