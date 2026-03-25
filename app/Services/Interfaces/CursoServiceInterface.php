<?php

namespace App\Services\Interfaces;

use App\Models\Curso;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface CursoServiceInterface
{
    public function listar(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function todos(int $instiId): Collection;
    public function obtener(int $id): Curso;
    public function crear(array $data): Curso;
    public function actualizar(int $id, array $data): Curso;
    public function eliminar(int $id): void;
}
