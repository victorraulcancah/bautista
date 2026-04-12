<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActividadRequest;
use App\Http\Requests\UpdateActividadRequest;
use App\Http\Resources\ActividadResource;
use App\Models\TipoActividad;
use App\Services\Interfaces\ActividadServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ActividadApiController extends Controller
{
    public function __construct(
        private readonly ActividadServiceInterface $service,
    ) {}

    /** Listar actividades de un curso */
    public function index(Request $request): AnonymousResourceCollection
    {
        return ActividadResource::collection($this->service->listar(
            cursoId: (int) $request->get('curso_id', 0),
            search:  $request->get('search') ?? '',
            perPage: (int) $request->get('per_page', 20),
        ));
    }

    /** Detalle + cuestionario + preguntas */
    public function show(int $id): ActividadResource
    {
        return new ActividadResource($this->service->obtener($id));
    }

    public function store(StoreActividadRequest $request): JsonResponse
    {
        $actividad = $this->service->crear($request->validated());
        return (new ActividadResource($actividad))->response()->setStatusCode(201);
    }

    public function update(UpdateActividadRequest $request, int $id): ActividadResource
    {
        return new ActividadResource($this->service->actualizar($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);
        return response()->json(null, 204);
    }

    /** Lookup table de tipos (para el select del formulario) */
    public function tipos(): JsonResponse
    {
        return response()->json(TipoActividad::orderBy('tipo_id')->get());
    }

    /** Guardar dibujo hecho en el Paint */
    public function guardarDibujo(Request $request): JsonResponse
    {
        $request->validate([
            'actividad_id' => 'required|exists:actividad_curso,actividad_id',
            'image' => 'required|string', // Base64
        ]);

        $user = $request->user();
        $student = \App\Models\Estudiante::where('user_id', $user->id)->first();
        
        if (!$student) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        }

        $image = $request->input('image');
        $image = str_replace('data:image/png;base64,', '', $image);
        $image = str_replace(' ', '+', $image);
        $imageData = base64_decode($image);

        $fileName = 'dibujo_' . $user->id . '_' . time() . '.png';
        $path = 'dibujos_alumnos/' . $fileName;

        \Storage::disk('public')->put($path, $imageData);

        // Record in database
        \DB::table('archivos_actividad')->insert([
            'id_actividad' => $request->input('actividad_id'),
            'origen' => 'e',
            'archivo' => $path,
            'nombre_archivo' => 'Mi Dibujo.png',
            'tipo_archivo' => 'png',
            'estudiante' => $student->estu_id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Dibujo guardado con éxito', 'path' => $path]);
    }

    /** Obtener entregas de una actividad */
    public function entregas(int $actividadId): JsonResponse
    {
        $actividad = ActividadCurso::findOrFail($actividadId);
        $cursoId = $actividad->id_curso;

        // Get all students enrolled in the course
        $estudiantes = \App\Models\Matricula::whereHas('seccion.docenteCursos', function($q) use ($cursoId) {
                $q->where('curso_id', $cursoId);
            })
            ->with(['estudiante.perfil'])
            ->get()
            ->map(function($m) {
                return $m->estudiante;
            });

        $data = $estudiantes->map(function($estu) use ($actividadId) {
            // Check for grade
            $notaRecord = \App\Models\NotaActividad::where('estu_id', $estu->estu_id)
                ->where('actividad_id', $actividadId)
                ->first();

            // Check for files
            $archivos = \DB::table('archivos_actividad')
                ->where('id_actividad', $actividadId)
                ->where('estudiante', $estu->estu_id)
                ->where('origen', 'e')
                ->get();

            // Check for exam attempt
            $intento = \App\Models\ExamenIniciado::where('actividad_id', $actividadId)
                ->where('estu_id', $estu->estu_id)
                ->with(['respuestas.pregunta'])
                ->first();

            $estado = 'pendiente';
            if ($notaRecord) {
                $estado = 'calificado';
            } elseif ($archivos->count() > 0 || ($intento && $intento->estado == '0')) {
                $estado = 'entregado';
            }

            return [
                'entrega_id' => $estu->estu_id,
                'estudiante' => [
                    'estu_id' => $estu->estu_id,
                    'nombre' => $estu->perfil->primer_nombre,
                    'apellido_paterno' => $estu->perfil->apellido_paterno,
                    'apellido_materno' => $estu->perfil->apellido_materno,
                ],
                'archivos' => $archivos->map(fn($a) => [
                    'archivo_id' => $a->archiv_actividad_id,
                    'nombre' => $a->nombre_archivo,
                    'path' => $a->archivo,
                ]),
                'intento' => $intento ? [
                    'intento_id' => $intento->intento_id,
                    'fecha_inicio' => $intento->fecha_inicio,
                    'fecha_fin' => $intento->fecha_fin,
                    'puntaje_total' => $intento->puntaje_total,
                    'estado' => $intento->estado,
                    'respuestas' => $intento->respuestas->map(fn($r) => [
                        'pregunta' => $r->pregunta->cabecera,
                        'tipo' => $r->pregunta->tipo_respuesta,
                        'respuesta_estudiante' => $r->respuesta_texto,
                        'alternativa_id' => $r->alternativa_id,
                        'es_correcta' => $r->es_correcta,
                        'puntaje' => $r->puntaje,
                    ]),
                ] : null,
                'fecha_entrega' => $archivos->first()?->created_at ?? $intento?->fecha_fin ?? $intento?->fecha_inicio,
                'nota' => $notaRecord?->nota,
                'observacion' => $notaRecord?->observacion,
                'estado' => $estado,
            ];
        });

        return response()->json($data);
    }
}
