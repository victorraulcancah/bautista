<?php

namespace App\Services\Interfaces;

use App\Models\Estudiante;
use Illuminate\Pagination\LengthAwarePaginator;

interface EstudianteServiceInterface
{
    public function listar(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function obtener(int $id): Estudiante;
    public function crear(array $data): Estudiante;
    public function actualizar(int $id, array $data): Estudiante;
    public function eliminar(int $id): void;
}
