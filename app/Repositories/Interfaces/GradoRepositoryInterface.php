<?php

namespace App\Repositories\Interfaces;

use App\Models\Grado;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface GradoRepositoryInterface
{
    public function paginate(int $instiId, string $search = '', int $perPage = 15, ?int $nivelId = null): LengthAwarePaginator;
    public function all(int $instiId): Collection;
    public function findById(int $id): Grado;
    public function create(array $data): Grado;
    public function update(Grado $grado, array $data): Grado;
    public function delete(Grado $grado): void;
}
