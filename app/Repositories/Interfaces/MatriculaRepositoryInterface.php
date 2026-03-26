<?php

namespace App\Repositories\Interfaces;

use App\Models\Matricula;
use App\Models\MatriculaApertura;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface MatriculaRepositoryInterface
{
    // Aperturas
    public function paginateAperturas(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function findAperturaById(int $id): MatriculaApertura;
    public function createApertura(array $data): MatriculaApertura;
    public function updateApertura(MatriculaApertura $apertura, array $data): MatriculaApertura;
    public function deleteApertura(MatriculaApertura $apertura): void;

    // Matrículas
    public function paginateMatriculas(int $aperturaId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function findMatriculaById(int $id): Matricula;
    public function createMatricula(array $data): Matricula;
    public function deleteMatricula(Matricula $matricula): void;

    // Helpers
    public function estudiantesNoMatriculados(int $instiId, int $aperturaId): Collection;
}
