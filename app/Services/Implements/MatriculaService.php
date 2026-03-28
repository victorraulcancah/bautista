<?php

namespace App\Services\Implements;

use App\Models\Matricula;
use App\Models\MatriculaApertura;
use App\Repositories\Interfaces\MatriculaRepositoryInterface;
use App\Services\Interfaces\MatriculaServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class MatriculaService implements MatriculaServiceInterface
{
    public function __construct(
        private readonly MatriculaRepositoryInterface $repository,
    ) {}

    public function listarAperturas(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginateAperturas($instiId, $search, $perPage);
    }

    public function obtenerApertura(int $id): MatriculaApertura
    {
        return $this->repository->findAperturaById($id);
    }

    public function crearApertura(array $data): MatriculaApertura
    {
        return $this->repository->createApertura($data);
    }

    public function actualizarApertura(int $id, array $data): MatriculaApertura
    {
        $apertura = $this->repository->findAperturaById($id);
        return $this->repository->updateApertura($apertura, $data);
    }

    public function eliminarApertura(int $id): void
    {
        $apertura = $this->repository->findAperturaById($id);
        $this->repository->deleteApertura($apertura);
    }

    public function listarMatriculas(int $aperturaId, string $search = '', int $perPage = 15, ?int $nivelId = null): LengthAwarePaginator
    {
        return $this->repository->paginateMatriculas($aperturaId, $search, $perPage, $nivelId);
    }

    public function contarPorNivel(int $aperturaId): \Illuminate\Support\Collection
    {
        return $this->repository->countByNivel($aperturaId);
    }

    public function matricular(array $data): Matricula
    {
        return $this->repository->createMatricula($data);
    }

    public function anularMatricula(int $id): void
    {
        $matricula = $this->repository->findMatriculaById($id);
        $this->repository->deleteMatricula($matricula);
    }

    public function estudiantesDisponibles(int $instiId, int $aperturaId): Collection
    {
        return $this->repository->estudiantesNoMatriculados($instiId, $aperturaId);
    }
}
