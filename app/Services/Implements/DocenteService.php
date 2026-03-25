<?php

namespace App\Services\Implements;

use App\Models\Docente;
use App\Repositories\Interfaces\DocenteRepositoryInterface;
use App\Services\Interfaces\DocenteServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class DocenteService implements DocenteServiceInterface
{
    public function __construct(
        private readonly DocenteRepositoryInterface $repository,
    ) {}

    public function listar(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginate($instiId, $search, $perPage);
    }

    public function obtener(int $id): Docente
    {
        return $this->repository->findById($id);
    }

    public function crear(array $data): Docente
    {
        return $this->repository->create($data);
    }

    public function actualizar(int $id, array $data): Docente
    {
        $docente = $this->repository->findById($id);
        return $this->repository->update($docente, $data);
    }

    public function eliminar(int $id): void
    {
        $docente = $this->repository->findById($id);
        $this->repository->delete($docente);
    }
}
