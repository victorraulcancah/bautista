<?php

namespace App\Repositories\Interfaces;

use App\Models\Seccion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface SeccionRepositoryInterface
{
    public function paginate(int $instiId, string $search = '', int $perPage = 15, ?int $gradoId = null): LengthAwarePaginator;
    public function all(int $instiId): Collection;
    public function findById(int $id): Seccion;
    public function create(array $data): Seccion;
    public function update(Seccion $seccion, array $data): Seccion;
    public function delete(Seccion $seccion): void;
}
