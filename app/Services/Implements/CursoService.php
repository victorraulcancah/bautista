<?php

namespace App\Services\Implements;

use App\Models\Curso;
use App\Repositories\Interfaces\CursoRepositoryInterface;
use App\Services\Interfaces\CursoServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class CursoService implements CursoServiceInterface
{
    public function __construct(
        private readonly CursoRepositoryInterface $repository,
    ) {}

    public function listar(int $instiId, string $search = '', int $perPage = 15, ?int $gradoId = null, ?int $nivelId = null): LengthAwarePaginator
    {
        return $this->repository->paginate($instiId, $search, $perPage, $gradoId, $nivelId);
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
        if (isset($data['logo']) && $data['logo'] instanceof UploadedFile) {
            $data['logo'] = $data['logo']->store('cursos/logos', 'public');
        }
        return $this->repository->create($data);
    }

    public function actualizar(int $id, array $data): Curso
    {
        $curso = $this->repository->findById($id);
        
        if (isset($data['logo']) && $data['logo'] instanceof UploadedFile) {
            if ($curso->logo) {
                Storage::disk('public')->delete($curso->logo);
            }
            $data['logo'] = $data['logo']->store('cursos/logos', 'public');
        } else {
            // No se subió archivo nuevo, mantener el que está (o quitarlo del array de update)
            unset($data['logo']);
        }
        
        return $this->repository->update($curso, $data);
    }

    public function eliminar(int $id): void
    {
        $curso = $this->repository->findById($id);
        $this->repository->delete($curso);
    }
}
