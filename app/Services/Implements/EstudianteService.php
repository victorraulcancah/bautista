<?php

namespace App\Services\Implements;

use App\Models\Estudiante;
use App\Repositories\Interfaces\EstudianteRepositoryInterface;
use App\Services\ActividadUsuarioService;
use App\Services\Interfaces\EstudianteServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class EstudianteService implements EstudianteServiceInterface
{
    public function __construct(
        private readonly EstudianteRepositoryInterface $repository,
        private readonly ActividadUsuarioService $auditoria,
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
        $estudiante = $this->repository->create($data);
        $this->auditoria->registrar('crear', 'Estudiante', $estudiante->estu_id,
            "Estudiante creado: {$estudiante->estu_apellido_pat} {$estudiante->estu_nombre1}");
        return $estudiante;
    }

    public function actualizar(int $id, array $data): Estudiante
    {
        $estudiante = $this->repository->findById($id);
        $updated = $this->repository->update($estudiante, $data);
        $this->auditoria->registrar('actualizar', 'Estudiante', $id,
            "Estudiante actualizado: {$updated->estu_apellido_pat} {$updated->estu_nombre1}");
        return $updated;
    }

    public function eliminar(int $id): void
    {
        $estudiante = $this->repository->findById($id);
        $this->auditoria->registrar('eliminar', 'Estudiante', $id,
            "Estudiante eliminado: {$estudiante->estu_apellido_pat} {$estudiante->estu_nombre1}");
        $this->repository->delete($estudiante);
    }
}
