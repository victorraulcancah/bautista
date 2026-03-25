<?php

namespace App\Repositories\Implements;

use App\Models\Seccion;
use App\Repositories\Interfaces\SeccionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class SeccionRepository implements SeccionRepositoryInterface
{
    public function paginate(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return Seccion::with(['grado.nivel'])
            ->whereHas('grado.nivel', fn ($q) => $q->where('insti_id', $instiId))
            ->when($search, fn ($q) => $q->where('nombre', 'like', "%{$search}%"))
            ->latest('seccion_id')
            ->paginate($perPage);
    }

    public function all(int $instiId): Collection
    {
        return Seccion::with(['grado.nivel'])
            ->whereHas('grado.nivel', fn ($q) => $q->where('insti_id', $instiId))
            ->orderBy('nombre')
            ->get();
    }

    public function findById(int $id): Seccion
    {
        return Seccion::with(['grado.nivel'])->findOrFail($id);
    }

    public function create(array $data): Seccion
    {
        return Seccion::create($data);
    }

    public function update(Seccion $seccion, array $data): Seccion
    {
        $seccion->update($data);
        return $seccion;
    }

    public function delete(Seccion $seccion): void
    {
        $seccion->delete();
    }
}
