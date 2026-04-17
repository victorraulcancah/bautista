<?php

namespace App\Services\Implements;

use App\Models\Aula;
use App\Repositories\Interfaces\AulaRepositoryInterface;
use App\Services\Interfaces\AulaServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class AulaService implements AulaServiceInterface
{
    public function __construct(
        private readonly AulaRepositoryInterface $repository,
    ) {}

    public function listar(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginate($instiId, $search, $perPage);
    }

    public function todos(int $instiId): Collection
    {
        return $this->repository->all($instiId);
    }

    public function obtener(int $id): Aula
    {
        return $this->repository->findById($id);
    }

    public function crear(array $data): Aula
    {
        return $this->repository->create($data);
    }

    public function actualizar(int $id, array $data): Aula
    {
        return $this->repository->update($id, $data);
    }

    public function eliminar(int $id): void
    {
        $this->repository->delete($id);
    }
}
