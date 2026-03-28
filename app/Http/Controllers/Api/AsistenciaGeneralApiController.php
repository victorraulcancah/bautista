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
        $mes = $request->query('mes', date('m'));
        $anio = $request->query('anio', date('Y'));

        $logs = Asistencia::where('id_persona', $id)
            ->where('tipo', $tipo)
            ->whereMonth('fecha', $mes)
            ->whereYear('fecha', $anio)
            ->orderBy('fecha', 'desc')
            ->get();

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

        // Determine if student or teacher
        $tipo = 'E';
        $persona = Estudiante::where('user_id', $user->id)->first();
        
        if (!$persona) {
            $tipo = 'D';
            $persona = Docente::where('id_usuario', $user->id)->first();
            $id_persona = $persona?->docente_id;
        } else {
            $id_persona = $persona->estu_id;
        }

        if (!$persona) {
            return response()->json(['message' => 'No se encontró registro académico para este usuario.'], 404);
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
                } else {
                    $user = Docente::with('perfil')->find($log->id_persona)?->perfil;
                }
                $log->usuario_nombre = $user ? "{$user->primer_nombre} {$user->apellido_paterno}" : '—';
                return $log;
            });

        return response()->json($logs);
    }

    /**
     * Export attendance history to CSV.
     */
    public function export(Request $request, $id)
    {
        $tipo = $request->query('tipo', 'E');
        $mes = $request->query('mes', date('m'));
        $anio = $request->query('anio', date('Y'));

        $logs = Asistencia::where('id_persona', $id)
            ->where('tipo', $tipo)
            ->whereMonth('fecha', $mes)
            ->whereYear('fecha', $anio)
            ->orderBy('fecha', 'asc')
            ->get();

        $filename = "Asistencia_" . ($tipo === 'E' ? 'Estudiante' : 'Docente') . "_{$id}_{$mes}_{$anio}.csv";
        
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Fecha', 'Turno', 'Entrada', 'Salida', 'Estado'];

        $callback = function() use($logs, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->fecha->toDateString(),
                    $log->turno_label,
                    $log->hora_entrada,
                    $log->hora_salida,
                    $log->estado_label
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
