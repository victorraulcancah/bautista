<?php

namespace App\Services\Interfaces;

use App\Models\ActividadCurso;
use Illuminate\Pagination\LengthAwarePaginator;

interface ActividadServiceInterface
{
    public function listar(int $cursoId, string $search = '', int $perPage = 20): LengthAwarePaginator;
    public function obtener(int $id): ActividadCurso;
    public function crear(array $data): ActividadCurso;
    public function actualizar(int $id, array $data): ActividadCurso;
    public function eliminar(int $id): void;
}
