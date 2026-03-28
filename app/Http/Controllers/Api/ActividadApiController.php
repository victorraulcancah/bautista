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
}
