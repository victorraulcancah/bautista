<?php

namespace App\Services\Interfaces;

interface DocenteAsistenciaServiceInterface
{
    public function obtenerMatrizAsistencia(int $docenteCursoId, ?string $desde = null, ?string $hasta = null): array;
    public function obtenerMatrizEditable(int $docenteCursoId, string $mes): array;
    public function guardarAsistenciaPorFecha(int $docenteCursoId, string $fecha, array $asistencias): void;
    public function iniciarSesionAsistencia(array $data): object;
    public function marcarAsistencia(int $sessionId, array $asistencias): void;
}
