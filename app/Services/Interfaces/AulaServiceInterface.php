<?php

namespace App\Services\Interfaces;

use App\Models\Aula;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface AulaServiceInterface
{
    public function listar(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function todos(int $instiId): Collection;
    public function obtener(int $id): Aula;
    public function crear(array $data): Aula;
    public function actualizar(int $id, array $data): Aula;
    public function eliminar(int $id): void;
}
