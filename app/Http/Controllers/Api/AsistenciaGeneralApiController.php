<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\Estudiante;
use App\Models\Docente;
use App\Models\User;
use App\Services\Interfaces\AsistenciaServiceInterface;
use App\Repositories\Interfaces\AsistenciaRepositoryInterface;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AsistenciaGeneralApiController extends Controller
{
    public function __construct(
        private readonly AsistenciaServiceInterface $service,
        private readonly AsistenciaRepositoryInterface $repository
    ) {}

    /**
     * Get list of users (Students or Teachers) for attendance management.
     */
    public function index(Request $request)
    {
        $tipo = $request->query('tipo', 'E');
        $search = $request->query('search', '');
        
        return response()->json($this->repository->getPaginatedUsers($tipo, $search));
    }

    /**
     * Get detailed attendance history for a specific user.
     */
    public function show(Request $request, $id)
    {
        $tipo = $request->query('tipo', 'E');
        $fechaInicio = $request->query('fecha_inicio');
        $fechaFin = $request->query('fecha_fin');

        if ($fechaInicio && $fechaFin) {
            $logs = $this->repository->getPorPersonaRango((int)$id, $tipo, $fechaInicio, $fechaFin);
        } else {
            $mes = $request->query('mes', date('m'));
            $anio = $request->query('anio', date('Y'));
            $logs = $this->repository->getPorPersonaMes(1, (int)$id, $tipo, (int)$anio, (int)$mes);
        }

        return response()->json($logs);
    }

    /**
     * Mark attendance via QR.
     */
    public function marcarQR(Request $request)
    {
        $validated = $request->validate([
            'qr_data' => 'required|string',
            'tipo_marcado' => 'required|in:entrada,salida',
        ]);

        try {
            $result = $this->service->marcarPorQR($validated['qr_data'], $validated['tipo_marcado']);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    /**
     * Get recent logs for general display.
     */
    public function historial(Request $request)
    {
        return response()->json($this->service->getHistorialConNombres());
    }

    /**
     * Export attendance history to Excel.
     */
    public function export(Request $request, $id)
    {
        $tipo = $request->query('tipo', 'E');
        $data = $this->service->exportarExcelPersona((int)$id, $tipo, $request->all());

        $logs = $data['logs'];
        $nombre = $data['nombre'];
        $periodoLabel = $data['label'];

        // Excel creation logic remains in controller (Boundary between logic and response)
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->mergeCells('A1:D1');
        $sheet->setCellValue('A1', "Historial de Asistencia - {$nombre} - {$periodoLabel}");
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(12);

        $sheet->setCellValue('A2', 'Fecha')->setCellValue('B2', 'Turno')->setCellValue('C2', 'Entrada')->setCellValue('D2', 'Salida');
        $sheet->getStyle('A2:D2')->getFont()->setBold(true);

        $fila = 3;
        foreach ($logs as $log) {
            $sheet->setCellValue('A' . $fila, $log->fecha->format('d/m/Y'));
            $sheet->setCellValue('B' . $fila, $log->turno === 'M' ? 'Mañana' : 'Tarde');
            $sheet->setCellValue('C' . $fila, $log->hora_entrada ? substr($log->hora_entrada, 0, 5) : '—');
            $sheet->setCellValue('D' . $fila, $log->hora_salida ? substr($log->hora_salida, 0, 5) : '—');
            $fila++;
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $filename = "Asistencia_{$nombre}_" . date('Ymd_His') . ".xlsx";
        $tempFile = tempnam(sys_get_temp_dir(), 'excel');
        $writer->save($tempFile);

        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }
}
