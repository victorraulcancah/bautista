<?php

namespace App\Services\Implements;

use App\Models\Seccion;
use App\Repositories\Interfaces\SeccionRepositoryInterface;
use App\Services\Interfaces\SeccionServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class SeccionService implements SeccionServiceInterface
{
    public function __construct(
        private readonly SeccionRepositoryInterface $repository,
    ) {}

    public function listar(int $instiId, string $search = '', int $perPage = 15, ?int $gradoId = null): LengthAwarePaginator
    {
        return $this->repository->paginate($instiId, $search, $perPage, $gradoId);
    }

    public function todos(int $instiId): Collection
    {
        return $this->repository->all($instiId);
    }

    public function obtener(int $id): Seccion
    {
        return $this->repository->findById($id);
    }

    public function crear(array $data): Seccion
    {
        return $this->repository->create($data);
    }

    public function actualizar(int $id, array $data): Seccion
    {
        $seccion = $this->repository->findById($id);
        return $this->repository->update($seccion, $data);
    }

    public function eliminar(int $id): void
    {
        $seccion = $this->repository->findById($id);
        $this->repository->delete($seccion);
    }
}
