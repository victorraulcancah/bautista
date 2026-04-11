<?php

namespace App\Services\Interfaces;

interface DocenteExcelExportServiceInterface
{
    public function exportarAsistencia(int $docenteCursoId, array $matrixData): string;
    public function exportarAlumnos(int $docenteCursoId, array $alumnosData): string;
}
