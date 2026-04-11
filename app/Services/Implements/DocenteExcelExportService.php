<?php

namespace App\Services\Implements;

use App\Models\DocenteCurso;
use App\Services\Interfaces\DocenteExcelExportServiceInterface;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class DocenteExcelExportService implements DocenteExcelExportServiceInterface
{
    public function exportarAsistencia(int $docenteCursoId, array $matrixData): string
    {
        $dc = DocenteCurso::with(['curso', 'seccion.grado'])->findOrFail($docenteCursoId);
        
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Asistencia');

        $sheet->setCellValue('A1', 'CURSO:');
        $sheet->setCellValue('B1', $dc->curso->nombre);
        $sheet->setCellValue('A2', 'GRADO:');
        $sheet->setCellValue('B2', $dc->seccion->grado->nombre_grado . ' - ' . $dc->seccion->nombre);
        $sheet->getStyle('A1:A2')->getFont()->setBold(true);

        $sheet->setCellValue('A4', 'FECHA');
        $sheet->setCellValue('B4', 'ESTUDIANTE');
        $sheet->setCellValue('C4', 'ESTADO');
        $sheet->setCellValue('D4', 'OBSERVACIÓN');
        $sheet->getStyle('A4:D4')->getFont()->setBold(true);
        $sheet->getStyle('A4:D4')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFE0E0E0');

        $row = 5;
        foreach ($matrixData['records'] as $record) {
            foreach ($record['estudiantes'] as $estudiante) {
                $sheet->setCellValue('A' . $row, $record['fecha']);
                $sheet->setCellValue('B' . $row, $estudiante['nombre']);
                $sheet->setCellValue('C' . $row, $estudiante['estado']);
                $sheet->setCellValue('D' . $row, $estudiante['observacion'] ?? '');
                $row++;
            }
        }

        foreach (range('A', 'D') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $tempFile = tempnam(sys_get_temp_dir(), 'export');
        $writer->save($tempFile);

        return $tempFile;
    }

    public function exportarAlumnos(int $docenteCursoId, array $alumnosData): string
    {
        $dc = DocenteCurso::with(['curso', 'seccion.grado'])->findOrFail($docenteCursoId);
        
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Lista de Alumnos');

        $sheet->setCellValue('A1', 'CURSO:');
        $sheet->setCellValue('B1', $dc->curso->nombre);
        $sheet->setCellValue('A2', 'GRADO:');
        $sheet->setCellValue('B2', $dc->seccion->grado->nombre_grado . ' - ' . $dc->seccion->nombre);
        $sheet->getStyle('A1:A2')->getFont()->setBold(true);

        $sheet->setCellValue('A4', 'ID');
        $sheet->setCellValue('B4', 'ESTUDIANTE');
        $sheet->setCellValue('C4', 'PROMEDIO');
        $sheet->setCellValue('D4', 'ASISTENCIA %');
        $sheet->setCellValue('E4', 'PROGRESO %');
        $sheet->setCellValue('F4', 'ACTIVIDADES COMPLETADAS');
        $sheet->getStyle('A4:F4')->getFont()->setBold(true);
        $sheet->getStyle('A4:F4')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFE0E0E0');

        $row = 5;
        foreach ($alumnosData as $alumno) {
            $sheet->setCellValue('A' . $row, $alumno['estu_id']);
            $sheet->setCellValue('B' . $row, $alumno['nombre']);
            $sheet->setCellValue('C' . $row, $alumno['promedio']);
            $sheet->setCellValue('D' . $row, $alumno['asistencia']);
            $sheet->setCellValue('E' . $row, $alumno['progreso']);
            $sheet->setCellValue('F' . $row, $alumno['actividadesCompletadas'] . '/' . $alumno['actividadesTotales']);
            $row++;
        }

        foreach (range('A', 'F') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $tempFile = tempnam(sys_get_temp_dir(), 'export');
        $writer->save($tempFile);

        return $tempFile;
    }
}
