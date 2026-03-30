<?php

namespace App\Repositories\Interfaces;

use App\Models\Curso;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface CursoRepositoryInterface
{
    public function paginate(int $instiId, string $search = '', int $perPage = 15, ?int $gradoId = null, ?int $nivelId = null): LengthAwarePaginator;
    public function all(int $instiId): Collection;
    public function findById(int $id): Curso;
    public function create(array $data): Curso;
    public function update(Curso $curso, array $data): Curso;
    public function delete(Curso $curso): void;
}
