<?php

namespace App\Repositories\Implements;

use App\Models\InstitucionGaleria;
use App\Repositories\Interfaces\GaleriaRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class GaleriaRepository implements GaleriaRepositoryInterface
{
    public function paginate(int $instiId, int $perPage = 20): LengthAwarePaginator
    {
        return InstitucionGaleria::where('insti_id', $instiId)
            ->orderBy('gal_posicion')
            ->paginate($perPage);
    }

    public function findById(int $id): InstitucionGaleria
    {
        return InstitucionGaleria::findOrFail($id);
    }

    public function nextPosicion(int $instiId): int
    {
        return (int) InstitucionGaleria::where('insti_id', $instiId)->max('gal_posicion') + 1;
    }

    public function create(array $data): InstitucionGaleria
    {
        return InstitucionGaleria::create($data);
    }

    public function update(InstitucionGaleria $foto, array $data): InstitucionGaleria
    {
        $foto->update($data);
        return $foto->fresh();
    }

    public function delete(InstitucionGaleria $foto): void
    {
        $foto->delete();
    }
}
