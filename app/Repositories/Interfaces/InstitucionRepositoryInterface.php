<?php

namespace App\Repositories\Interfaces;

use App\Models\InstitucionEducativa;
use Illuminate\Pagination\LengthAwarePaginator;

interface InstitucionRepositoryInterface
{
    public function paginate(string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function findById(int $id): InstitucionEducativa;
    public function create(array $data): InstitucionEducativa;
    public function update(InstitucionEducativa $institucion, array $data): InstitucionEducativa;
    public function delete(InstitucionEducativa $institucion): void;
}
