<?php

namespace App\Services\Interfaces;

use App\Models\InstitucionEducativa;
use Illuminate\Pagination\LengthAwarePaginator;

interface InstitucionServiceInterface
{
    public function listar(string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function obtener(int $id): InstitucionEducativa;
    public function crear(array $data): InstitucionEducativa;
    public function actualizar(int $id, array $data): InstitucionEducativa;
    public function eliminar(int $id): void;
}
