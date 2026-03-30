<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCursoRequest;
use App\Http\Requests\UpdateCursoRequest;
use App\Http\Resources\CursoResource;
use App\Services\Interfaces\CursoServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CursoApiController extends Controller
{
    public function __construct(
        private readonly CursoServiceInterface $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return CursoResource::collection($this->service->listar(
            instiId: $request->user()->insti_id,
            search:  $request->get('search') ?? '',
            perPage: (int) $request->get('per_page', 20),
            gradoId: $request->get('grado_id') ? (int) $request->get('grado_id') : null,
            nivelId: $request->get('nivel_academico_id') ? (int) $request->get('nivel_academico_id') : null,
        ));
    }

    public function show(int $id): CursoResource
    {
        return new CursoResource($this->service->obtener($id));
    }

    public function store(StoreCursoRequest $request): JsonResponse
    {
        $curso = $this->service->crear(array_merge(
            $request->validated(),
            ['id_insti' => $request->user()->insti_id],
        ));

        return (new CursoResource($curso))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateCursoRequest $request, int $id): CursoResource
    {
        return new CursoResource($this->service->actualizar($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);

        return response()->json(null, 204);
    }
}
