<?php

namespace App\Repositories\Interfaces;

use App\Models\Estudiante;
use Illuminate\Pagination\LengthAwarePaginator;

interface EstudianteRepositoryInterface
{
    public function paginate(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function findById(int $id): Estudiante;
    public function create(array $data): Estudiante;
    public function update(Estudiante $estudiante, array $data): Estudiante;
    public function delete(Estudiante $estudiante): void;
}
