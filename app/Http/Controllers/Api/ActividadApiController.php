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
}
