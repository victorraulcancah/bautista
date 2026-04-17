<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSeccionRequest;
use App\Http\Requests\UpdateSeccionRequest;
use App\Http\Resources\SeccionResource;
use App\Services\Interfaces\SeccionServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SeccionApiController extends Controller
{
    public function __construct(
        private readonly SeccionServiceInterface $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return SeccionResource::collection($this->service->listar(
            instiId: $request->user()->insti_id,
            search:  $request->get('search') ?? '',
            perPage: (int) $request->get('per_page', 20),
            gradoId: $request->has('grado_id') ? (int) $request->get('grado_id') : null,
        ));
    }

    public function show(int $id): SeccionResource
    {
        return new SeccionResource($this->service->obtener($id));
    }

    public function store(StoreSeccionRequest $request): JsonResponse
    {
        return (new SeccionResource($this->service->crear($request->validated())))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateSeccionRequest $request, int $id): SeccionResource
    {
        return new SeccionResource($this->service->actualizar($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);

        return response()->json(null, 204);
    }
}
