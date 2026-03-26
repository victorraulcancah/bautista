<?php

namespace App\Repositories\Implements;

use App\Models\Clase;
use App\Models\Unidad;
use App\Repositories\Interfaces\CursoContenidoRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CursoContenidoRepository implements CursoContenidoRepositoryInterface
{
    // ── Unidades ─────────────────────────────────────────────────────────────

    public function getUnidadesByCurso(int $cursoId): Collection
    {
        return Unidad::with(['clases.archivos'])
            ->where('curso_id', $cursoId)
            ->orderBy('orden')
            ->get();
    }

    public function findUnidad(int $id): Unidad
    {
        return Unidad::with(['clases.archivos'])->findOrFail($id);
    }

    public function createUnidad(array $data): Unidad
    {
        // Asignar orden al final si no se especifica
        if (empty($data['orden'])) {
            $data['orden'] = Unidad::where('curso_id', $data['curso_id'])->max('orden') + 1;
        }

        return Unidad::create($data);
    }

    public function updateUnidad(Unidad $unidad, array $data): Unidad
    {
        $unidad->update($data);
        return $unidad->load('clases.archivos');
    }

    public function deleteUnidad(Unidad $unidad): void
    {
        $unidad->delete();
    }

    public function reordenarUnidades(int $cursoId, array $orden): void
    {
        foreach ($orden as $pos => $unidadId) {
            Unidad::where('unidad_id', $unidadId)
                ->where('curso_id', $cursoId)
                ->update(['orden' => $pos + 1]);
        }
    }

    // ── Clases ────────────────────────────────────────────────────────────────

    public function findClase(int $id): Clase
    {
        return Clase::with('archivos')->findOrFail($id);
    }

    public function createClase(array $data): Clase
    {
        if (empty($data['orden'])) {
            $data['orden'] = Clase::where('unidad_id', $data['unidad_id'])->max('orden') + 1;
        }

        $clase = Clase::create($data);
        return $clase->load('archivos');
    }

    public function updateClase(Clase $clase, array $data): Clase
    {
        $clase->update($data);
        return $clase->load('archivos');
    }

    public function deleteClase(Clase $clase): void
    {
        $clase->delete();
    }

    public function reordenarClases(int $unidadId, array $orden): void
    {
        foreach ($orden as $pos => $claseId) {
            Clase::where('clase_id', $claseId)
                ->where('unidad_id', $unidadId)
                ->update(['orden' => $pos + 1]);
        }
    }
}
