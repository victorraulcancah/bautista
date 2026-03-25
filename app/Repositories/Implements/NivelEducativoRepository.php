<?php

namespace App\Repositories\Implements;

use App\Models\NivelEducativo;
use App\Repositories\Interfaces\NivelEducativoRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class NivelEducativoRepository implements NivelEducativoRepositoryInterface
{
    public function paginate(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return NivelEducativo::where('insti_id', $instiId)
            ->when($search, fn ($q) => $q->where('nombre_nivel', 'like', "%{$search}%"))
            ->latest('nivel_id')
            ->paginate($perPage);
    }

    public function all(int $instiId): Collection
    {
        return NivelEducativo::where('insti_id', $instiId)
            ->orderBy('nombre_nivel')
            ->get();
    }

    public function findById(int $id): NivelEducativo
    {
        return NivelEducativo::findOrFail($id);
    }

    public function create(array $data): NivelEducativo
    {
        return NivelEducativo::create($data);
    }

    public function update(NivelEducativo $nivel, array $data): NivelEducativo
    {
        $nivel->update($data);
        return $nivel;
    }

    public function delete(NivelEducativo $nivel): void
    {
        $nivel->delete();
    }
}
