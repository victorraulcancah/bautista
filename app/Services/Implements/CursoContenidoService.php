<?php

namespace App\Services\Implements;

use App\Models\Clase;
use App\Models\Unidad;
use App\Repositories\Interfaces\CursoContenidoRepositoryInterface;
use App\Services\Interfaces\CursoContenidoServiceInterface;
use Illuminate\Database\Eloquent\Collection;

class CursoContenidoService implements CursoContenidoServiceInterface
{
    public function __construct(
        private readonly CursoContenidoRepositoryInterface $repository,
    ) {}

    public function obtenerContenido(int $cursoId): Collection
    {
        return $this->repository->getUnidadesByCurso($cursoId);
    }

    public function crearUnidad(array $data): Unidad
    {
        return $this->repository->createUnidad($data);
    }

    public function actualizarUnidad(int $id, array $data): Unidad
    {
        $unidad = $this->repository->findUnidad($id);
        return $this->repository->updateUnidad($unidad, $data);
    }

    public function eliminarUnidad(int $id): void
    {
        $unidad = $this->repository->findUnidad($id);
        $this->repository->deleteUnidad($unidad);
    }

    public function reordenarUnidades(int $cursoId, array $orden): void
    {
        $this->repository->reordenarUnidades($cursoId, $orden);
    }

    public function crearClase(array $data): Clase
    {
        return $this->repository->createClase($data);
    }

    public function actualizarClase(int $id, array $data): Clase
    {
        $clase = $this->repository->findClase($id);
        return $this->repository->updateClase($clase, $data);
    }

    public function eliminarClase(int $id): void
    {
        $clase = $this->repository->findClase($id);
        $this->repository->deleteClase($clase);
    }

    public function reordenarClases(int $unidadId, array $orden): void
    {
        $this->repository->reordenarClases($unidadId, $orden);
    }
}
