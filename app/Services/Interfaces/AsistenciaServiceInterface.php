<?php

namespace App\Services\Interfaces;

use Illuminate\Database\Eloquent\Collection;

interface AsistenciaServiceInterface
{
    /** Calendario mensual de un alumno o docente. */
    public function calendarioPersona(int $instiId, int $personaId, string $tipo, int $anio, int $mes): array;

    /** Reporte mensual de toda la institución. */
    public function reporteMes(int $instiId, string $tipo, int $anio, int $mes): array;

    /** Marcar asistencia individual. */
    public function marcar(array $data): array;

    /** Marcar asistencia en lote (docente marca su sección). */
    public function marcarBatch(int $instiId, array $registros): void;

    /** Eliminar un registro. */
    public function eliminar(int $id): void;
}
