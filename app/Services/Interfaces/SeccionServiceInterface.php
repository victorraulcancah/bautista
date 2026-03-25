<?php

namespace App\Services\Interfaces;

use App\Models\Seccion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface SeccionServiceInterface
{
    public function listar(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function todos(int $instiId): Collection;
    public function obtener(int $id): Seccion;
    public function crear(array $data): Seccion;
    public function actualizar(int $id, array $data): Seccion;
    public function eliminar(int $id): void;
}
