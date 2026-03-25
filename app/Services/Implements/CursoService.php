<?php

namespace App\Services\Implements;

use App\Models\Curso;
use App\Repositories\Interfaces\CursoRepositoryInterface;
use App\Services\Interfaces\CursoServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class CursoService implements CursoServiceInterface
{
    public function __construct(
        private readonly CursoRepositoryInterface $repository,
    ) {}

    public function listar(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginate($instiId, $search, $perPage);
    }

    public function todos(int $instiId): Collection
    {
        return $this->repository->all($instiId);
    }

    public function obtener(int $id): Curso
    {
        return $this->repository->findById($id);
    }

    public function crear(array $data): Curso
    {
        return $this->repository->create($data);
    }

    public function actualizar(int $id, array $data): Curso
    {
        $curso = $this->repository->findById($id);
        return $this->repository->update($curso, $data);
    }

    public function eliminar(int $id): void
    {
        $curso = $this->repository->findById($id);
        $this->repository->delete($curso);
    }
}
