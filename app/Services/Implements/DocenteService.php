<?php

namespace App\Services\Implements;

use App\Models\Docente;
use App\Repositories\Interfaces\DocenteRepositoryInterface;
use App\Services\ActividadUsuarioService;
use App\Services\Interfaces\DocenteServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class DocenteService implements DocenteServiceInterface
{
    public function __construct(
        private readonly DocenteRepositoryInterface $repository,
        private readonly ActividadUsuarioService $auditoria,
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
        $docente = $this->repository->create($data);
        $this->auditoria->registrar('crear', 'Docente', $docente->docente_id,
            "Docente creado: {$docente->doc_apellidos} {$docente->doc_nombres}");
        return $docente;
    }

    public function actualizar(int $id, array $data): Docente
    {
        $docente = $this->repository->findById($id);
        $updated = $this->repository->update($docente, $data);
        $this->auditoria->registrar('actualizar', 'Docente', $id,
            "Docente actualizado: {$updated->doc_apellidos} {$updated->doc_nombres}");
        return $updated;
    }

    public function eliminar(int $id): void
    {
        $docente = $this->repository->findById($id);
        $this->auditoria->registrar('eliminar', 'Docente', $id,
            "Docente eliminado: {$docente->doc_apellidos} {$docente->doc_nombres}");
        $this->repository->delete($docente);
    }
}
