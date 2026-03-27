<?php

namespace App\Repositories\Interfaces;

use App\Models\InstitucionGaleria;
use Illuminate\Pagination\LengthAwarePaginator;

interface GaleriaRepositoryInterface
{
    public function paginate(int $instiId, int $perPage = 20): LengthAwarePaginator;
    public function findById(int $id): InstitucionGaleria;
    public function nextPosicion(int $instiId): int;
    public function create(array $data): InstitucionGaleria;
    public function update(InstitucionGaleria $foto, array $data): InstitucionGaleria;
    public function delete(InstitucionGaleria $foto): void;
}
