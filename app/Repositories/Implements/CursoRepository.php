<?php

namespace App\Repositories\Implements;

use App\Models\Curso;
use App\Repositories\Interfaces\CursoRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class CursoRepository implements CursoRepositoryInterface
{
    public function paginate(int $instiId, string $search = '', int $perPage = 15, ?int $gradoId = null): LengthAwarePaginator
    {
        return Curso::with(['nivel', 'grado'])
            ->where('id_insti', $instiId)
            ->when($search, fn ($q) => $q->where('nombre', 'like', "%{$search}%"))
            ->when($gradoId, fn ($q) => $q->where('grado_academico', $gradoId))
            ->latest('curso_id')
            ->paginate($perPage);
    }

    public function all(int $instiId): Collection
    {
        return Curso::with(['nivel', 'grado'])
            ->where('id_insti', $instiId)
            ->orderBy('nombre')
            ->get();
    }

    public function findById(int $id): Curso
    {
        return Curso::with(['nivel', 'grado'])->findOrFail($id);
    }

    public function create(array $data): Curso
    {
        return Curso::create($data);
    }

    public function update(Curso $curso, array $data): Curso
    {
        $curso->update($data);
        return $curso;
    }

    public function delete(Curso $curso): void
    {
        $curso->delete();
    }
}
