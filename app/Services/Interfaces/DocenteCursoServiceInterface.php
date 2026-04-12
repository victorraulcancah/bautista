<?php

namespace App\Services\Interfaces;

interface DocenteCursoServiceInterface
{
    /**
     * Get dashboard data for a teacher.
     */
    public function obtenerDashboard(int $usuarioId): array;

    /**
     * Get all courses assigned to a teacher.
     */
    public function obtenerCursosDocente(int $usuarioId): array;

    /**
     * Get course content (units/classes) for a specific assignment.
     */
    public function obtenerContenidoCurso(int $docenteCursoId): array;

    /**
     * Update course settings.
     */
    public function actualizarConfiguracion(int $docenteCursoId, array $settings): array;

    /**
     * Upload course banner.
     */
    public function subirBanner(int $docenteCursoId, $file): array;
}
