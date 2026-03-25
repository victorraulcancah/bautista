<?php

namespace App\Services\Implements;

use App\Models\Grado;
use App\Repositories\Interfaces\GradoRepositoryInterface;
use App\Services\Interfaces\GradoServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class GradoService implements GradoServiceInterface
{
    public function __construct(
        private readonly GradoRepositoryInterface $repository,
    ) {}

    public function listar(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginate($instiId, $search, $perPage);
    }

    public function todos(int $instiId): Collection
    {
        return $this->repository->all($instiId);
    }

    public function obtener(int $id): Grado
    {
        return $this->repository->findById($id);
    }

    public function crear(array $data): Grado
    {
        return $this->repository->create($data);
    }

    public function actualizar(int $id, array $data): Grado
    {
        $grado = $this->repository->findById($id);
        return $this->repository->update($grado, $data);
    }

    public function eliminar(int $id): void
    {
        $grado = $this->repository->findById($id);
        $this->repository->delete($grado);
    }
}
