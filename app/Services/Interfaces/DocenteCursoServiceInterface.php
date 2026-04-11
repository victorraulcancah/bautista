<?php

namespace App\Services\Interfaces;

use Illuminate\Http\Request;

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
     * Get announcements for a course.
     */
    public function obtenerAnuncios(int $docenteCursoId): array;

    /**
     * Create an announcement.
     */
    public function crearAnuncio(array $data): object;

    /**
     * Update an announcement.
     */
    public function actualizarAnuncio(int $anuncioId, array $data): object;

    /**
     * Delete an announcement.
     */
    public function eliminarAnuncio(int $anuncioId): void;

    /**
     * Get all students for a teacher across all sections.
     */
    public function obtenerTodosAlumnos(int $usuarioId): array;

    /**
     * Get students for a specific section.
     */
    public function obtenerAlumnosSeccion(int $docenteCursoId): array;

    /**
     * Get students with detailed metrics.
     */
    public function obtenerAlumnosConMetricas(int $docenteCursoId): array;

    /**
     * Get attendance matrix for a course.
     */
    public function obtenerMatrizAsistencia(int $docenteCursoId, ?string $desde = null, ?string $hasta = null): array;

    /**
     * Export attendance to Excel.
     */
    public function exportarAsistencia(int $docenteCursoId, ?string $desde = null, ?string $hasta = null): string;

    /**
     * Export students list to Excel.
     */
    public function exportarAlumnos(int $docenteCursoId): string;

    /**
     * Update course settings.
     */
    public function actualizarConfiguracion(int $docenteCursoId, array $settings): array;

    /**
     * Start an attendance session.
     */
    public function iniciarSesionAsistencia(array $data): object;

    /**
     * Mark attendance for students.
     */
    public function marcarAsistencia(int $sessionId, array $asistencias): void;
}
