<?php

namespace App\Services\Interfaces;

use App\Models\Matricula;
use App\Models\MatriculaApertura;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface MatriculaServiceInterface
{
    // Aperturas
    public function listarAperturas(int $instiId, string $search = '', int $perPage = 15): LengthAwarePaginator;
    public function obtenerApertura(int $id): MatriculaApertura;
    public function crearApertura(array $data): MatriculaApertura;
    public function actualizarApertura(int $id, array $data): MatriculaApertura;
    public function eliminarApertura(int $id): void;

    // Matrículas
    public function listarMatriculas(int $aperturaId, string $search = '', int $perPage = 15, ?int $nivelId = null): LengthAwarePaginator;
    public function contarPorNivel(int $aperturaId): \Illuminate\Support\Collection;
    public function matricular(array $data): Matricula;
    public function anularMatricula(int $id): void;

    // Helpers
    public function estudiantesDisponibles(int $instiId, int $aperturaId): Collection;
}
