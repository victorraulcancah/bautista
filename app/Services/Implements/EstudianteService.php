<?php

namespace App\Services\Implements;

use App\Models\Estudiante;
use App\Repositories\Interfaces\EstudianteRepositoryInterface;
use App\Services\Interfaces\EstudianteServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class EstudianteService implements EstudianteServiceInterface
{
    public function __construct(
        private readonly EstudianteRepositoryInterface $repository,
    ) {}

    public function listar(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginate($instiId, $search, $perPage);
    }

    public function obtener(int $id): Estudiante
    {
        return $this->repository->findById($id);
    }

    public function crear(array $data): Estudiante
    {
        return $this->repository->create($data);
    }

    public function actualizar(int $id, array $data): Estudiante
    {
        $estudiante = $this->repository->findById($id);
        return $this->repository->update($estudiante, $data);
    }

    public function eliminar(int $id): void
    {
        $estudiante = $this->repository->findById($id);
        $this->repository->delete($estudiante);
    }
}
