<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActividadCurso;
use App\Models\AlternativaPregunta;
use App\Models\Cuestionario;
use App\Models\Estudiante;
use App\Models\ExamenIniciado;
use App\Models\NotaActividad;
use App\Models\PreguntaCuestionario;
use App\Models\PreguntaRespuesta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ExamenResolucionApiController extends Controller
{
    /**
     * Start or resume an exam session.
     */
    public function comenzar(Request $request)
    {
        $request->validate([
            'actividad_id' => 'required|integer',
        ]);

        $userId = auth()->id();
        $estudiante = Estudiante::where('user_id', $userId)->firstOrFail();
        $estuId = $estudiante->estu_id;

        $actividad = ActividadCurso::findOrFail($request->actividad_id);
        $cuestionario = Cuestionario::where('id_actividad', $actividad->actividad_id)->firstOrFail();

        // Check if there's an active session
        $intento = ExamenIniciado::where('estu_id', $estuId)
            ->where('actividad_id', $request->actividad_id)
            ->where('estado', '1')
            ->first();

        if (!$intento) {
            // Check if already finished
            $finalizado = ExamenIniciado::where('estu_id', $estuId)
                ->where('actividad_id', $request->actividad_id)
                ->where('estado', '0')
                ->first();

            if ($finalizado) {
                return response()->json(['message' => 'Ya has finalizado este examen.', 'finalizado' => true], 403);
            }

            // Create new session
            $duracionMinutos = $cuestionario->duracion ?? 60;
            $intento = ExamenIniciado::create([
                'estu_id' => $estuId,
                'actividad_id' => $request->actividad_id,
                'fecha_inicio' => now(),
                'fecha_limite' => now()->addMinutes($duracionMinutos),
                'estado' => '1',
            ]);
        }

        // Return the quiz structure with current answers if any
        $preguntas = PreguntaCuestionario::where('id_cuestionario', $cuestionario->cuestionario_id)
            ->with(['alternativas' => function($q) {
                $q->select('alternativa_id', 'id_pregunta', 'contenido');
            }])
            ->get()
            ->map(function ($p) use ($intento) {
                $resp = PreguntaRespuesta::where('intento_id', $intento->intento_id)
                    ->where('pregunta_id', $p->pregunta_id)
                    ->first();
                
                return [
                    'pregunta_id' => $p->pregunta_id,
                    'cabecera'    => $p->cabecera,
                    'cuerpo'      => $p->cuerpo,
                    'tipo'        => $p->tipo_respuesta,
                    'valor'       => $p->valor_nota,
                    'alternativas' => $p->alternativas,
                    'respuesta_estudiante' => [
                        'alternativa_id' => $resp?->alternativa_id,
                        'texto'          => $resp?->respuesta_texto,
                    ]
                ];
            });

        return response()->json([
            'intento_id'   => $intento->intento_id,
            'fecha_limite' => $intento->fecha_limite,
            'preguntas'    => $preguntas,
        ]);
    }

    /**
     * Save a single answer during the exam.
     */
    public function responder(Request $request, int $intentoId)
    {
        $request->validate([
            'pregunta_id'    => 'required|integer',
            'alternativa_id' => 'nullable|integer',
            'texto'          => 'nullable|string',
        ]);

        $intento = ExamenIniciado::findOrFail($intentoId);
        if ($intento->estado == '0' || now()->greaterThan($intento->fecha_limite)) {
            return response()->json(['message' => 'El tiempo ha expirado o el examen ya fue cerrado.'], 403);
        }

        PreguntaRespuesta::updateOrCreate(
            ['intento_id' => $intentoId, 'pregunta_id' => $request->pregunta_id],
            [
                'alternativa_id' => $request->alternativa_id,
                'respuesta_texto' => $request->texto,
            ]
        );

        return response()->json(['message' => 'Respuesta guardada.']);
    }

    /**
     * Finalize the exam and calculate score.
     */
    public function finalizar(Request $request, int $intentoId)
    {
        $intento = ExamenIniciado::findOrFail($intentoId);
        if ($intento->estado == '0') {
            return response()->json(['message' => 'El examen ya está finalizado.']);
        }

        DB::beginTransaction();
        try {
            $respuestas = PreguntaRespuesta::where('intento_id', $intentoId)->get();
            $puntajeTotal = 0;

            foreach ($respuestas as $resp) {
                $pregunta = PreguntaCuestionario::find($resp->pregunta_id);
                if (!$pregunta) continue;

                // Simple auto-grading for multiple choice
                if ($resp->alternativa_id) {
                    $alternativa = AlternativaPregunta::find($resp->alternativa_id);
                    if ($alternativa && $alternativa->estado_res == '1') {
                        $resp->es_correcta = true;
                        $resp->puntaje = (float) $pregunta->valor_nota;
                    } else {
                        $resp->es_correcta = false;
                        $resp->puntaje = 0;
                    }
                } else {
                    // Open ended or unhandled
                    $resp->es_correcta = false;
                    $resp->puntaje = 0;
                }
                $resp->save();
                $puntajeTotal += $resp->puntaje;
            }

            $intento->update([
                'estado' => '0',
                'fecha_fin' => now(),
                'puntaje_total' => $puntajeTotal,
            ]);

            // Synchronize with massive grades table
            NotaActividad::updateOrCreate(
                ['estu_id' => $intento->estu_id, 'actividad_id' => $intento->actividad_id],
                [
                    'nota' => (string) $puntajeTotal,
                    'observacion' => 'Calificado automáticamente por examen virtual.',
                ]
            );

            DB::commit();
            return response()->json([
                'message' => 'Examen finalizado.',
                'puntaje' => $puntajeTotal
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al finalizar: ' . $e->getMessage()], 500);
        }
    }
}
