<?php

namespace App\Services\Implements;

use App\Models\InstitucionEducativa;
use App\Repositories\Interfaces\InstitucionRepositoryInterface;
use App\Services\Interfaces\InstitucionServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class InstitucionService implements InstitucionServiceInterface
{
    public function __construct(
        private readonly InstitucionRepositoryInterface $repository,
    ) {}

    public function listar(string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginate($search, $perPage);
    }

    public function obtener(int $id): InstitucionEducativa
    {
        return $this->repository->findById($id);
    }

    public function crear(array $data): InstitucionEducativa
    {
        return $this->repository->create($data);
    }

    public function actualizar(int $id, array $data): InstitucionEducativa
    {
        $institucion = $this->repository->findById($id);
        return $this->repository->update($institucion, $data);
    }

    public function eliminar(int $id): void
    {
        $institucion = $this->repository->findById($id);
        $this->repository->delete($institucion);
    }
}
