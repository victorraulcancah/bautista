<?php

namespace App\Services\Interfaces;

interface DocenteAlumnoServiceInterface
{
    public function obtenerTodosAlumnos(int $usuarioId): array;
    public function obtenerAlumnosSeccion(int $docenteCursoId): array;
    public function obtenerAlumnosConMetricas(int $docenteCursoId): array;
}
