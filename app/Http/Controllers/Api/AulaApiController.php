<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAulaRequest;
use App\Http\Requests\UpdateAulaRequest;
use App\Http\Resources\AulaResource;
use App\Services\Interfaces\AulaServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AulaApiController extends Controller
{
    public function __construct(
        private readonly AulaServiceInterface $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return AulaResource::collection($this->service->listar(
            instiId: $request->user()->insti_id,
            search:  $request->get('search') ?? '',
            perPage: (int) $request->get('per_page', 20),
        ));
    }

    public function show(int $id): AulaResource
    {
        return new AulaResource($this->service->obtener($id));
    }

    public function store(StoreAulaRequest $request): JsonResponse
    {
        $aula = $this->service->crear(array_merge(
            $request->validated(),
            ['insti_id' => $request->user()->insti_id],
        ));

        return (new AulaResource($aula))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateAulaRequest $request, int $id): AulaResource
    {
        return new AulaResource($this->service->actualizar($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);

        return response()->json(null, 204);
    }

    public function all(Request $request): AnonymousResourceCollection
    {
        return AulaResource::collection($this->service->todos($request->user()->insti_id));
    }
}
