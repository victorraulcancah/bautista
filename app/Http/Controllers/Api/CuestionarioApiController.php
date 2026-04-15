<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActividadCurso;
use App\Models\AlternativaPregunta;
use App\Models\Cuestionario;
use App\Models\PreguntaCuestionario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CuestionarioApiController extends Controller
{
    /**
     * Devuelve el cuestionario completo con preguntas y alternativas.
     */
    public function show(int $actividadId): JsonResponse
    {
        $cuestionario = Cuestionario::where('id_actividad', $actividadId)
            ->with(['preguntas.alternativas'])
            ->first();

        // Si no existe, se devuelve un esqueleto vacío
        if (!$cuestionario) {
            return response()->json([
                'cuestionario_id' => null,
                'id_actividad' => $actividadId,
                'duracion' => 60,
                'nota_visible' => '0',
                'mostrar_respuesta' => '0',
                'preguntas' => []
            ]);
        }

        return response()->json($cuestionario);
    }

    /**
     * Sincroniza el árbol del cuestionario entero.
     */
    public function sync(Request $request, int $actividadId): JsonResponse
    {
        // Validación básica
        $validated = $request->validate([
            'duracion' => 'nullable|numeric|min:0',
            'nota_visible' => 'required|in:1,0',
            'mostrar_respuesta' => 'required|in:1,0',
            'preguntas' => 'array',
            'preguntas.*.pregunta_id' => 'nullable',
            'preguntas.*.cabecera' => 'required|string',
            'preguntas.*.valor_nota' => 'required|numeric|min:0',
            'preguntas.*.recurso_imagen' => 'nullable|string',
            'preguntas.*.alternativas' => 'required|array|min:2',
            'preguntas.*.alternativas.*.alternativa_id' => 'nullable',
            'preguntas.*.alternativas.*.contenido' => 'required|string',
            'preguntas.*.alternativas.*.estado_res' => 'required|in:1,0',
        ]);

        try {
            DB::beginTransaction();

            $cuestionario = Cuestionario::updateOrCreate(
                ['id_actividad' => $actividadId],
                [
                    'duracion' => $validated['duracion'] ?? null,
                    'nota_visible' => $validated['nota_visible'],
                    'mostrar_respuesta' => $validated['mostrar_respuesta'],
                    'estado' => '1',
                ]
            );
            
            // Recoger los IDs de preguntas que vinieron del frontend
            $incomingPreguntaIds = collect($validated['preguntas'])->pluck('pregunta_id')->filter(fn($id) => is_numeric($id) && $id > 0)->toArray();
            
            // Borrar las preguntas que el profe quitó
            PreguntaCuestionario::where('id_cuestionario', $cuestionario->cuestionario_id)
                ->whereNotIn('pregunta_id', $incomingPreguntaIds)
                ->delete();

            foreach ($validated['preguntas'] as $pData) {
                if (isset($pData['pregunta_id']) && $pData['pregunta_id'] > 0) {
                    $pregunta = PreguntaCuestionario::find($pData['pregunta_id']);
                    if ($pregunta) {
                        $pregunta->update([
                            'cabecera'       => $pData['cabecera'],
                            'valor_nota'     => $pData['valor_nota'],
                            'recurso_imagen' => $pData['recurso_imagen'] ?? null,
                        ]);
                    }
                } else {
                    $pregunta = PreguntaCuestionario::create([
                        'id_cuestionario' => $cuestionario->cuestionario_id,
                        'cabecera'       => $pData['cabecera'],
                        'valor_nota'     => $pData['valor_nota'],
                        'recurso_imagen' => $pData['recurso_imagen'] ?? null,
                        'cuerpo'         => $pData['cuerpo'] ?? '',
                        'tipo_respuesta' => 1, // Múltiple
                    ]);
                }

                // Alternativas
                if ($pregunta) {
                    $incomingAltIds = collect($pData['alternativas'])->pluck('alternativa_id')->filter(fn($id) => is_numeric($id) && $id > 0)->toArray();
                    
                    AlternativaPregunta::where('id_pregunta', $pregunta->pregunta_id)
                        ->whereNotIn('alternativa_id', $incomingAltIds)
                        ->delete();

                    foreach ($pData['alternativas'] as $aData) {
                        if (isset($aData['alternativa_id']) && $aData['alternativa_id'] > 0) {
                            $alt = AlternativaPregunta::find($aData['alternativa_id']);
                            if($alt) {
                                $alt->update([
                                    'contenido'  => $aData['contenido'],
                                    'estado_res' => $aData['estado_res'],
                                ]);
                            }
                        } else {
                            AlternativaPregunta::create([
                                'id_pregunta' => $pregunta->pregunta_id,
                                'contenido'   => $aData['contenido'],
                                'estado_res'  => $aData['estado_res'],
                            ]);
                        }
                    }
                }
            }

            DB::commit();
            return response()->json(['message' => 'Cuestionario guardado exitosamente.']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error interno al guardar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Sube una imagen para una pregunta del cuestionario.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('quizzes/questions', 'public');
            
            return response()->json([
                'path' => $path,
                'url' => Storage::disk('public')->url($path)
            ]);
        }

        return response()->json(['message' => 'No se pudo subir la imagen.'], 400);
    }
}
