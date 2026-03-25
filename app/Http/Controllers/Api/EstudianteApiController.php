<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEstudianteRequest;
use App\Http\Requests\UpdateEstudianteRequest;
use App\Http\Resources\EstudianteResource;
use App\Services\Interfaces\EstudianteServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EstudianteApiController extends Controller
{
    public function __construct(
        private readonly EstudianteServiceInterface $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return EstudianteResource::collection($this->service->listar(
            instiId: $request->user()->insti_id,
            search:  $request->get('search', ''),
            perPage: (int) $request->get('per_page', 20),
        ));
    }

    public function show(int $id): EstudianteResource
    {
        return new EstudianteResource($this->service->obtener($id));
    }

    public function store(StoreEstudianteRequest $request): JsonResponse
    {
        $estudiante = $this->service->crear(array_merge(
            $request->validated(),
            ['insti_id' => $request->user()->insti_id],
        ));

        return (new EstudianteResource($estudiante))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateEstudianteRequest $request, int $id): EstudianteResource
    {
        return new EstudianteResource($this->service->actualizar($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);

        return response()->json(null, 204);
    }
}
