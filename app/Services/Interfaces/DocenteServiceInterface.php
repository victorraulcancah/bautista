<?php

namespace App\Services\Interfaces;

use App\Models\Docente;
use Illuminate\Pagination\LengthAwarePaginator;

interface DocenteServiceInterface
{
    public function listar(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function obtener(int $id): Docente;
    public function crear(array $data): Docente;
    public function actualizar(int $id, array $data): Docente;
    public function eliminar(int $id): void;
}
