<?php

namespace App\Repositories\Interfaces;

use App\Models\Aula;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface AulaRepositoryInterface
{
    public function paginate(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function all(int $instiId): Collection;
    public function findById(int $id): Aula;
    public function create(array $data): Aula;
    public function update(int $id, array $data): Aula;
    public function delete(int $id): void;
}
