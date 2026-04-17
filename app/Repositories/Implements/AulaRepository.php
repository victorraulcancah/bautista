<?php

namespace App\Repositories\Implements;

use App\Models\Aula;
use App\Repositories\Interfaces\AulaRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class AulaRepository implements AulaRepositoryInterface
{
    public function paginate(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return Aula::where('insti_id', $instiId)
            ->when($search, fn ($q) => $q->where('nombre', 'like', "%{$search}%"))
            ->orderBy('nombre')
            ->paginate($perPage);
    }

    public function all(int $instiId): Collection
    {
        return Aula::where('insti_id', $instiId)
            ->activo()
            ->orderBy('nombre')
            ->get();
    }

    public function findById(int $id): Aula
    {
        return Aula::findOrFail($id);
    }

    public function create(array $data): Aula
    {
        return Aula::create($data);
    }

    public function update(int $id, array $data): Aula
    {
        $aula = $this->findById($id);
        $aula->update($data);
        return $aula;
    }

    public function delete(int $id): void
    {
        $aula = $this->findById($id);
        $aula->delete();
    }
}
