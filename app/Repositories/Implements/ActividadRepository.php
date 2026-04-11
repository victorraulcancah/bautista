<?php

namespace App\Repositories\Implements;

use App\Models\ActividadCurso;
use App\Repositories\Interfaces\ActividadRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ActividadRepository implements ActividadRepositoryInterface
{
    public function paginate(int $cursoId, string $search = '', int $perPage = 20): LengthAwarePaginator
    {
        return ActividadCurso::with(['tipoActividad', 'clase', 'cuestionario'])
            ->where('id_curso', $cursoId)
            ->when($search, fn ($q) => $q->where('nombre_actividad', 'like', "%{$search}%"))
            ->latest('actividad_id')
            ->paginate($perPage);
    }

    public function findById(int $id): ActividadCurso
    {
        return ActividadCurso::with(['tipoActividad', 'clase', 'cuestionario.preguntas.alternativas'])->findOrFail($id);
    }

    public function create(array $data): ActividadCurso
    {
        return ActividadCurso::create($data);
    }

    public function update(ActividadCurso $actividad, array $data): ActividadCurso
    {
        $actividad->update($data);
        return $actividad->fresh(['tipoActividad', 'clase', 'cuestionario']);
    }

    public function delete(ActividadCurso $actividad): void
    {
        $actividad->delete();
    }
}
