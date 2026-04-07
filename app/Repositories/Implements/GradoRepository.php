<?php

namespace App\Repositories\Implements;

use App\Models\Grado;
use App\Repositories\Interfaces\GradoRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class GradoRepository implements GradoRepositoryInterface
{
    public function paginate(int $instiId, string $search = '', int $perPage = 15, ?int $nivelId = null): LengthAwarePaginator
    {
        return Grado::with('nivel')
            ->whereHas('nivel', fn ($q) => $q->where('insti_id', $instiId))
            ->when($nivelId, fn ($q) => $q->where('nivel_id', $nivelId))
            ->when($search, fn ($q) => $q->where('nombre_grado', 'like', "%{$search}%"))
            ->latest('grado_id')
            ->paginate($perPage);
    }

    public function all(int $instiId): Collection
    {
        return Grado::with('nivel')
            ->whereHas('nivel', fn ($q) => $q->where('insti_id', $instiId))
            ->orderBy('nombre_grado')
            ->get();
    }

    public function findById(int $id): Grado
    {
        return Grado::with('nivel')->findOrFail($id);
    }

    public function create(array $data): Grado
    {
        return Grado::create($data);
    }

    public function update(Grado $grado, array $data): Grado
    {
        $grado->update($data);
        return $grado;
    }

    public function delete(Grado $grado): void
    {
        $grado->delete();
    }
}
