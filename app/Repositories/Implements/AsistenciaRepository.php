<?php

namespace App\Repositories\Implements;

use App\Models\Asistencia;
use App\Repositories\Interfaces\AsistenciaRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class AsistenciaRepository implements AsistenciaRepositoryInterface
{
    public function getPorPersonaMes(int $instiId, int $personaId, string $tipo, int $anio, int $mes): Collection
    {
        return Asistencia::where('insti_id', $instiId)
            ->where('id_persona', $personaId)
            ->where('tipo', $tipo)
            ->whereYear('fecha', $anio)
            ->whereMonth('fecha', $mes)
            ->orderBy('fecha')
            ->get();
    }

    public function getReporteMes(int $instiId, string $tipo, int $anio, int $mes): Collection
    {
        $query = Asistencia::with($tipo === 'E' ? 'estudiante.perfil' : 'docente.perfil')
            ->where('insti_id', $instiId)
            ->where('tipo', $tipo)
            ->whereYear('fecha', $anio)
            ->whereMonth('fecha', $mes)
            ->orderBy('id_persona')
            ->orderBy('fecha');

        return $query->get();
    }

    public function marcar(array $data): Asistencia
    {
        return Asistencia::updateOrCreate(
            [
                'id_persona' => $data['id_persona'],
                'tipo'       => $data['tipo'],
                'fecha'      => $data['fecha'],
                'turno'      => $data['turno'] ?? null,
            ],
            $data
        );
    }

    public function marcarBatch(int $instiId, array $registros): void
    {
        foreach ($registros as $reg) {
            Asistencia::updateOrCreate(
                [
                    'id_persona' => $reg['id_persona'],
                    'tipo'       => $reg['tipo'],
                    'fecha'      => $reg['fecha'],
                    'turno'      => $reg['turno'] ?? null,
                ],
                array_merge($reg, ['insti_id' => $instiId])
            );
        }
    }

    public function findOrCreate(array $keys, array $values): Asistencia
    {
        return Asistencia::firstOrCreate($keys, $values);
    }

    public function eliminar(int $id): void
    {
        Asistencia::findOrFail($id)->delete();
    }
}
