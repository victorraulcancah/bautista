<?php

namespace App\Services\Interfaces;

use App\Models\NivelEducativo;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface NivelEducativoServiceInterface
{
    public function listar(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function todos(int $instiId): Collection;
    public function obtener(int $id): NivelEducativo;
    public function crear(array $data): NivelEducativo;
    public function actualizar(int $id, array $data): NivelEducativo;
    public function eliminar(int $id): void;
}
