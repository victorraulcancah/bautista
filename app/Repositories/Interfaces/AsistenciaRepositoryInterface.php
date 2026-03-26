<?php

namespace App\Repositories\Interfaces;

use App\Models\Asistencia;
use Illuminate\Database\Eloquent\Collection;

interface AsistenciaRepositoryInterface
{
    /** Registros de un mes para un alumno o docente (para calendario). */
    public function getPorPersonaMes(int $instiId, int $personaId, string $tipo, int $anio, int $mes): Collection;

    /** Registros de un mes para todos los alumnos/docentes de una institución (para reporte admin). */
    public function getReporteMes(int $instiId, string $tipo, int $anio, int $mes): Collection;

    /** Marcar/actualizar asistencia manual. */
    public function marcar(array $data): Asistencia;

    /** Marcar batch: array de ['id_persona', 'tipo', 'fecha', 'estado', ...] */
    public function marcarBatch(int $instiId, array $registros): void;

    public function findOrCreate(array $keys, array $values): Asistencia;

    public function eliminar(int $id): void;
}
