<?php

namespace App\Services\Implements;

use App\Models\InstitucionGaleria;
use App\Repositories\Interfaces\GaleriaRepositoryInterface;
use App\Services\Interfaces\GaleriaServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class GaleriaService implements GaleriaServiceInterface
{
    public function __construct(
        private readonly GaleriaRepositoryInterface $repository,
    ) {}

    public function listar(int $instiId, int $perPage = 20): LengthAwarePaginator
    {
        return $this->repository->paginate($instiId, $perPage);
    }

    public function obtener(int $id): InstitucionGaleria
    {
        return $this->repository->findById($id);
    }

    public function subir(int $instiId, array $data): InstitucionGaleria
    {
        $posicion = $this->repository->nextPosicion($instiId);
        $filename = $this->guardarImagen($data['imagen'], $posicion);

        return $this->repository->create([
            'insti_id'     => $instiId,
            'gal_nombre'   => $filename,
            'gal_posicion' => $posicion,
            'gal_estatus'  => 1,
        ]);
    }

    public function actualizar(int $id, array $data): InstitucionGaleria
    {
        $foto  = $this->repository->findById($id);
        $attrs = [];

        if (isset($data['imagen'])) {
            Storage::disk('public')->delete('galeria/' . $foto->gal_nombre);
            $attrs['gal_nombre'] = $this->guardarImagen($data['imagen'], $foto->gal_posicion);
        }

        if (isset($data['gal_posicion'])) {
            $attrs['gal_posicion'] = (int) $data['gal_posicion'];
        }

        if (isset($data['gal_estatus'])) {
            $attrs['gal_estatus'] = (int) $data['gal_estatus'];
        }

        return $this->repository->update($foto, $attrs);
    }

    public function eliminar(int $id): void
    {
        $foto = $this->repository->findById($id);
        Storage::disk('public')->delete('galeria/' . $foto->gal_nombre);
        $this->repository->delete($foto);
    }

    private function guardarImagen(mixed $file, int $posicion): string
    {
        $ext      = $file->getClientOriginalExtension();
        $filename = 'FOTO_' . $posicion . '.' . $ext;
        $file->storeAs('galeria', $filename, 'public');
        return $filename;
    }
}
