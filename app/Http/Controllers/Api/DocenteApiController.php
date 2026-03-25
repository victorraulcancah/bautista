<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocenteRequest;
use App\Http\Requests\UpdateDocenteRequest;
use App\Http\Resources\DocenteResource;
use App\Services\Interfaces\DocenteServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DocenteApiController extends Controller
{
    public function __construct(
        private readonly DocenteServiceInterface $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return DocenteResource::collection($this->service->listar(
            instiId: $request->user()->insti_id,
            search:  $request->get('search', ''),
            perPage: (int) $request->get('per_page', 20),
        ));
    }

    public function show(int $id): DocenteResource
    {
        return new DocenteResource($this->service->obtener($id));
    }

    public function store(StoreDocenteRequest $request): JsonResponse
    {
        $docente = $this->service->crear(array_merge(
            $request->validated(),
            ['id_insti' => $request->user()->insti_id],
        ));

        return (new DocenteResource($docente))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateDocenteRequest $request, int $id): DocenteResource
    {
        return new DocenteResource($this->service->actualizar($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);

        return response()->json(null, 204);
    }
}
