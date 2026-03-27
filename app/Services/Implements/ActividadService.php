<?php

namespace App\Services\Implements;

use App\Models\ActividadCurso;
use App\Repositories\Interfaces\ActividadRepositoryInterface;
use App\Services\Interfaces\ActividadServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ActividadService implements ActividadServiceInterface
{
    public function __construct(
        private readonly ActividadRepositoryInterface $repository,
    ) {}

    public function listar(int $cursoId, string $search = '', int $perPage = 20): LengthAwarePaginator
    {
        return $this->repository->paginate($cursoId, $search, $perPage);
    }

    public function obtener(int $id): ActividadCurso
    {
        return $this->repository->findById($id);
    }

    public function crear(array $data): ActividadCurso
    {
        return $this->repository->create($data);
    }

    public function actualizar(int $id, array $data): ActividadCurso
    {
        $actividad = $this->repository->findById($id);
        return $this->repository->update($actividad, $data);
    }

    public function eliminar(int $id): void
    {
        $actividad = $this->repository->findById($id);
        $this->repository->delete($actividad);
    }
}
