<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNivelEducativoRequest;
use App\Http\Requests\UpdateNivelEducativoRequest;
use App\Http\Resources\NivelEducativoResource;
use App\Services\Interfaces\NivelEducativoServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NivelEducativoApiController extends Controller
{
    public function __construct(
        private readonly NivelEducativoServiceInterface $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return NivelEducativoResource::collection($this->service->listar(
            instiId: $request->user()->insti_id,
            search:  $request->get('search') ?? '',
            perPage: (int) $request->get('per_page', 20),
        ));
    }

    public function show(int $id): NivelEducativoResource
    {
        return new NivelEducativoResource($this->service->obtener($id));
    }

    public function store(StoreNivelEducativoRequest $request): JsonResponse
    {
        $nivel = $this->service->crear(array_merge(
            $request->validated(),
            ['insti_id' => $request->user()->insti_id],
        ));

        return (new NivelEducativoResource($nivel))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateNivelEducativoRequest $request, int $id): NivelEducativoResource
    {
        return new NivelEducativoResource($this->service->actualizar($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);

        return response()->json(null, 204);
    }
}
