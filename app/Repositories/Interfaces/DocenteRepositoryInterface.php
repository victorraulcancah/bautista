<?php

namespace App\Repositories\Interfaces;

use App\Models\Docente;
use Illuminate\Pagination\LengthAwarePaginator;

interface DocenteRepositoryInterface
{
    public function paginate(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function findById(int $id): Docente;
    public function create(array $data): Docente;
    public function update(Docente $docente, array $data): Docente;
    public function delete(Docente $docente): void;
}
