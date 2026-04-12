<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\Estudiante;
use App\Models\Docente;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AsistenciaGeneralApiController extends Controller
{
    /**
     * Get list of users (Students or Teachers) for attendance management.
     */
    public function index(Request $request)
    {
        $tipo = $request->query('tipo', 'E'); // E=estudiante, D=docente
        $search = $request->query('search');

        if ($tipo === 'E') {
            $query = Estudiante::with('perfil');
        } else {
            $query = Docente::with('perfil');
        }

        if ($search) {
            $query->whereHas('perfil', function ($q) use ($search) {
                $q->where('primer_nombre', 'like', "%{$search}%")
                  ->orWhere('apellido_paterno', 'like', "%{$search}%")
                  ->orWhere('doc_numero', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    /**
     * Get detailed attendance history for a specific user in a month.
     */
    public function show(Request $request, $id)
    {
        $tipo = $request->query('tipo', 'E');
        $mes = $request->query('mes');
        $anio = $request->query('anio', date('Y'));
        $fechaInicio = $request->query('fecha_inicio');
        $fechaFin = $request->query('fecha_fin');

        $query = Asistencia::where('id_persona', $id)->where('tipo', $tipo);

        // Filtrar por mes/año o por rango de fechas
        if ($fechaInicio && $fechaFin) {
            $query->whereBetween('fecha', [$fechaInicio, $fechaFin]);
        } else {
            $mes = $mes ?? date('m');
            $query->whereMonth('fecha', $mes)->whereYear('fecha', $anio);
        }

        $logs = $query->orderBy('fecha', 'desc')->get();

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

        // QR data expected to be user_id for now
        $userId = $validated['qr_data'];
        $user = User::with(['perfil'])->find($userId);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        // Determine if student or teacher or personal staff
        $tipo = 'E';
        $persona = Estudiante::where('user_id', $user->id)->first();
        
        if (!$persona) {
            $tipo = 'D';
            $persona = Docente::where('id_usuario', $user->id)->first();
            $id_persona = $persona?->docente_id;
        } else {
            $id_persona = $persona->estu_id;
        }

        // If still not found, treat as Personal Staff ('P')
        if (!$persona) {
            $tipo = 'P';
            $id_persona = $user->id;
        }

        $fecha = now()->toDateString();
        $hora = now()->toTimeString();

        // Check if record exists for today/turno
        // Simple logic: Morning shift if before 1 PM
        $turno = now()->hour < 13 ? 'M' : 'T';

        $asistencia = Asistencia::updateOrCreate(
            [
                'insti_id' => $user->insti_id ?? 1,
                'id_persona' => $id_persona,
                'tipo' => $tipo,
                'fecha' => $fecha,
                'turno' => $turno,
            ],
            [
                'estado' => '1',
                $validated['tipo_marcado'] === 'entrada' ? 'hora_entrada' : 'hora_salida' => $hora,
            ]
        );

        return response()->json([
            'message' => ($validated['tipo_marcado'] === 'entrada' ? 'Entrada' : 'Salida') . ' registrada correctamente',
            'user' => $user->perfil,
            'hora' => $hora,
            'turno' => $asistencia->turno_label,
        ]);
    }

    /**
     * Get recent logs for general display.
     */
    public function historial(Request $request)
    {
        // For Students, we might want to join differently
        $logs = Asistencia::orderBy('asistencia_id', 'desc')
            ->limit(20)
            ->get()
            ->map(function($log) {
                $user = null;
                if ($log->tipo === 'E') {
                    $user = Estudiante::with('perfil')->find($log->id_persona)?->perfil;
                } elseif ($log->tipo === 'D') {
                    $user = Docente::with('perfil')->find($log->id_persona)?->perfil;
                } else {
                    // Tipo P (Personal/Staff)
                    $user = User::with('perfil')->find($log->id_persona)?->perfil;
                }
                $log->usuario_nombre = $user ? "{$user->primer_nombre} {$user->apellido_paterno}" : '—';
                return $log;
            });

        return response()->json($logs);
    }

    /**
     * Export attendance history to Excel.
     */
    public function export(Request $request, $id)
    {
        $tipo = $request->query('tipo', 'E');
        $mes = $request->query('mes');
        $anio = $request->query('anio', date('Y'));
        $fechaInicio = $request->query('fecha_inicio');
        $fechaFin = $request->query('fecha_fin');

        // Construir query base
        $query = Asistencia::where('id_persona', $id)->where('tipo', $tipo);

        // Filtrar por mes/año o por rango de fechas
        if ($fechaInicio && $fechaFin) {
            $query->whereBetween('fecha', [$fechaInicio, $fechaFin]);
            $periodoLabel = date('d/m/Y', strtotime($fechaInicio)) . ' - ' . date('d/m/Y', strtotime($fechaFin));
        } else {
            $mes = $mes ?? date('m');
            $query->whereMonth('fecha', $mes)->whereYear('fecha', $anio);
            $periodoLabel = "Mes {$mes}/{$anio}";
        }

        $logs = $query->orderBy('fecha', 'asc')->get();

        // Obtener nombre del usuario
        if ($tipo === 'E') {
            $persona = Estudiante::with('perfil')->find($id);
            $nombre = $persona ? "{$persona->perfil->primer_nombre} {$persona->perfil->apellido_paterno}" : 'Usuario';
        } else {
            $persona = Docente::with('perfil')->find($id);
            $nombre = $persona ? "{$persona->perfil->primer_nombre} {$persona->perfil->apellido_paterno}" : 'Usuario';
        }

        // Crear Excel
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Título
        $sheet->mergeCells('A1:D1');
        $sheet->setCellValue('A1', "Historial de Asistencia - {$nombre} - {$periodoLabel}");
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        // Cabeceras
        $sheet->setCellValue('A2', 'Fecha');
        $sheet->setCellValue('B2', 'Turno');
        $sheet->setCellValue('C2', 'Hora de entrada');
        $sheet->setCellValue('D2', 'Hora de salida');
        
        $sheet->getStyle('A2:D2')->getFont()->setBold(true);
        $sheet->getStyle('A2:D2')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FFE0E0E0');

        // Datos
        $fila = 3;
        foreach ($logs as $log) {
            $sheet->setCellValue('A' . $fila, $log->fecha->format('d/m/Y'));
            $sheet->setCellValue('B' . $fila, $log->turno === 'M' ? 'Mañana' : 'Tarde');
            $sheet->setCellValue('C' . $fila, $log->hora_entrada ? substr($log->hora_entrada, 0, 5) : '—');
            $sheet->setCellValue('D' . $fila, $log->hora_salida ? substr($log->hora_salida, 0, 5) : '—');
            $fila++;
        }

        // Ajustar ancho de columnas
        foreach (range('A', 'D') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Generar archivo
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $filename = "Asistencia_{$nombre}_" . ($fechaInicio ? "{$fechaInicio}_{$fechaFin}" : "{$mes}_{$anio}") . ".xlsx";
        
        // Guardar temporalmente
        $tempFile = tempnam(sys_get_temp_dir(), 'excel');
        $writer->save($tempFile);

        // Descargar
        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }

    /**
     * Export all users attendance to Excel.
     */
    public function exportAll(Request $request)
    {
        $tipo = $request->query('tipo', 'E');
        $mes = $request->query('mes');
        $anio = $request->query('anio', date('Y'));
        $fechaInicio = $request->query('fecha_inicio');
        $fechaFin = $request->query('fecha_fin');

        // Construir query base
        $query = Asistencia::where('tipo', $tipo);

        // Filtrar por mes/año o por rango de fechas
        if ($fechaInicio && $fechaFin) {
            $query->whereBetween('fecha', [$fechaInicio, $fechaFin]);
            $periodoLabel = date('d/m/Y', strtotime($fechaInicio)) . ' - ' . date('d/m/Y', strtotime($fechaFin));
        } else {
            $mes = $mes ?? date('m');
            $query->whereMonth('fecha', $mes)->whereYear('fecha', $anio);
            $periodoLabel = "Mes {$mes}/{$anio}";
        }

        $logs = $query->orderBy('fecha', 'asc')->get();

        // Agrupar por persona
        $agrupado = [];
        foreach ($logs as $log) {
            if ($tipo === 'E') {
                $persona = Estudiante::with('perfil')->find($log->id_persona);
            } else {
                $persona = Docente::with('perfil')->find($log->id_persona);
            }

            if ($persona && $persona->perfil) {
                $nombre = "{$persona->perfil->apellido_paterno} {$persona->perfil->apellido_materno}, {$persona->perfil->primer_nombre}";
                $agrupado[$nombre][] = $log;
            }
        }

        // Crear Excel
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Título
        $tipoLabel = $tipo === 'E' ? 'Estudiantes' : 'Docentes';
        $sheet->mergeCells('A1:E1');
        $sheet->setCellValue('A1', "Reporte de Asistencia - {$tipoLabel} - {$periodoLabel}");
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        // Cabeceras
        $sheet->setCellValue('A2', 'Nombre');
        $sheet->setCellValue('B2', 'Fecha');
        $sheet->setCellValue('C2', 'Turno');
        $sheet->setCellValue('D2', 'Hora de entrada');
        $sheet->setCellValue('E2', 'Hora de salida');
        
        $sheet->getStyle('A2:E2')->getFont()->setBold(true);
        $sheet->getStyle('A2:E2')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('FF00A65A');
        $sheet->getStyle('A2:E2')->getFont()->getColor()->setARGB('FFFFFFFF');

        // Datos
        $fila = 3;
        foreach ($agrupado as $nombre => $registros) {
            foreach ($registros as $log) {
                $sheet->setCellValue('A' . $fila, $nombre);
                $sheet->setCellValue('B' . $fila, $log->fecha->format('d/m/Y'));
                $sheet->setCellValue('C' . $fila, $log->turno === 'M' ? 'Mañana' : 'Tarde');
                $sheet->setCellValue('D' . $fila, $log->hora_entrada ? substr($log->hora_entrada, 0, 5) : '—');
                $sheet->setCellValue('E' . $fila, $log->hora_salida ? substr($log->hora_salida, 0, 5) : '—');
                $fila++;
            }
        }

        // Ajustar ancho de columnas
        foreach (range('A', 'E') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Generar archivo
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $filename = "Reporte_Asistencia_{$tipoLabel}_" . ($fechaInicio ? "{$fechaInicio}_{$fechaFin}" : "{$mes}_{$anio}") . ".xlsx";
        
        // Guardar temporalmente
        $tempFile = tempnam(sys_get_temp_dir(), 'excel');
        $writer->save($tempFile);

        // Descargar
        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }
}
