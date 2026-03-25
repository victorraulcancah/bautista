<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGradoRequest;
use App\Http\Requests\UpdateGradoRequest;
use App\Http\Resources\GradoResource;
use App\Services\Interfaces\GradoServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GradoApiController extends Controller
{
    public function __construct(
        private readonly GradoServiceInterface $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return GradoResource::collection($this->service->listar(
            instiId: $request->user()->insti_id,
            search:  $request->get('search', ''),
            perPage: (int) $request->get('per_page', 20),
        ));
    }

    public function show(int $id): GradoResource
    {
        return new GradoResource($this->service->obtener($id));
    }

    public function store(StoreGradoRequest $request): JsonResponse
    {
        return (new GradoResource($this->service->crear($request->validated())))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateGradoRequest $request, int $id): GradoResource
    {
        return new GradoResource($this->service->actualizar($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);

        return response()->json(null, 204);
    }
}
