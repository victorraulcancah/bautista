<?php

namespace App\Services\Interfaces;

use App\Models\InstitucionNoticia;
use Illuminate\Pagination\LengthAwarePaginator;

interface NoticiaServiceInterface
{
    public function listar(int $instiId, string $search, int $perPage): LengthAwarePaginator;
    public function obtener(int $id): InstitucionNoticia;
    public function crear(int $instiId, array $data): InstitucionNoticia;
    public function actualizar(int $id, array $data): InstitucionNoticia;
    public function eliminar(int $id): void;
}
