<?php

namespace App\Repositories\Interfaces;

use App\Models\Clase;
use App\Models\Unidad;
use Illuminate\Database\Eloquent\Collection;

interface CursoContenidoRepositoryInterface
{
    // Unidades
    public function getUnidadesByCurso(int $cursoId): Collection;
    public function findUnidad(int $id): Unidad;
    public function createUnidad(array $data): Unidad;
    public function updateUnidad(Unidad $unidad, array $data): Unidad;
    public function deleteUnidad(Unidad $unidad): void;
    public function reordenarUnidades(int $cursoId, array $orden): void;

    // Clases
    public function findClase(int $id): Clase;
    public function createClase(array $data): Clase;
    public function updateClase(Clase $clase, array $data): Clase;
    public function deleteClase(Clase $clase): void;
    public function reordenarClases(int $unidadId, array $orden): void;
}
