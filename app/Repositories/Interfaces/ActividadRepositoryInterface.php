<?php

namespace App\Repositories\Interfaces;

use App\Models\ActividadCurso;
use Illuminate\Pagination\LengthAwarePaginator;

interface ActividadRepositoryInterface
{
    public function paginate(int $cursoId, string $search = '', int $perPage = 20): LengthAwarePaginator;
    public function findById(int $id): ActividadCurso;
    public function create(array $data): ActividadCurso;
    public function update(ActividadCurso $actividad, array $data): ActividadCurso;
    public function delete(ActividadCurso $actividad): void;
}
