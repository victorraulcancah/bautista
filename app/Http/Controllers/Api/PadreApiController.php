<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use App\Models\PadreApoderado;
use App\Models\NotaActividad;
use App\Models\Pago;
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

        // Mock Attendance for now
        $asistencia = [
            'asistencias' => 45,
            'tardanzas' => 2,
            'faltas' => 1,
            'porcentaje' => 93
        ];

        return response()->json([
            'hijo' => $hijo,
            'notas' => $notas,
            'pagos' => $pagos,
            'asistencia' => $asistencia
        ]);
    }
}
