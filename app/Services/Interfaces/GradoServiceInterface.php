<?php

namespace App\Services\Interfaces;

use App\Models\Grado;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface GradoServiceInterface
{
    public function listar(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function todos(int $instiId): Collection;
    public function obtener(int $id): Grado;
    public function crear(array $data): Grado;
    public function actualizar(int $id, array $data): Grado;
    public function eliminar(int $id): void;
}
