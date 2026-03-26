<?php

namespace App\Services\Interfaces;

use App\Models\Clase;
use App\Models\Unidad;
use Illuminate\Database\Eloquent\Collection;

interface CursoContenidoServiceInterface
{
    // Unidades
    public function obtenerContenido(int $cursoId): Collection;
    public function crearUnidad(array $data): Unidad;
    public function actualizarUnidad(int $id, array $data): Unidad;
    public function eliminarUnidad(int $id): void;
    public function reordenarUnidades(int $cursoId, array $orden): void;

    // Clases
    public function crearClase(array $data): Clase;
    public function actualizarClase(int $id, array $data): Clase;
    public function eliminarClase(int $id): void;
    public function reordenarClases(int $unidadId, array $orden): void;
}
