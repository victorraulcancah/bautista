<?php

namespace App\Services\Interfaces;

use App\Models\InstitucionGaleria;
use Illuminate\Pagination\LengthAwarePaginator;

interface GaleriaServiceInterface
{
    public function listar(int $instiId, int $perPage = 20): LengthAwarePaginator;
    public function obtener(int $id): InstitucionGaleria;
    public function subir(int $instiId, array $data): InstitucionGaleria;
    public function actualizar(int $id, array $data): InstitucionGaleria;
    public function eliminar(int $id): void;
}
