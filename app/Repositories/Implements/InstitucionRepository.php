<?php

namespace App\Repositories\Implements;

use App\Models\InstitucionEducativa;
use App\Repositories\Interfaces\InstitucionRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class InstitucionRepository implements InstitucionRepositoryInterface
{
    public function paginate(string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return InstitucionEducativa::query()
            ->when($search, fn ($q) => $q
                ->where('insti_razon_social', 'like', "%{$search}%")
                ->orWhere('insti_ruc', 'like', "%{$search}%")
                ->orWhere('insti_director', 'like', "%{$search}%")
            )
            ->latest('insti_id')
            ->paginate($perPage);
    }

    public function findById(int $id): InstitucionEducativa
    {
        return InstitucionEducativa::findOrFail($id);
    }

    public function create(array $data): InstitucionEducativa
    {
        return InstitucionEducativa::create($data);
    }

    public function update(InstitucionEducativa $institucion, array $data): InstitucionEducativa
    {
        $institucion->update($data);
        return $institucion->fresh();
    }

    public function delete(InstitucionEducativa $institucion): void
    {
        $institucion->delete();
    }
}
