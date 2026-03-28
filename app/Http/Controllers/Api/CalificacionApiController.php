<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActividadCurso;
use App\Models\Matricula;
use App\Models\NotaActividad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CalificacionApiController extends Controller
{
    /**
     * Get students and their grades for a specific activity.
     */
    public function indexByActivity(Request $request, int $actividadId)
    {
        $actividad = ActividadCurso::findOrFail($actividadId);
        
        // Find the section_id from request or default to first findable from DocenteCurso
        $seccionId = $request->get('seccion_id');
        $aperturaId = $request->get('apertura_id');

        if (!$seccionId || !$aperturaId) {
            return response()->json([
                'message' => 'Se requiere seccion_id y apertura_id para filtrar alumnos.',
            ], 422);
        }

        $estudiantes = Matricula::where('seccion_id', $seccionId)
            ->where('apertura_id', $aperturaId)
            ->with(['estudiante.perfil'])
            ->get()
            ->map(function ($m) use ($actividadId) {
                $e = $m->estudiante;
                $nota = NotaActividad::where('estu_id', $e->estu_id)
                    ->where('actividad_id', $actividadId)
                    ->first();

                return [
                    'estu_id'           => $e->estu_id,
                    'nombre_completo'   => ($e->perfil?->apellido_paterno ?? '') . ' ' . 
                                           ($e->perfil?->apellido_materno ?? '') . ', ' . 
                                           ($e->perfil?->primer_nombre ?? ''),
                    'nota'              => $nota?->nota ?? '',
                    'observacion'       => $nota?->observacion ?? '',
                ];
            });

        return response()->json([
            'actividad'     => $actividad->nombre_actividad,
            'estudiantes'   => $estudiantes,
        ]);
    }

    /**
     * Batch save/update grades for an activity.
     */
    public function calificar(Request $request, int $actividadId)
    {
        $request->validate([
            'notas'             => 'required|array',
            'notas.*.estu_id'   => 'required|integer',
            'notas.*.nota'      => 'nullable|string|max:5',
            'notas.*.obs'       => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->notas as $item) {
                if (empty($item['nota']) && empty($item['obs'])) {
                    // Optionally delete? No, usually keep or ignore
                    continue;
                }

                NotaActividad::updateOrCreate(
                    [
                        'estu_id'       => $item['estu_id'],
                        'actividad_id'  => $actividadId,
                    ],
                    [
                        'nota'          => $item['nota'],
                        'observacion'   => $item['obs'] ?? null,
                        'fecha_calificacion' => now(),
                    ]
                );
            }
            DB::commit();
            return response()->json(['message' => 'Calificaciones guardadas correctamente.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al guardar calificaciones: ' . $e->getMessage()], 500);
        }
    }
}
