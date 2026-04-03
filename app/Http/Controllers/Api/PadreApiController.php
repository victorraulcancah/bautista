<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use App\Models\PadreApoderado;
use App\Models\NotaActividad;
use App\Models\Pago;
use App\Models\Asistencia;
use Illuminate\Http\Request;

class PadreApiController extends Controller
{
    /**
     * List children associated with the parent.
     */
    public function hijos(Request $request)
    {
        $userId = $request->user()->id;
        $padre = PadreApoderado::where('user_id', $userId)->first();

        if (!$padre) {
            return response()->json(['message' => 'No se encontró perfil de padre para este usuario.'], 404);
        }

        $hijos = $padre->estudiantes()->with('perfil')->get();

        return response()->json($hijos);
    }

    /**
     * Holistic view of a child's status.
     */
    public function hijoDetalle(Request $request, int $hijoId)
    {
        $userId = $request->user()->id;
        $padre = PadreApoderado::where('user_id', $userId)->first();
        
        // Security check
        $hijo = $padre->estudiantes()->where('estu_id', $hijoId)->with('perfil')->firstOrFail();

        // Recent Grades
        $notas = NotaActividad::where('estu_id', $hijoId)
            ->with(['actividad.clase.unidad.curso'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Payments
        $pagos = Pago::where('estudiante_id', $hijoId)
            ->orderBy('fecha_pago', 'desc')
            ->get();

        // Real Attendance
        $historialAsistencia = Asistencia::where('id_persona', $hijoId)
            ->where('tipo', 'estudiante')
            ->orderBy('fecha', 'desc')
            ->get();

        $asistencias = $historialAsistencia->where('estado', '1')->count();
        $tardanzas   = $historialAsistencia->where('estado', 'T')->count();
        $faltas      = $historialAsistencia->where('estado', '0')->count();
        $total       = $asistencias + $tardanzas + $faltas;
        $porcentaje  = $total > 0 ? round(($asistencias / $total) * 100) : 0;

        // Limiting history for frontend
        $historialLimitado = $historialAsistencia->take(30)->values()->map(function($a) {
            return [
                'id' => $a->asistencia_id,
                'fecha' => $a->fecha ? $a->fecha->format('Y-m-d') : null,
                'hora_entrada' => $a->hora_entrada,
                'hora_salida' => $a->hora_salida,
                'estado' => $a->estado,
                'estado_label' => $a->estado_label,
                'observacion' => $a->observacion,
            ];
        });

        $asistencia = [
            'asistencias' => $asistencias,
            'tardanzas'   => $tardanzas,
            'faltas'      => $faltas,
            'porcentaje'  => $porcentaje,
            'historial'   => $historialLimitado,
        ];

        return response()->json([
            'hijo' => $hijo,
            'notas' => $notas,
            'pagos' => $pagos,
            'asistencia' => $asistencia
        ]);
    }
}
